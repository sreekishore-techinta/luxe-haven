<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config/db.php';
$conn = getDB();

echo "Starting Product Master Migration...\n";

// 1. Create products table
$sql_products = "CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category_id INT DEFAULT NULL,
    sub_category_id INT DEFAULT NULL,
    brand_id INT DEFAULT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    mrp_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(5,2) DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    availability_status ENUM('In Stock', 'Out of Stock', 'Low Stock') DEFAULT 'In Stock',
    status ENUM('Active', 'Inactive', 'Out of Stock') DEFAULT 'Active',
    fabric VARCHAR(100),
    occasion VARCHAR(100),
    color VARCHAR(100),
    work_type VARCHAR(100),
    blouse_included TINYINT(1) DEFAULT 1,
    saree_length VARCHAR(50),
    image VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($conn->query($sql_products) === TRUE) {
    echo "Table 'products' ready.\n";
} else {
    echo "Error products table: " . $conn->error . "\n";
}

// 2. Create product_images table
$sql_images = "CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)";

if ($conn->query($sql_images) === TRUE) {
    echo "Table 'product_images' ready.\n";
} else {
    echo "Error product_images table: " . $conn->error . "\n";
}

// Check if image_url exists in product_images (to handle cases where table existed with image_path)
$res = $conn->query("SHOW COLUMNS FROM product_images LIKE 'image_url'");
if ($res->num_rows == 0) {
    $conn->query("ALTER TABLE product_images ADD COLUMN image_url VARCHAR(255) NOT NULL AFTER product_id");
}

// Check if is_primary exists
$res = $conn->query("SHOW COLUMNS FROM product_images LIKE 'is_primary'");
if ($res->num_rows == 0) {
    $conn->query("ALTER TABLE product_images ADD COLUMN is_primary TINYINT(1) DEFAULT 0 AFTER image_url");
}

// Check if status exists in products
$res = $conn->query("SHOW COLUMNS FROM products LIKE 'status'");
if ($res->num_rows == 0) {
    $conn->query("ALTER TABLE products ADD COLUMN status ENUM('Active', 'Inactive', 'Out of Stock') DEFAULT 'Active' AFTER availability_status");
}

// 3. Create masters
$conn->query("CREATE TABLE IF NOT EXISTS master_categories (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, status ENUM('Active', 'Inactive') DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
$conn->query("CREATE TABLE IF NOT EXISTS master_sub_categories (id INT AUTO_INCREMENT PRIMARY KEY, category_id INT NOT NULL, name VARCHAR(100) NOT NULL, status ENUM('Active', 'Inactive') DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
$conn->query("CREATE TABLE IF NOT EXISTS master_brands (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, status ENUM('Active', 'Inactive') DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

echo "Migration finished.\n";
$conn->close();
?>
