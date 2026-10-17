<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

// Self-healing: ensure settings table exists with seed data
$conn->query("CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Seed defaults if table is empty
$conn->query("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
    ('store_name',    'Luxe Haven Boutique'),
    ('public_notice', 'Exclusive Spring Collection is now live!'),
    ('support_email', 'support@luxehaven.com'),
    ('tax_rate',      '12'),
    ('maintenance_mode',    '0'),
    ('low_stock_threshold', '10')
");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('store_name', 'public_notice')");
    $settings = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
    }

    jsonResponse(['status' => 'success', 'data' => [
        'store_name'    => $settings['store_name']    ?? 'Luxe Haven',
        'public_notice' => $settings['public_notice'] ?? '',
    ]]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn->close();
