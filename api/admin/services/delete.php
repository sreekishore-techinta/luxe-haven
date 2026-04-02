<?php
require_once __DIR__ . '/../../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn = getDB();

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    jsonResponse(['status' => 'error', 'message' => 'Invalid JSON input'], 400);
}

$id = (int)($data['id'] ?? 0);
if (!$id) {
    jsonResponse(['status' => 'error', 'message' => 'Service ID is required'], 400);
}

// Optional: Fetch image path to delete file from server
$fetchSql = "SELECT image_url FROM service_categories WHERE id = $id";
$res = $conn->query($fetchSql);
if ($res && $res->num_rows > 0) {
    $row = $res->fetch_assoc();
    $imagePath = __DIR__ . '/../../../' . $row['image_url'];
    if (file_exists($imagePath) && is_file($imagePath)) {
        unlink($imagePath);
    }
}

$sql = "DELETE FROM service_categories WHERE id = $id";

if ($conn->query($sql)) {
    jsonResponse([
        'status' => 'success',
        'message' => 'Service category deleted successfully'
    ]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'DATABASE ERROR: ' . $conn->error], 500);
}

$conn->close();
