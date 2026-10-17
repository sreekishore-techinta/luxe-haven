<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

// Self-healing: ensure settings table exists
$conn->query("CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$conn->query("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
    ('store_name',          'Luxe Haven Boutique'),
    ('public_notice',       'Exclusive Spring Collection is now live!'),
    ('support_email',       'support@luxehaven.com'),
    ('tax_rate',            '12'),
    ('maintenance_mode',    '0'),
    ('low_stock_threshold', '10')
");

// Self-healing: ensure logo_settings table + seed row exist
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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch store settings
    $result = $conn->query("SELECT setting_key, setting_value FROM settings
                            WHERE setting_key IN ('store_name', 'public_notice')");
    $settings = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
    }

    // Fetch logo from logo_settings table
    $logoResult = $conn->query("SELECT logo_url FROM logo_settings WHERE id = 1");
    $logoRow    = $logoResult ? $logoResult->fetch_assoc() : null;
    $logoUrl    = $logoRow['logo_url'] ?? '';

    // Build absolute logo URL for frontend
    $logoFullUrl = '';
    if ($logoUrl) {
        $logoFullUrl = getBaseUrl() . ltrim($logoUrl, '/');
    }

    jsonResponse(['status' => 'success', 'data' => [
        'store_name'     => $settings['store_name']     ?? 'Luxe Haven',
        'public_notice'  => $settings['public_notice']  ?? '',
        'logo_url'       => $logoUrl,       // relative: uploads/logo/xxx.png
        'logo_full_url'  => $logoFullUrl,   // absolute: https://domain/uploads/logo/xxx.png
    ]]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn->close();
