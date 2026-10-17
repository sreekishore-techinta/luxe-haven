<?php
require_once __DIR__ . '/../../config/db.php';
setCORSHeaders();

$conn = getDB();

// Self-healing: ensure table exists with seed row
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

$result = $conn->query("SELECT logo_url, original_filename, file_size, mime_type, updated_at FROM logo_settings WHERE id = 1");
$row = $result ? $result->fetch_assoc() : null;

$logoUrl = $row['logo_url'] ?? '';

// Build full URL for the frontend
$fullUrl = '';
if ($logoUrl) {
    $fullUrl = getBaseUrl() . ltrim($logoUrl, '/');
}

jsonResponse([
    'status'            => 'success',
    'logo_url'          => $logoUrl,          // relative path: uploads/logo/xxx.png
    'logo_full_url'     => $fullUrl,           // absolute URL for <img src>
    'original_filename' => $row['original_filename'] ?? '',
    'file_size'         => (int)($row['file_size'] ?? 0),
    'mime_type'         => $row['mime_type'] ?? '',
    'updated_at'        => $row['updated_at'] ?? '',
]);

$conn->close();
