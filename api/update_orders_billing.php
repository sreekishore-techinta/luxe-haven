<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config/db.php';
$conn = getDB();

$sql = "ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS billing_name VARCHAR(150) DEFAULT NULL AFTER shipping_pincode,
        ADD COLUMN IF NOT EXISTS billing_address TEXT DEFAULT NULL AFTER billing_name,
        ADD COLUMN IF NOT EXISTS billing_city VARCHAR(100) DEFAULT NULL AFTER billing_address,
        ADD COLUMN IF NOT EXISTS billing_state VARCHAR(100) DEFAULT NULL AFTER billing_city,
        ADD COLUMN IF NOT EXISTS billing_pincode VARCHAR(10) DEFAULT NULL AFTER billing_state";

echo "Attempting to update orders table...\n";
if ($conn->query($sql) === TRUE) {
    echo json_encode(['status' => 'success', 'message' => 'Orders table updated with billing columns']) . "\n";
} else {
    echo json_encode(['status' => 'error', 'message' => 'Error updating table: ' . $conn->error]) . "\n";
}

$conn->close();
?>
