<?php
require_once __DIR__ . '/../../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn = getDB();

// Self-healing: ensure table exists
$conn->query("CREATE TABLE IF NOT EXISTS logo_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    logo_url VARCHAR(500) NOT NULL DEFAULT '',
    original_filename VARCHAR(255) DEFAULT NULL,
    file_size INT DEFAULT 0,
    mime_type VARCHAR(100) DEFAULT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$conn->query("INSERT IGNORE INTO logo_settings (id, logo_url) VALUES (1, '')");

// ── Helper: delete old file from disk ──────────────────────
function deleteOldLogo(mysqli $conn): void {
    $res = $conn->query("SELECT logo_url FROM logo_settings WHERE id = 1");
    $row = $res ? $res->fetch_assoc() : null;
    if ($row && !empty($row['logo_url'])) {
        $oldPath = __DIR__ . '/../../../' . ltrim($row['logo_url'], '/');
        if (file_exists($oldPath)) {
            @unlink($oldPath);
        }
    }
}

// ── Handle logo removal ─────────────────────────────────────
if (!empty($_POST['remove_logo']) && $_POST['remove_logo'] === '1') {
    deleteOldLogo($conn);
    $conn->query("UPDATE logo_settings SET logo_url = '', original_filename = NULL, file_size = 0, mime_type = NULL WHERE id = 1");
    jsonResponse(['status' => 'success', 'message' => 'Logo removed', 'logo_url' => '', 'logo_full_url' => '']);
}

// ── Handle file upload ──────────────────────────────────────
if (!isset($_FILES['logo'])) {
    jsonResponse(['status' => 'error', 'message' => 'No logo file provided'], 400);
}

$file = $_FILES['logo'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['status' => 'error', 'message' => 'Upload error code: ' . $file['error']], 400);
}

// Validate MIME type
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
$allowedExts  = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
$ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$mime = mime_content_type($file['tmp_name']);

if (!in_array($ext, $allowedExts) || !in_array($mime, $allowedMimes)) {
    jsonResponse(['status' => 'error', 'message' => 'Invalid file type. Allowed: JPG, PNG, WEBP, GIF, SVG'], 400);
}

// Validate size (max 5 MB)
if ($file['size'] > 5 * 1024 * 1024) {
    jsonResponse(['status' => 'error', 'message' => 'File too large. Maximum size is 5 MB'], 400);
}

// Delete old logo file
deleteOldLogo($conn);

// Create upload directory
$uploadDir = __DIR__ . '/../../../uploads/logo/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Save new file
$filename   = 'logo_' . uniqid() . '.' . $ext;
$targetPath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    jsonResponse(['status' => 'error', 'message' => 'Failed to save the uploaded file'], 500);
}

$relativeUrl      = 'uploads/logo/' . $filename;
$originalFilename = $conn->real_escape_string($file['name']);
$fileSize         = (int) $file['size'];
$mimeEscaped      = $conn->real_escape_string($mime);
$urlEscaped       = $conn->real_escape_string($relativeUrl);

$conn->query("UPDATE logo_settings
              SET logo_url = '$urlEscaped',
                  original_filename = '$originalFilename',
                  file_size = $fileSize,
                  mime_type = '$mimeEscaped'
              WHERE id = 1");

$fullUrl = getBaseUrl() . $relativeUrl;

jsonResponse([
    'status'            => 'success',
    'message'           => 'Logo uploaded successfully',
    'logo_url'          => $relativeUrl,
    'logo_full_url'     => $fullUrl,
    'original_filename' => $file['name'],
    'file_size'         => $fileSize,
    'mime_type'         => $mime,
]);

$conn->close();
