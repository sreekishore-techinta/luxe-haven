<?php
require_once '../config/db.php';
setCORSHeaders();

$id = (int) ($_GET['id'] ?? 0);
$conn = getDB();

if ($id <= 0) {
    jsonResponse(['status' => 'error', 'message' => 'Valid order ID required'], 400);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET: Single order with items ───────────────────────────────────
    case 'GET':
        $stmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $order = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$order)
            jsonResponse(['status' => 'error', 'message' => 'Order not found'], 404);

        // Get order items with product images
        $iStmt = $conn->prepare(
            "SELECT oi.*, pi.image_path
             FROM order_items oi
             LEFT JOIN product_images pi ON pi.product_id = oi.product_id AND pi.is_primary = 1
             WHERE oi.order_id = ?"
        );
        $iStmt->bind_param("i", $id);
        $iStmt->execute();
        $items = $iStmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $iStmt->close();
        $conn->close();

        $order['items'] = $items;
        jsonResponse(['status' => 'success', 'data' => $order]);
        break;

    // ─── PUT: Update order status / tracking ────────────────────────────
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $fields = [];
        $params = [];
        $types = "";

        $updatable = ['status', 'payment_status', 'tracking_number', 'notes', 'shipping_date', 'payment_id', 'payment_notes', 'shipping_phone'];
        foreach ($updatable as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "$f = ?";
                $params[] = $data[$f];
                $types .= "s";
            }
        }

        if (empty($fields)) {
            jsonResponse(['status' => 'error', 'message' => 'Nothing to update'], 400);
        }

        $params[] = $id;
        $types .= "i";
        $stmt = $conn->prepare("UPDATE orders SET " . implode(", ", $fields) . " WHERE id = ?");
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            $stmt->close();
            $conn->close();
            jsonResponse(['status' => 'success', 'message' => 'Order updated successfully']);
        } else {
            jsonResponse(['status' => 'error', 'message' => 'Update failed'], 500);
        }
        break;

    // ─── DELETE: Purge order and items ──────────────────────────────────
    case 'DELETE':
        $conn->begin_transaction();
        try {
            // 1. Delete order items first
            $st1 = $conn->prepare("DELETE FROM order_items WHERE order_id = ?");
            $st1->bind_param("i", $id);
            $st1->execute();
            $st1->close();

            // 2. Delete the order
            $st2 = $conn->prepare("DELETE FROM orders WHERE id = ?");
            $st2->bind_param("i", $id);
            $st2->execute();
            $st2->close();

            $conn->commit();
            $conn->close();
            jsonResponse(['status' => 'success', 'message' => 'Order purged successfully']);
        } catch (Exception $e) {
            $conn->rollback();
            $conn->close();
            jsonResponse(['status' => 'error', 'message' => 'Purge failed: ' . $e->getMessage()], 500);
        }
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
