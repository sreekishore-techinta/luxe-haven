<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'config/db.php';
$conn = getDB();

echo "Starting Comprehensive Database Repair...\n";

$columns_to_add = [
    'slug' => "VARCHAR(255) DEFAULT NULL AFTER name",
    'category_id' => "INT DEFAULT NULL AFTER slug",
    'brand_id' => "INT DEFAULT NULL AFTER category_id",
    'mrp_price' => "DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER price",
    'discount' => "DECIMAL(10,2) DEFAULT 0.00 AFTER mrp_price",
    'stock' => "INT NOT NULL DEFAULT 0 AFTER discount",
    'sku' => "VARCHAR(100) DEFAULT NULL AFTER stock",
    'availability_status' => "ENUM('In Stock', 'Out of Stock', 'Low Stock') DEFAULT 'In Stock' AFTER sku",
    'status' => "ENUM('Active', 'Inactive', 'Out of Stock') DEFAULT 'Active' AFTER availability_status",
    'fabric' => "VARCHAR(100) DEFAULT NULL",
    'occasion' => "VARCHAR(100) DEFAULT NULL AFTER fabric",
    'color' => "VARCHAR(100) DEFAULT NULL AFTER occasion",
    'work_type' => "VARCHAR(100) DEFAULT NULL AFTER color",
    'blouse_included' => "TINYINT(1) DEFAULT 1 AFTER work_type",
    'saree_length' => "VARCHAR(50) DEFAULT NULL AFTER blouse_included",
    'meta_title' => "VARCHAR(255) DEFAULT NULL",
    'meta_description' => "TEXT DEFAULT NULL"
];

foreach ($columns_to_add as $col => $definition) {
    $check = $conn->query("SHOW COLUMNS FROM products LIKE '$col'");
    if ($check->num_rows == 0) {
        echo "Adding column: $col... ";
        if ($conn->query("ALTER TABLE products ADD COLUMN $col $definition")) {
            echo "SUCCESS\n";
        } else {
            echo "FAILED: " . $conn->error . "\n";
        }
    } else {
        echo "Column '$col' already exists.\n";
    }
}

// Special check for category vs category_id
$check_cat = $conn->query("SHOW COLUMNS FROM products LIKE 'category'");
if ($check_cat->num_rows > 0) {
    echo "Found old 'category' column. Migrating data to 'category_id'...\n";
    // Try to move data if category_id is empty
    $conn->query("UPDATE products SET category_id = category WHERE category_id IS NULL AND category REGEXP '^[0-9]+$'");
    echo "Done.\n";
}

echo "\nDatabase Repair Completed. Try saving the product again.\n";
$conn->close();
?>
