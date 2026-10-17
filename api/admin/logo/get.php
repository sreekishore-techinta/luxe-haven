<?php
require_once __DIR__ . '/../../config/db.php';
setCORSHeaders();

$conn = getDB();

// Ensure the logo setting row exists
$conn->query("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('logo_url', '')");

$result = $conn->query("SELECT setting_value FROM settings WHERE setting_key = 'logo_url'");
$row = $result ? $result->fetch_assoc() : null;
$logoUrl = $row ? $row['setting_value'] : '';

jsonResponse([
    'status'   => 'success',
    'logo_url' => $logoUrl,
]);

$conn->close();
