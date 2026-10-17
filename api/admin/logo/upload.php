<?php
require_once __DIR__ . '/../../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn = getDB();

// ── Handle logo removal ─────────────────────────────────────
if (!empty($_POST['remove_logo']) && $_POST['remove_logo'] === '1') {
    // Delete existing file if stored locally
    $res = $conn->query("SELECT setting_value FROM settings WHERE setting_key = 'logo_url'");
    $row = $res ? $res->fetch_assoc() : null;
    if ($row && !empty($row['setting_value'])) {
        $oldPath = __DIR__ . '/../../../' . ltrim($row['setting_value'], '/');
        if (file_exists($oldPath)) {
            @unlink($oldPath);
        }
    }
    $conn->query("UPDATE settings SET setting_value = '' WHERE setting_key = 'logo_url'");
    jsonResponse(['status' => 'success', 'message' => 'Logo removed', 'logo_url' => '']);
}

// ── Handle file upload ──────────────────────────────────────
if (!isset($_FILES['logo'])) {
    jsonResponse(['status' => 'error', 'message' => 'No logo file provided'], 400);
}

$file = $_FILES['logo'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['status' => 'error', 'message' => 'Upload error code: ' . $file['error']], 400);
}

// Validate type
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
$allowedExts  = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
$ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$mime = mime_content_type($file['tmp_name']);

if (!in_array($ext, $allowedExts) || !in_array($mime, $allowedMimes)) {
    jsonResponse(['status' => 'error', 'message' => 'Invalid file type. Allowed: JPG, PNG, WEBP, GIF, SVG'], 400);
}

// Validate size (max 5 MB)
if ($file['size'] > 5 * 1024 * 1024) {
    jsonResponse(['status' => 'error', 'message' => 'File too large. Maximum size is 5MB'], 400);
}

$uploadDir = __DIR__ . '/../../../uploads/logo/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Delete old logo file if one already exists
$res = $conn->query("SELECT setting_value FROM settings WHERE setting_key = 'logo_url'");
$row = $res ? $res->fetch_assoc() : null;
if ($row && !empty($row['setting_value'])) {
    $oldPath = __DIR__ . '/../../../' . ltrim($row['setting_value'], '/');
    if (file_exists($oldPath)) {
        @unlink($oldPath);
    }
}

// Save new file
$filename   = 'logo_' . uniqid() . '.' . $ext;
$targetPath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    jsonResponse(['status' => 'error', 'message' => 'Failed to save file'], 500);
}

$relativeUrl = 'uploads/logo/' . $filename;

// Persist in settings table
$conn->query("INSERT INTO settings (setting_key, setting_value)
              VALUES ('logo_url', '" . $conn->real_escape_string($relativeUrl) . "')
              ON DUPLICATE KEY UPDATE setting_value = '" . $conn->real_escape_string($relativeUrl) . "'");

jsonResponse([
    'status'   => 'success',
    'message'  => 'Logo uploaded successfully',
    'logo_url' => $relativeUrl,
]);

$conn->close();
