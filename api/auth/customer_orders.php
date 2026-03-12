<?php
session_start();
require_once '../config/db.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Customer's own orders
    if (empty($_SESSION['customer_id'])) {
        jsonResponse(['status' => 'error', 'message' => 'Not authenticated'], 401);
    }
    $conn = getDB();
    $cid = (int) $_SESSION['customer_id'];

    $sql = "SELECT o.*, COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            WHERE o.customer_email = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC";
    $stmt = $conn->prepare($sql);
    // Match by email since customer_id may not be set on old orders
    $stmt->bind_param("s", $_SESSION['customer_email']);
    $stmt->execute();
    $orders = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $conn->close();

    jsonResponse(['status' => 'success', 'data' => $orders]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
