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
        if ($countStmt) {
            if ($types && $params) {
                $countStmt->bind_param($types, ...$params);
            }
            $countStmt->execute();
            $total = $countStmt->get_result()->fetch_assoc()['total'];
            $countStmt->close();
        } else {
            $total = 0;
        }

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
        if ($stmt) {
            $stmt->bind_param($allTypes, ...$allParams);
            $stmt->execute();
            $orders = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
        } else {
            $orders = [];
        }
        $conn->close();

        jsonResponse([
            'status' => 'success',
            'data' => $orders,
            'total' => (int) $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => (int) ceil(($total ?: 1) / $per_page),
        ]);
        break;

    // ─── POST: Create new order ──────────────────────────────────────────
    case 'POST':
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);
        if (!is_array($data)) {
            $data = $_POST;
        }

        if (!$data) {
            jsonResponse(['status' => 'error', 'message' => 'Invalid JSON payload'], 400);
        }

        $required = ['customer_name', 'customer_email', 'shipping_address', 'total', 'items'];
        foreach ($required as $f) {
            if (empty($data[$f])) {
                jsonResponse(['status' => 'error', 'message' => "Field '$f' is required"], 400);
            }
        }

        if (!is_array($data['items']) || count($data['items']) === 0) {
            jsonResponse(['status' => 'error', 'message' => 'Order must contain at least one item'], 400);
        }

        $conn->begin_transaction();

        try {
            // ── 1. Validate stock ──────────────────────────────────────────
            foreach ($data['items'] as $item) {
                if (!empty($item['product_id'])) {
                    $pId = (int) $item['product_id'];
                    $qty = max(1, (int) ($item['quantity'] ?? 1));

                    $chk = $conn->prepare("SELECT stock_qty, stock_quantity, status, name FROM products WHERE id = ? FOR UPDATE");
                    if (!$chk) {
                        throw new Exception("Product check failed: " . $conn->error);
                    }
                    $chk->bind_param("i", $pId);
                    $chk->execute();
                    $prod = $chk->get_result()->fetch_assoc();
                    $chk->close();

                    if (!$prod) {
                        throw new Exception("Product ID $pId not found");
                    }

                    $availableStock = (int) ($prod['stock_quantity'] ?? $prod['stock_qty'] ?? 50);
                    if ($prod['status'] === 'Out of Stock' || $availableStock < $qty) {
                        throw new Exception("'{$prod['name']}' does not have enough stock (available: {$availableStock})");
                    }
                }
            }

            // ── 2. Look up or create customer record ───────────────────────
            $custEmail = trim($data['customer_email']);
            $custStmt = $conn->prepare("SELECT id FROM customers WHERE email = ? LIMIT 1");
            $custStmt->bind_param("s", $custEmail);
            $custStmt->execute();
            $custRow = $custStmt->get_result()->fetch_assoc();
            $custStmt->close();

            $customerId = null;
            if ($custRow) {
                $customerId = (int) $custRow['id'];
            } else {
                $cName = trim($data['customer_name']);
                $cPhone = trim($data['customer_phone'] ?? '');
                $cStmt = $conn->prepare("INSERT INTO customers (name, email, phone, is_active) VALUES (?, ?, ?, 1)");
                if ($cStmt) {
                    $cStmt->bind_param("sss", $cName, $custEmail, $cPhone);
                    if ($cStmt->execute()) {
                        $customerId = $cStmt->insert_id;
                    }
                    $cStmt->close();
                }
            }

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

            $customerPhone = $data['customer_phone'] ?? '';
            $shippingAddr = $data['shipping_address'];
            $orderStatus = 'Pending';

            $insertOrderSql = "INSERT INTO orders (
                order_number, customer_id, user_id, customer_name, customer_email, customer_phone,
                shipping_address, shipping_city, shipping_state, shipping_pincode,
                billing_name, billing_address, billing_city, billing_state, billing_pincode,
                subtotal, shipping_charge, total, total_amount, payment_method, payment_status, status, order_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $conn->prepare($insertOrderSql);
            if (!$stmt) {
                throw new Exception("Order prepare failed: " . $conn->error);
            }

            $stmt->bind_param(
                "siissssssssssssddddssss",
                $orderNum,
                $customerId,
                $customerId,
                $data['customer_name'],
                $data['customer_email'],
                $customerPhone,
                $shippingAddr,
                $city,
                $state,
                $pincode,
                $bName,
                $bAddr,
                $bCity,
                $bState,
                $bPincode,
                $subtotal,
                $shipping,
                $total,
                $total,
                $payMethod,
                $payStatus,
                $orderStatus,
                $orderStatus
            );

            if (!$stmt->execute()) {
                throw new Exception("Order creation failed: " . $stmt->error);
            }
            $orderId = $stmt->insert_id;
            $stmt->close();

            // ── 4. Insert order items + deduct stock ──────────────────────
            $iStmt = $conn->prepare(
                "INSERT INTO order_items (order_id, product_id, product_name, product_sku, stitching_service, has_gift_wrapping, selected_add_ons, quantity, unit_price, total_price)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );

            if (!$iStmt) {
                throw new Exception("Order items prepare failed: " . $conn->error);
            }

            foreach ($data['items'] as $item) {
                $pId = !empty($item['product_id']) ? (int) $item['product_id'] : null;
                $qty = max(1, (int) ($item['quantity'] ?? 1));
                $uPrice = (float) $item['unit_price'];
                $tPrice = $qty * $uPrice;
                $sku = $item['sku'] ?? '';
                $pName = $item['product_name'] ?? 'Product';
                $stitching = $item['stitching_service'] ?? null;
                $giftWrap = (int)($item['has_gift_wrapping'] ?? 0);
                $selectedAddOns = is_string($item['selected_add_ons'] ?? null)
                    ? $item['selected_add_ons']
                    : json_encode($item['selected_add_ons'] ?? []);

                $iStmt->bind_param("iisssisidd", $orderId, $pId, $pName, $sku, $stitching, $giftWrap, $selectedAddOns, $qty, $uPrice, $tPrice);
                if (!$iStmt->execute()) {
                    throw new Exception("Item insert failed: " . $iStmt->error);
                }

                if ($pId) {
                    $upd = $conn->prepare(
                        "UPDATE products 
                         SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, stock_qty, 50) - ?),
                             stock_qty = GREATEST(0, COALESCE(stock_qty, stock_quantity, 50) - ?),
                             status = CASE 
                                 WHEN GREATEST(0, COALESCE(stock_qty, 50) - ?) <= 0 THEN 'Out of Stock'
                                 WHEN GREATEST(0, COALESCE(stock_qty, 50) - ?) < 10 THEN 'Low Stock'
                                 ELSE 'In Stock'
                             END,
                             availability_status = CASE 
                                 WHEN GREATEST(0, COALESCE(stock_qty, 50) - ?) <= 0 THEN 'Out of Stock'
                                 WHEN GREATEST(0, COALESCE(stock_qty, 50) - ?) < 10 THEN 'Low Stock'
                                 ELSE 'In Stock'
                             END
                         WHERE id = ?"
                    );
                    if ($upd) {
                        $upd->bind_param("iiiiiii", $qty, $qty, $qty, $qty, $qty, $qty, $pId);
                        $upd->execute();
                        $upd->close();
                    }
                }
            }
            $iStmt->close();

            // ── 5. Commit transaction ─────────────────────────────────────
            $conn->commit();

            if ($customerId) {
                $statsStmt = $conn->prepare(
                    "UPDATE customers 
                     SET total_orders = total_orders + 1, 
                         total_spent  = total_spent + ?
                     WHERE id = ?"
                );
                if ($statsStmt) {
                    $statsStmt->bind_param("di", $total, $customerId);
                    $statsStmt->execute();
                    $statsStmt->close();
                }
            }

            $conn->close();

            jsonResponse([
                'status' => 'success',
                'message' => 'Order placed successfully',
                'order_number' => $orderNum,
                'order_id' => $orderId,
            ], 201);

        } catch (Throwable $e) {
            $conn->rollback();
            $conn->close();
            jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 400);
        }
        break;

    default:
        $conn->close();
        jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
