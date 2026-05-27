<?php
define('IS_LOCAL', true);
require_once 'api/config/db.php';
$conn = getDB();

// 1. Create table if not exists (already exists but just in case)
$conn->query("CREATE TABLE IF NOT EXISTS add_ons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    sort_order INT DEFAULT 0,
    input_type ENUM('radio', 'checkbox') DEFAULT 'checkbox',
    group_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)");

$conn->query("CREATE TABLE IF NOT EXISTS product_add_ons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    add_on_id INT NOT NULL,
    UNIQUE KEY (product_id, add_on_id)
)");

// 2. Clear old placeholders if any (optional, but let's just insert if not exists)
$services = [
    ['name' => 'Gift Wrapping', 'price' => 95.00, 'input_type' => 'checkbox', 'group_name' => 'General Services', 'sort_order' => 1],
    ['name' => 'None', 'price' => 0.00, 'input_type' => 'radio', 'group_name' => 'Stitching Services', 'sort_order' => 1],
    ['name' => 'FALLS & PICO', 'price' => 150.00, 'input_type' => 'radio', 'group_name' => 'Stitching Services', 'sort_order' => 2],
    ['name' => 'FALLS & PICO + KUCCHU (Tassels)', 'price' => 950.00, 'input_type' => 'radio', 'group_name' => 'Stitching Services', 'sort_order' => 3],
];

foreach ($services as $s) {
    $stmt = $conn->prepare("SELECT id FROM add_ons WHERE name = ? AND group_name = ?");
    $stmt->bind_param("ss", $s['name'], $s['group_name']);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        $istmt = $conn->prepare("INSERT INTO add_ons (name, price, input_type, group_name, sort_order) VALUES (?, ?, ?, ?, ?)");
        $istmt->bind_param("sdssi", $s['name'], $s['price'], $s['input_type'], $s['group_name'], $s['sort_order']);
        $istmt->execute();
        $istmt->close();
    }
    $stmt->close();
}

echo "Services seeded successfully.\n";
?>
