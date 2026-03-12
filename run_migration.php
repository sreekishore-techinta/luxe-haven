<?php
require_once 'api/config/db.php';
$conn = getDB();

// Add password_hash to customers if missing
$conn->query("ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) DEFAULT NULL AFTER pincode");

// Add shipping_pincode to orders if missing  
$conn->query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(10) DEFAULT NULL AFTER shipping_state");

echo "Migration completed successfully.\n";
$conn->close();
