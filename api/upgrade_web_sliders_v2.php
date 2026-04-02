<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/db.php';
$conn = getDB();

// 1. Create 'pages' table
$sqlPages = "CREATE TABLE IF NOT EXISTS site_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(100) NOT NULL,
    page_key VARCHAR(100) NOT NULL UNIQUE,
    page_type ENUM('home', 'category', 'user', 'collection', 'other') DEFAULT 'other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

$conn->query($sqlPages);

// 2. Create mapping table for sliders and pages
$sqlMapping = "CREATE TABLE IF NOT EXISTS web_slider_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slider_id INT NOT NULL,
    page_key VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (slider_id) REFERENCES web_sliders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

$conn->query($sqlMapping);

// 3. Seed site_pages
$pages = [
    // Main Pages
    ['Home', 'home', 'home'],
    ['New Arrivals', 'new-arrivals', 'collection'],
    ['All Categories', 'categories', 'collection'],
    ['Saree Collection', 'saree-collection', 'collection'],
    ['Saree Categories', 'saree-categories', 'collection'],
    
    // Category Pages
    ['Banarasi', 'banarasi', 'category'],
    ['Bridal', 'bridal', 'category'],
    ['Kanjivaram', 'kanjivaram', 'category'],
    ['Blouse', 'blouse', 'category'],
    ['Suits', 'suits', 'category'],
    ['Sets', 'sets', 'category'],
    
    // User Pages
    ['My Account', 'my_account', 'user'],
    ['Wishlist', 'wishlist', 'user'],
    ['Cart', 'cart', 'user'],
    ['Checkout', 'checkout', 'user']
];

foreach ($pages as $p) {
    $stmt = $conn->prepare("INSERT IGNORE INTO site_pages (page_name, page_key, page_type) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $p[0], $p[1], $p[2]);
    $stmt->execute();
}

// 4. Migrate existing slider page mappings
$res = $conn->query("SELECT id, page_name FROM web_sliders");
while ($row = $res->fetch_assoc()) {
    $slider_id = $row['id'];
    $page_key = strtolower($row['page_name']); // Simple fallback migration
    
    // Check if mapping already exists
    $check = $conn->query("SELECT id FROM web_slider_pages WHERE slider_id = $slider_id AND page_key = '$page_key'");
    if ($check->num_rows == 0) {
        $conn->query("INSERT INTO web_slider_pages (slider_id, page_key) VALUES ($slider_id, '$page_key')");
    }
}

echo "Database upgraded successfully. 'site_pages' and 'web_slider_pages' are ready.";
