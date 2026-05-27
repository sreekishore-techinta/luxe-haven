<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load the live database configuration
require_once __DIR__ . '/config/db.php';
$conn = getDB();

echo "<h3>Database Setup Tool</h3>";

// 1. Create add_ons table
$sql1 = "CREATE TABLE IF NOT EXISTS `add_ons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `input_type` enum('radio','checkbox') DEFAULT 'checkbox',
  `group_name` varchar(100) DEFAULT 'General',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if ($conn->query($sql1)) {
    echo "<p style='color:green'>✅ Master table 'add_ons' created successfully (or already exists).</p>";
} else {
    echo "<p style='color:red'>❌ Error creating add_ons: " . $conn->error . "</p>";
}

// 2. Add input_type column just in case the table existed but was missing columns
$sqlAlter1 = "ALTER TABLE `add_ons` ADD COLUMN IF NOT EXISTS `input_type` varchar(50) DEFAULT 'checkbox' AFTER `status`";
if ($conn->query($sqlAlter1)) {
    echo "<p style='color:green'>✅ Verified 'input_type' column.</p>";
}

// 3. Add group_name column
$sqlAlter2 = "ALTER TABLE `add_ons` ADD COLUMN IF NOT EXISTS `group_name` varchar(100) DEFAULT 'General' AFTER `input_type`";
if ($conn->query($sqlAlter2)) {
    echo "<p style='color:green'>✅ Verified 'group_name' column.</p>";
}

// 4. Create product_add_ons table
$sql2 = "CREATE TABLE IF NOT EXISTS `product_add_ons` (
  `product_id` int(11) NOT NULL,
  `add_on_id` int(11) NOT NULL,
  PRIMARY KEY (`product_id`,`add_on_id`),
  KEY `add_on_id` (`add_on_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if ($conn->query($sql2)) {
    echo "<p style='color:green'>✅ Linker table 'product_add_ons' created successfully (or already exists).</p>";
} else {
    echo "<p style='color:red'>❌ Error creating product_add_ons: " . $conn->error . "</p>";
}

echo "<hr><p><b>Setup Complete!</b> You can now test the 'Add Add-on Service' button in your admin panel.</p>";
?>
