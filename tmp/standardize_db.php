<?php
require_once 'c:/xampp/htdocs/luxe-haven/api/config/db.php';
$conn = getDB();

echo "Standardizing tables for stock and order systems...\n";

// 1. Products Table
$checks = [
    'stock_quantity' => "ALTER TABLE products CHANGE stock stock_quantity INT NOT NULL DEFAULT 50",
];
foreach ($checks as $col => $sql) {
    if ($conn->query("SHOW COLUMNS FROM products LIKE '$col'")->num_rows == 0) {
        echo "Updating products column '$col'...\n";
        if (!$conn->query($sql))
            echo "Error: " . $conn->error . "\n";
    }
}

// Ensure stock_quantity defaults to 50 if empty
$conn->query("UPDATE products SET stock_quantity = 50 WHERE stock_quantity IS NULL OR stock_quantity = 0");

// 2. Orders Table (Aligning with specific request)
$orderUpdates = [
    'user_id' => "ALTER TABLE orders ADD user_id INT NULL AFTER id", // Alias for customer_id
    'total_amount' => "ALTER TABLE orders ADD total_amount DECIMAL(12,2) NULL", // Alias for total
    'order_status' => "ALTER TABLE orders ADD order_status VARCHAR(50) DEFAULT 'Pending'", // Alias for status
];
foreach ($orderUpdates as $col => $sql) {
    if ($conn->query("SHOW COLUMNS FROM orders LIKE '$col'")->num_rows == 0) {
        echo "Adding order column '$col'...\n";
        $conn->query($sql);
    }
}

// 3. Order Items Table
if ($conn->query("SHOW COLUMNS FROM order_items LIKE 'product_id'")->num_rows == 0) {
    echo "Alert: product_id missing in order_items. This should not happen.\n";
}

echo "Standardization complete.\n";
$conn->close();
?>