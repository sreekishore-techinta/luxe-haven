<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

// Self-healing: probe table; if broken (engine issue), drop and recreate fresh
$probe = $conn->query("SELECT 1 FROM saree_types LIMIT 1");
if ($probe === false) {
    $conn->query("DROP TABLE IF EXISTS saree_types");
}

$conn->query("CREATE TABLE IF NOT EXISTS saree_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    hero_image VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    show_on_menu TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Migrate: add columns that may be missing from an older schema
$conn->query("ALTER TABLE saree_types ADD COLUMN IF NOT EXISTS slug VARCHAR(255) DEFAULT NULL AFTER name");
$conn->query("ALTER TABLE saree_types ADD COLUMN IF NOT EXISTS hero_image VARCHAR(255) DEFAULT NULL AFTER image");
$conn->query("ALTER TABLE saree_types ADD COLUMN IF NOT EXISTS status ENUM('Active','Inactive') DEFAULT 'Active'");
$conn->query("ALTER TABLE saree_types ADD COLUMN IF NOT EXISTS show_on_menu TINYINT(1) DEFAULT 1");
$conn->query("ALTER TABLE saree_types ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0");

// Auto-generate any missing slugs
$conn->query("UPDATE saree_types SET slug = LOWER(REPLACE(REPLACE(name,' ','-'),'/','')) WHERE slug IS NULL OR slug = ''");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$sql = "SELECT * FROM saree_types WHERE status = 'Active' AND show_on_menu = 1 ORDER BY sort_order ASC, id ASC";
$result = $conn->query($sql);

if (!$result) {
    jsonResponse(['status' => 'error', 'message' => 'DB error: ' . $conn->error], 500);
}

$data = [];
while ($row = $result->fetch_assoc()) {
    if (!empty($row['image'])) {
        $row['image'] = ltrim($row['image'], '/');
    }
    $data[] = $row;
}

jsonResponse(['status' => 'success', 'data' => $data]);

$conn->close();
