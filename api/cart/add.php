<?php
require_once '../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['product_id'])) {
    jsonResponse(['status' => 'error', 'message' => 'Product ID required'], 400);
}

$id = (int) $data['product_id'];
$qty = (int) ($data['quantity'] ?? 1);
$conn = getDB();

// Validate stock
$stmt = $conn->prepare("SELECT stock_quantity, status, name FROM products WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$prod = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$prod) {
    jsonResponse(['status' => 'error', 'message' => 'Product not found'], 404);
}

if ($prod['status'] === 'Out of Stock' || $prod['stock_quantity'] < $qty) {
    jsonResponse([
        'status' => 'error',
        'message' => "'{$prod['name']}' is out of stock or requested quantity exceeds available inventory."
    ], 400);
}

// In a full implementation, we would save to a 'cart_items' table here.
// For now, we just validate and return success to the frontend.
jsonResponse(['status' => 'success', 'message' => 'Stock validated and ready for cart']);

$conn->close();
?>
