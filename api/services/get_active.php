<?php
require_once __DIR__ . '/../config/db.php';
setCORSHeaders();

$conn = getDB();

// Self-healing: recreate table if broken (InnoDB engine issue) or missing
$tableOk = false;
$check = $conn->query("SELECT 1 FROM service_categories LIMIT 1");
if ($check !== false) {
    $tableOk = true;
} else {
    // Table missing or corrupt — drop and recreate clean
    $conn->query("DROP TABLE IF EXISTS service_categories");
    $conn->query("CREATE TABLE IF NOT EXISTS service_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        link_url VARCHAR(255) DEFAULT NULL,
        linked_category_id INT DEFAULT NULL,
        tag VARCHAR(50) DEFAULT NULL,
        display_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $tableOk = true;
}

if ($tableOk) {
    // Migration: add columns if they were missing from an older version
    $conn->query("ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS link_url VARCHAR(255) DEFAULT NULL AFTER image_url");
    $conn->query("ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS linked_category_id INT DEFAULT NULL AFTER link_url");
    $conn->query("ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS tag VARCHAR(50) DEFAULT NULL AFTER linked_category_id");
}

$sql = "SELECT id, title, image_url, link_url, linked_category_id, tag, display_order
        FROM service_categories
        WHERE is_active = 1
        ORDER BY display_order ASC, created_at DESC";

$result = $conn->query($sql);

if (!$result) {
    jsonResponse(['status' => 'error', 'message' => 'DB error: ' . $conn->error], 500);
}

$services = [];
while ($row = $result->fetch_assoc()) {
    $services[] = $row;
}

jsonResponse(['status' => 'success', 'data' => $services]);

$conn->close();
