<?php
require_once '../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    jsonResponse(['status' => 'error', 'message' => 'DELETE required'], 405);
}

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    jsonResponse(['status' => 'error', 'message' => 'Valid ID required'], 400);
}

$conn = getDB();

// 1. Get image path to delete file from disk if possible
$stmt = $conn->prepare("SELECT image_path FROM product_images WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result();
$img = $res->fetch_assoc();
$stmt->close();

if ($img) {
    $filePath = dirname(__DIR__, 2) . '/' . ltrim($img['image_path'], '/');
    if (file_exists($filePath) && is_file($filePath)) {
        unlink($filePath);
    }
}

// 2. Delete from database
$stmt = $conn->prepare("DELETE FROM product_images WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    jsonResponse(['status' => 'success', 'message' => 'Image deleted']);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Database error: ' . $conn->error], 500);
}

$stmt->close();
$conn->close();
?>
