<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

// Self-healing: probe table; if broken (engine issue), drop and recreate fresh
$probe = $conn->query("SELECT 1 FROM master_categories LIMIT 1");
if ($probe === false) {
    $conn->query("DROP TABLE IF EXISTS master_sub_categories");
    $conn->query("DROP TABLE IF EXISTS master_categories");
}

$conn->query("CREATE TABLE IF NOT EXISTS master_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) DEFAULT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    show_on_menu TINYINT(1) DEFAULT 1,
    is_featured TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Migrate: add columns that may be missing from older schema
$conn->query("ALTER TABLE master_categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100) DEFAULT NULL AFTER name");
$conn->query("ALTER TABLE master_categories ADD COLUMN IF NOT EXISTS show_on_menu TINYINT(1) DEFAULT 1 AFTER status");
$conn->query("ALTER TABLE master_categories ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) DEFAULT 0 AFTER show_on_menu");
$conn->query("ALTER TABLE master_categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0 AFTER is_featured");

$conn->query("CREATE TABLE IF NOT EXISTS master_sub_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("ALTER TABLE master_sub_categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100) DEFAULT NULL AFTER name");
$conn->query("ALTER TABLE master_sub_categories ADD COLUMN IF NOT EXISTS image VARCHAR(255) DEFAULT NULL AFTER slug");
$conn->query("ALTER TABLE master_sub_categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0 AFTER status");

// Auto-generate any missing slugs
$conn->query("UPDATE master_categories SET slug = LOWER(REPLACE(REPLACE(name,' ','-'),'/','')) WHERE slug IS NULL OR slug = ''");
$conn->query("UPDATE master_sub_categories SET slug = LOWER(REPLACE(REPLACE(name,' ','-'),'/','')) WHERE slug IS NULL OR slug = ''"  );

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$sql = "SELECT id, name, slug, show_on_menu, is_featured
        FROM master_categories
        WHERE status = 'Active'
        ORDER BY sort_order ASC, name ASC";
$result = $conn->query($sql);

if (!$result) {
    jsonResponse(['status' => 'error', 'message' => 'DB error: ' . $conn->error], 500);
}

$categories = [];
while ($cat = $result->fetch_assoc()) {
    $catId = (int) $cat['id'];

    $subSql = "SELECT id, name, slug, image
               FROM master_sub_categories
               WHERE category_id = $catId AND status = 'Active'
               ORDER BY sort_order ASC, name ASC";
    $subRes = $conn->query($subSql);

    $subCategories = [];
    if ($subRes) {
        while ($sub = $subRes->fetch_assoc()) {
            if (!empty($sub['image'])) {
                $sub['image'] = ltrim($sub['image'], '/');
            }
            $subCategories[] = $sub;
        }
    }

    $cat['sub_categories'] = $subCategories;
    $categories[] = $cat;
}

jsonResponse(['status' => 'success', 'data' => $categories]);

$conn->close();
