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
        $data = json_decode(file_get_contents('php://input'), true);

        $required = ['customer_name', 'customer_email', 'shipping_address', 'total', 'items'];
        foreach ($required as $f) {
            if (empty($data[$f]))
                jsonResponse(['status' => 'error', 'message' => "Field '$f' required"], 400);
        }

        if (!filter_var($data['customer_email'], FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['status' => 'error', 'message' => 'Invalid email address'], 400);
        }

        // ── 1. Validate stock for EVERY item first ─────────────────────
        foreach ($data['items'] as $item) {
            if (!empty($item['product_id'])) {
                $pId = (int) $item['product_id'];
                $qty = (int) ($item['quantity'] ?? 1);
                $chk = $conn->prepare("SELECT stock_qty, status FROM products WHERE id = ?");
                $chk->bind_param("i", $pId);
                $chk->execute();
                $prod = $chk->get_result()->fetch_assoc();
                $chk->close();

                if (!$prod) {
                    jsonResponse(['status' => 'error', 'message' => "Product ID $pId not found"], 400);
                }
                if ($prod['status'] === 'Out of Stock' || $prod['stock_qty'] < $qty) {
                    jsonResponse([
                        'status' => 'error',
                        'message' => "'{$item['product_name']}' does not have enough stock (available: {$prod['stock_qty']})"
                    ], 400);
                }
            }
        }

        // ── 2. Look up or create customer record ───────────────────────
        $custEmail = $conn->real_escape_string($data['customer_email']);
        $custRow = $conn->query("SELECT id FROM customers WHERE email = '$custEmail' LIMIT 1")->fetch_assoc();
        $customerId = null;
        if ($custRow) {
            $customerId = (int) $custRow['id'];
        } else {
            // Create guest customer record
            $cName = $conn->real_escape_string($data['customer_name']);
            $cPhone = $conn->real_escape_string($data['customer_phone'] ?? '');
            $conn->query("INSERT INTO customers (name, email, phone, is_active) VALUES ('$cName', '$custEmail', '$cPhone', 1)");
            $customerId = $conn->insert_id ?: null;
        }

        // ── 3. Insert order ───────────────────────────────────────────
        $orderNum = '#' . strtoupper(substr(md5(uniqid()), 0, 6));
        $subtotal = (float) ($data['subtotal'] ?? $data['total']);
        $shipping = (float) ($data['shipping_charge'] ?? 0);
        $total = (float) $data['total'];
        $payMethod = $data['payment_method'] ?? 'COD';
        $pincode = $data['shipping_pincode'] ?? '';
        $state = $data['shipping_state'] ?? '';

        $stmt = $conn->prepare(
            "INSERT INTO orders (order_number, customer_id, customer_name, customer_email, customer_phone,
             shipping_address, shipping_city, shipping_state, shipping_pincode,
             subtotal, shipping_charge, total, payment_method, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')"
        );
        $customerPhone = $data['customer_phone'] ?? '';
        $shippingAddr = $data['shipping_address'];
        $shippingCity = $data['shipping_city'] ?? '';
        $customerName = $data['customer_name'];
        $customerEmail = $data['customer_email'];

        $stmt->bind_param(
            "sisssssssddds",
            $orderNum,
            $customerId,
            $customerName,
            $customerEmail,
            $customerPhone,
            $shippingAddr,
            $shippingCity,
            $state,
            $pincode,
            $subtotal,
            $shipping,
            $total,
            $payMethod
        );

        if (!$stmt->execute()) {
            jsonResponse(['status' => 'error', 'message' => 'Order creation failed: ' . $stmt->error], 500);
        }
        $orderId = $stmt->insert_id;
        $stmt->close();

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
            $iStmt->execute();
            $iStmt->close();

            // ── Deduct stock ────────────────────────────────────────
            if ($pId) {
                $conn->query(
                    "UPDATE products
                     SET stock_qty = GREATEST(0, stock_qty - $qty),
                         status = CASE
                             WHEN stock_qty - $qty <= 0  THEN 'Out of Stock'
                             WHEN stock_qty - $qty < 10  THEN 'Low Stock'
                             ELSE 'In Stock'
                         END
                     WHERE id = $pId"
                );
            }
        }

        // ── 5. Update customer stats ───────────────────────────────────
        if ($customerId) {
            $conn->query(
                "UPDATE customers
                 SET total_orders = total_orders + 1,
                     total_spent  = total_spent + $total
                 WHERE id = $customerId"
            );
        }

        $conn->close();
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
