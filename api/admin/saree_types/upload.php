<?php
require_once '../../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'POST required'], 405);
}

session_start();
if (!isset($_SESSION['admin_id'])) {
    jsonResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

if (empty($_FILES['image'])) {
    jsonResponse(['status' => 'error', 'message' => 'No image uploaded'], 400);
}

$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
$maxSize = 2 * 1024 * 1024; // 2MB
$uploadDir = dirname(__DIR__, 3) . '/uploads/saree_types/';
$uploadUrl = 'uploads/saree_types/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$file = $_FILES['image'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['status' => 'error', 'message' => 'Upload error: ' . $file['error']], 500);
}

if ($file['size'] > $maxSize) {
    jsonResponse(['status' => 'error', 'message' => 'File too large (max 2MB)'], 400);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$newName = 'saree_type_' . uniqid() . '.' . $ext;
$destPath = $uploadDir . $newName;

if (move_uploaded_file($file['tmp_name'], $destPath)) {
    $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
        . '://' . $_SERVER['HTTP_HOST'] . '/';
    jsonResponse([
        'status' => 'success',
        'message' => 'Image uploaded',
        'url' => $baseUrl . $uploadUrl . $newName
    ]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Failed to move file'], 500);
}
