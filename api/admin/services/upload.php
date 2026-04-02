<?php
require_once __DIR__ . '/../../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

if (!isset($_FILES['image'])) {
    jsonResponse(['status' => 'error', 'message' => 'No image provided'], 400);
}

$file = $_FILES['image'];
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

if (!in_array(strtolower($ext), $allowed)) {
    jsonResponse(['status' => 'error', 'message' => 'Invalid file type'], 400);
}

$uploadDir = __DIR__ . '/../../../uploads/services/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$filename = uniqid('service_') . '.' . $ext;
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Relative URL for the frontend
    $fileUrl = 'uploads/services/' . $filename;
    jsonResponse([
        'status' => 'success',
        'message' => 'Image uploaded successfully',
        'url' => $fileUrl
    ]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Failed to move uploaded file'], 500);
}
