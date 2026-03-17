<?php
require_once '../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['id']) || !isset($data['stock_quantity'])) {
    jsonResponse(['status' => 'error', 'message' => 'ID and stock_quantity are required'], 400);
}

$id = (int) $data['id'];
$stock = (int) $data['stock_quantity'];
$conn = getDB();

$avail = $stock <= 0 ? 'Out of Stock' : ($stock < 10 ? 'Low Stock' : 'In Stock');
$status = $stock <= 0 ? 'Out of Stock' : 'In Stock';

$stmt = $conn->prepare("UPDATE products SET stock_quantity = ?, stock_qty = ?, availability_status = ?, status = ? WHERE id = ?");
$stmt->bind_param("iissi", $stock, $stock, $avail, $status, $id);

if ($stmt->execute()) {
    jsonResponse(['status' => 'success', 'message' => 'Stock updated successfully']);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Update failed: ' . $conn->error], 500);
}

$stmt->close();
$conn->close();
?>
