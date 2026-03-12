<?php
require_once '../config/db.php';
setCORSHeaders();

$id = (int) ($_GET['id'] ?? 0);
$conn = getDB();

if ($id <= 0)
    jsonResponse(['status' => 'error', 'message' => 'Valid customer ID required'], 400);

// Get customer
$stmt = $conn->prepare("SELECT * FROM customers WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$customer = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$customer)
    jsonResponse(['status' => 'error', 'message' => 'Customer not found'], 404);

// Get order history
$oStmt = $conn->prepare(
    "SELECT o.id, o.order_number, o.total, o.status, o.payment_method, o.created_at,
            COUNT(oi.id) as item_count
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.customer_email = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC"
);
$oStmt->bind_param("s", $customer['email']);
$oStmt->execute();
$orders = $oStmt->get_result()->fetch_all(MYSQLI_ASSOC);
$oStmt->close();
$conn->close();

$customer['orders'] = $orders;
jsonResponse(['status' => 'success', 'data' => $customer]);
