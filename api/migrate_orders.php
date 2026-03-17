<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'config/db.php';
$conn = getDB();

echo "Updating Orders table structure...\n";

$sql = "ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100) DEFAULT NULL AFTER order_number,
    ADD COLUMN IF NOT EXISTS payment_notes TEXT DEFAULT NULL AFTER payment_status,
    ADD COLUMN IF NOT EXISTS shipping_date DATE DEFAULT NULL AFTER tracking_number,
    ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20) DEFAULT NULL AFTER customer_phone,
    MODIFY COLUMN status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending'";

if ($conn->query($sql)) {
    echo "Orders table updated successfully.\n";
} else {
    echo "Error updating orders table: " . $conn->error . "\n";
}

$conn->close();
?>
