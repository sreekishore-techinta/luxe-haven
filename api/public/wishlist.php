<?php
require_once '../config/db.php';
session_start();
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];

// Check if customer is logged in
if (empty($_SESSION['customer_id'])) {
    jsonResponse(['status' => 'error', 'message' => 'Unauthorized. Please login.', 'unauthorized' => true], 401);
}

$customer_id = $_SESSION['customer_id'];
$conn = getDB();

if ($method === 'GET') {
    // Fetch wishlist for current user
    $sql = "SELECT p.*, pi.image_path as primary_image
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $customer_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = [];
    while ($row = $result->fetch_assoc()) {
        if ($row['primary_image']) {
            $row['image'] = "http://localhost/luxe-haven/api/" . $row['primary_image'];
        } else {
            $row['image'] = "";
        }
        $data[] = $row;
    }
    jsonResponse(['status' => 'success', 'data' => $data]);

} elseif ($method === 'POST') {
    // Toggle wishlist
    $input = json_decode(file_get_contents('php://input'), true);
    $product_id = $input['product_id'] ?? null;

    if (!$product_id) {
        jsonResponse(['status' => 'error', 'message' => 'Product ID required'], 400);
    }

    // Check if exists
    $checkSql = "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?";
    $stmt = $conn->prepare($checkSql);
    $stmt->bind_param("ii", $customer_id, $product_id);
    $stmt->execute();
    $exists = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($exists) {
        // Remove
        $delSql = "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?";
        $stmt = $conn->prepare($delSql);
        $stmt->bind_param("ii", $customer_id, $product_id);
        $stmt->execute();
        jsonResponse(['status' => 'success', 'message' => 'Removed from wishlist', 'action' => 'removed']);
    } else {
        // Add
        $addSql = "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)";
        $stmt = $conn->prepare($addSql);
        $stmt->bind_param("ii", $customer_id, $product_id);
        if ($stmt->execute()) {
            jsonResponse(['status' => 'success', 'message' => 'Added to wishlist', 'action' => 'added']);
        } else {
            jsonResponse(['status' => 'error', 'message' => 'Database error: ' . $conn->error], 500);
        }
    }
} else {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
?>
