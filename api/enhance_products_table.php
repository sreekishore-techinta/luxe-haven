<?php
require_once 'config/db.php';
$conn = getDB();

echo "Enhancing Products Table...\n";

$sql = "ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS neck_type VARCHAR(100) DEFAULT NULL AFTER work_type,
    ADD COLUMN IF NOT EXISTS sleeve_type VARCHAR(100) DEFAULT NULL AFTER neck_type,
    ADD COLUMN IF NOT EXISTS pattern VARCHAR(100) DEFAULT NULL AFTER sleeve_type,
    ADD COLUMN IF NOT EXISTS is_new_arrival TINYINT(1) DEFAULT 0 AFTER is_bestseller,
    MODIFY COLUMN fabric VARCHAR(100) DEFAULT NULL,
    MODIFY COLUMN occasion VARCHAR(100) DEFAULT NULL,
    MODIFY COLUMN color VARCHAR(100) DEFAULT NULL";

if ($conn->query($sql)) {
    echo "Products table enhanced.\n";
} else {
    echo "Error: " . $conn->error . "\n";
}

$conn->close();
?>
