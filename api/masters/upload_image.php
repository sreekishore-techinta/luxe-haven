<?php
require_once '../config/db.php';
setCORSHeaders();

session_start();
if (!isset($_SESSION['admin_id'])) {
    jsonResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'POST required'], 405);
}

if (empty($_FILES['image'])) {
    jsonResponse(['status' => 'error', 'message' => 'No image uploaded'], 400);
}

$file     = $_FILES['image'];
$allowed  = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
$maxSize  = 5 * 1024 * 1024; // 5MB

if (!in_array($file['type'], $allowed)) {
    jsonResponse(['status' => 'error', 'message' => 'Only JPG, PNG, WebP allowed'], 400);
}
if ($file['size'] > $maxSize) {
    jsonResponse(['status' => 'error', 'message' => 'File too large (max 5MB)'], 400);
}
if ($file['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['status' => 'error', 'message' => 'Upload error: ' . $file['error']], 400);
}

// Save to uploads/masters/
$uploadDir = dirname(__DIR__, 2) . '/uploads/masters/';
$uploadUrl = 'uploads/masters/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$newName = 'master_' . uniqid() . '.' . $ext;
$dest    = $uploadDir . $newName;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    jsonResponse(['status' => 'error', 'message' => 'Failed to save file'], 500);
}

$relativePath = $uploadUrl . $newName;

// Optionally update the DB record directly if type + id are passed
$type = $_POST['type'] ?? '';
$id   = intval($_POST['id'] ?? 0);
$field = $_POST['field'] ?? 'image'; // 'image' or 'hero_image'

$allowedMasters = [
    'categories'     => 'master_categories',
    'sub_categories' => 'master_sub_categories',
    'saree_types'    => 'saree_types',
];

$allowedFields = ['image', 'hero_image'];

if ($type && $id > 0 && isset($allowedMasters[$type]) && in_array($field, $allowedFields)) {
    $conn  = getDB();
    $table = $allowedMasters[$type];
    // Check column exists
    $colRes = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$field'");
    if ($colRes && $colRes->num_rows > 0) {
        $path = sanitize($conn, $relativePath);
        $conn->query("UPDATE `$table` SET `$field` = '$path' WHERE id = $id");
    }
    $conn->close();
}

jsonResponse([
    'status' => 'success',
    'url'    => $relativePath,
    'message' => 'Image uploaded successfully'
]);
?>
