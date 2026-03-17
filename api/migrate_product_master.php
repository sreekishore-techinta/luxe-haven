<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config/db.php';
$conn = getDB();

echo "Starting database migration for Product Master...\n";

// 1. Create master_brands table
$sql_brands = "CREATE TABLE IF NOT EXISTS master_brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($conn->query($sql_brands) === TRUE) {
    echo "master_brands table ready.\n";
} else {
    echo "Error creating master_brands: " . $conn->error . "\n";
}

// 2. Add sub-category column to products if it doesn't exist
$sql_alter_products = "ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS slug VARCHAR(255) DEFAULT NULL AFTER name,
    ADD COLUMN IF NOT EXISTS sub_category_id INT DEFAULT NULL AFTER category,
    ADD COLUMN IF NOT EXISTS brand_id INT DEFAULT NULL AFTER sub_category_id,
    ADD COLUMN IF NOT EXISTS mrp_price DECIMAL(10,2) DEFAULT NULL AFTER price,
    ADD COLUMN IF NOT EXISTS discount DECIMAL(5,2) DEFAULT 0.00 AFTER mrp_price,
    ADD COLUMN IF NOT EXISTS occasion VARCHAR(100) DEFAULT NULL AFTER fabric,
    ADD COLUMN IF NOT EXISTS work_type VARCHAR(100) DEFAULT NULL AFTER occasion,
    ADD COLUMN IF NOT EXISTS blouse_included TINYINT(1) DEFAULT 1 AFTER work_type,
    ADD COLUMN IF NOT EXISTS saree_length VARCHAR(50) DEFAULT NULL AFTER blouse_included,
    ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT NULL,
    MODIFY COLUMN category INT DEFAULT NULL"; // Transitioning category to category_id

if ($conn->query($sql_alter_products) === TRUE) {
    echo "Products table structure updated.\n";
} else {
    echo "Error updating products table: " . $conn->error . "\n";
}

// 3. Update existing products: Map ENUM categories to INT IDs
// Map 'Sarees' -> 1, 'Blouses' -> 2, 'Suit Sets' -> 3 (assuming these are the order in master_categories)
// Let's ensure these categories exist in master_categories first
$conn->query("INSERT IGNORE INTO master_categories (id, name) VALUES (1, 'Sarees'), (2, 'Blouses'), (3, 'Suit Sets')");

// Now update the products category column from string to ID if it's still containing strings
$conn->query("UPDATE products SET category = 1 WHERE category = 'Sarees'");
$conn->query("UPDATE products SET category = 2 WHERE category = 'Blouses'");
$conn->query("UPDATE products SET category = 3 WHERE category = 'Suit Sets'");

// 4. Ensure mrp_price is set to price if null
$conn->query("UPDATE products SET mrp_price = price WHERE mrp_price IS NULL");

echo "Database migration completed for Product Master.\n";
$conn->close();
?>
