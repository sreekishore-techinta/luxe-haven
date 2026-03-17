<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET: List / Filter orders ───────────────────────────────────────
    case 'GET':
        $where = ["1=1"];
        $params = [];
        $types = "";

        if (!empty($_GET['search'])) {
            $s = "%" . $conn->real_escape_string($_GET['search']) . "%";
            $where[] = "(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ?)";
            $params = array_merge($params, [$s, $s, $s, $s]);
            $types .= "ssss";
        }
        if (!empty($_GET['status']) && $_GET['status'] !== 'All') {
            $where[] = "o.status = ?";
            $params[] = $_GET['status'];
            $types .= "s";
        }
        if (!empty($_GET['payment_status']) && $_GET['payment_status'] !== 'All') {
            $where[] = "o.payment_status = ?";
            $params[] = $_GET['payment_status'];
            $types .= "s";
        }
        if (!empty($_GET['date_from'])) {
            $where[] = "DATE(o.created_at) >= ?";
            $params[] = $_GET['date_from'];
            $types .= "s";
        }
        if (!empty($_GET['date_to'])) {
            $where[] = "DATE(o.created_at) <= ?";
            $params[] = $_GET['date_to'];
            $types .= "s";
        }

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $per_page = (int) ($_GET['per_page'] ?? 20);
        $offset = ($page - 1) * $per_page;
        $whereStr = implode(" AND ", $where);

        // Total count
        $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM orders o WHERE $whereStr");
        if ($types && $params)
            $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $total = $countStmt->get_result()->fetch_assoc()['total'];
        $countStmt->close();

        $sql = "SELECT o.*, 
                    COUNT(oi.id) as item_count,
                    GROUP_CONCAT(oi.product_name SEPARATOR ', ') as items_summary
                FROM orders o
                LEFT JOIN order_items oi ON oi.order_id = o.id
                WHERE $whereStr
                GROUP BY o.id
                ORDER BY o.created_at DESC
                LIMIT ? OFFSET ?";
        $allTypes = $types . "ii";
        $allParams = array_merge($params, [$per_page, $offset]);
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($allTypes, ...$allParams);
        $stmt->execute();
        $orders = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        $conn->close();

        jsonResponse([
            'status' => 'success',
            'data' => $orders,
            'total' => (int) $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => (int) ceil($total / $per_page),
        ]);
        break;

    // ─── POST: Create new order ──────────────────────────────────────────
    case 'POST':
        $logFile = 'c:/xampp/htdocs/luxe-haven/tmp/order_debug.log';
        $jsonInput = file_get_contents('php://input');
        file_put_contents($logFile, "Payload: $jsonInput\n", FILE_APPEND);

        $data = json_decode($jsonInput, true);

        if (!$data) {
            file_put_contents($logFile, "Error: Invalid JSON\n", FILE_APPEND);
            jsonResponse(['status' => 'error', 'message' => 'Invalid JSON payload'], 400);
        }

        $required = ['customer_name', 'customer_email', 'shipping_address', 'total', 'items'];
        foreach ($required as $f) {
            if (empty($data[$f])) {
                file_put_contents($logFile, "Error: Missing field $f\n", FILE_APPEND);
                jsonResponse(['status' => 'error', 'message' => "Field '$f' required"], 400);
            }
        }

        // ── 1. Start Transaction & Validate stock ─────────────────────
        $conn->begin_transaction();

        try {
            foreach ($data['items'] as $item) {
                if (!empty($item['product_id'])) {
                    $pId = (int) $item['product_id'];
                    $qty = (int) ($item['quantity'] ?? 1);

                    // Use FOR UPDATE to lock the row and prevent race conditions
                    $chk = $conn->prepare("SELECT stock_quantity, status, name FROM products WHERE id = ? FOR UPDATE");
                    $chk->bind_param("i", $pId);
                    $chk->execute();
                    $prod = $chk->get_result()->fetch_assoc();
                    $chk->close();

                    if (!$prod) {
                        throw new Exception("Product ID $pId not found");
                    }

                    $availableStock = (int) $prod['stock_quantity'];
                    if ($prod['status'] === 'Out of Stock' || $availableStock < $qty) {
                        throw new Exception("'{$prod['name']}' does not have enough stock (available: {$availableStock})");
                    }
                }
            }
        } catch (Exception $e) {
            $conn->rollback();
            file_put_contents($logFile, "Error: " . $e->getMessage() . "\n", FILE_APPEND);
            jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 400);
        }

        // ── 2. Look up or create customer record ───────────────────────
        $custEmail = $data['customer_email'];
        $custStmt = $conn->prepare("SELECT id FROM customers WHERE email = ? LIMIT 1");
        $custStmt->bind_param("s", $custEmail);
        $custStmt->execute();
        $custRow = $custStmt->get_result()->fetch_assoc();
        $custStmt->close();

        $customerId = null;
        if ($custRow) {
            $customerId = (int) $custRow['id'];
        } else {
            $cName = $data['customer_name'];
            $cPhone = $data['customer_phone'] ?? '';
            $cStmt = $conn->prepare("INSERT INTO customers (name, email, phone, is_active) VALUES (?, ?, ?, 1)");
            $cStmt->bind_param("sss", $cName, $custEmail, $cPhone);
            if ($cStmt->execute()) {
                $customerId = $conn->insert_id;
            }
            $cStmt->close();
        }
        file_put_contents($logFile, "Customer ID: $customerId\n", FILE_APPEND);

        // ── 3. Insert order ───────────────────────────────────────────
        $orderNum = '#' . strtoupper(substr(md5(uniqid()), 0, 6));
        $subtotal = (float) ($data['subtotal'] ?? $data['total']);
        $shipping = (float) ($data['shipping_charge'] ?? 0);
        $total = (float) $data['total'];
        $payMethod = $data['payment_method'] ?? 'COD';
        $pincode = $data['shipping_pincode'] ?? '';
        $state = $data['shipping_state'] ?? '';
        $city = $data['shipping_city'] ?? '';
        $payStatus = ($payMethod === 'COD') ? 'Pending' : 'Paid';

        $bName = $data['billing_name'] ?? $data['customer_name'];
        $bAddr = $data['billing_address'] ?? $data['shipping_address'];
        $bCity = $data['billing_city'] ?? $city;
        $bState = $data['billing_state'] ?? $state;
        $bPincode = $data['billing_pincode'] ?? $pincode;

        $stmt = $conn->prepare(
            "INSERT INTO orders (order_number, customer_id, user_id, customer_name, customer_email, customer_phone,
             shipping_address, shipping_city, shipping_state, shipping_pincode,
             billing_name, billing_address, billing_city, billing_state, billing_pincode,
             subtotal, shipping_charge, total, total_amount, payment_method, payment_status, status, order_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );

        $customerPhone = $data['customer_phone'] ?? '';
        $shippingAddr = $data['shipping_address'];
        $orderStatus = 'Pending';

        $stmt->bind_param(
            "siissssssssssssddddssss",
            $orderNum,       // 1
            $customerId,     // 2
            $customerId,     // 3 (user_id = customer_id)
            $data['customer_name'], // 4
            $data['customer_email'], // 5
            $customerPhone,  // 6
            $shippingAddr,   // 7
            $city,           // 8
            $state,          // 9
            $pincode,        // 10
            $bName,          // 11
            $bAddr,          // 12
            $bCity,          // 13
            $bState,         // 14
            $bPincode,       // 15
            $subtotal,       // 16
            $shipping,       // 17
            $total,          // 18
            $total,          // 19 (total_amount = total)
            $payMethod,      // 20
            $payStatus,      // 21
            $orderStatus,    // 22 (status)
            $orderStatus     // 23 (order_status)
        );

        if (!$stmt->execute()) {
            file_put_contents($logFile, "Order Execute Error: " . $stmt->error . "\n", FILE_APPEND);
            jsonResponse(['status' => 'error', 'message' => 'Order creation failed: ' . $stmt->error], 500);
        }
        $orderId = $stmt->insert_id;
        $stmt->close();
        file_put_contents($logFile, "Order ID: $orderId, Number: $orderNum\n", FILE_APPEND);

        // ── 4. Insert order items + deduct stock ──────────────────────
        foreach ($data['items'] as $item) {
            $pId = !empty($item['product_id']) ? (int) $item['product_id'] : null;
            $qty = (int) ($item['quantity'] ?? 1);
            $uPrice = (float) $item['unit_price'];
            $tPrice = $qty * $uPrice;
            $sku = $item['sku'] ?? '';
            $pName = $item['product_name'];

            $iStmt = $conn->prepare(
                "INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price)
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
            $iStmt->bind_param("iissidd", $orderId, $pId, $pName, $sku, $qty, $uPrice, $tPrice);
            if (!$iStmt->execute()) {
                file_put_contents($logFile, "Item Insert Error: " . $iStmt->error . "\n", FILE_APPEND);
            }
            $iStmt->close();

            if ($pId) {
                // Deduct only from stock_quantity column
                $upd = $conn->prepare(
                    "UPDATE products 
                     SET stock_quantity = GREATEST(0, stock_quantity - ?),
                         stock_qty = GREATEST(0, COALESCE(stock_qty, stock_quantity) - ?),
                         status = CASE 
                             WHEN GREATEST(0, stock_quantity - ?) <= 0 THEN 'Out of Stock'
                             WHEN GREATEST(0, stock_quantity - ?) < 10 THEN 'Low Stock'
                             ELSE 'In Stock'
                         END,
                         availability_status = CASE 
                             WHEN GREATEST(0, stock_quantity - ?) <= 0 THEN 'Out of Stock'
                             WHEN GREATEST(0, stock_quantity - ?) < 10 THEN 'Low Stock'
                             ELSE 'In Stock'
                         END
                     WHERE id = ?"
                );
                $upd->bind_param("iiiiiii", $qty, $qty, $qty, $qty, $qty, $qty, $pId);
                if (!$upd->execute()) {
                    file_put_contents($logFile, "Stock Update Error: " . $upd->error . "\n", FILE_APPEND);
                }
                $upd->close();
            }
        }

        // Commit everything
        $conn->commit();

        if ($customerId) {
            $statsStmt = $conn->prepare(
                "UPDATE customers 
                 SET total_orders = total_orders + 1, 
                     total_spent  = total_spent + ?
                 WHERE id = ?"
            );
            $statsStmt->bind_param("di", $total, $customerId);
            $statsStmt->execute();
            $statsStmt->close();
        }

        $conn->close();
        file_put_contents($logFile, "Order Success\n", FILE_APPEND);
        jsonResponse([
            'status' => 'success',
            'message' => 'Order placed successfully',
            'order_number' => $orderNum,
            'order_id' => $orderId,
        ], 201);
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
