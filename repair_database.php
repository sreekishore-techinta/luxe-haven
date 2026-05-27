<?php
/**
 * DATABASE REPAIR SCRIPT
 * This script ensures all master tables have the necessary columns for the admin panel to function.
 * Specifically fixes the 'Unknown column status' error in saree_types.
 */

require_once 'api/config/db.php';

$conn = getDB();
echo "<h2>Luxe Haven Database Repair</h2>";
echo "Environment: " . (IS_LOCAL ? "Local" : "Live Production") . "<br><br>";

$tables = [
    'saree_types' => [
        'slug' => "VARCHAR(255) NOT NULL AFTER name",
        'status' => "ENUM('Active', 'Inactive') DEFAULT 'Active' AFTER description",
        'sort_order' => "INT DEFAULT 0 AFTER status",
        'show_on_menu' => "TINYINT(1) DEFAULT 1 AFTER sort_order",
        'is_featured' => "TINYINT(1) DEFAULT 0 AFTER show_on_menu",
        'hero_image' => "VARCHAR(255) NULL AFTER image"
    ],
    'master_categories' => [
        'status' => "ENUM('Active', 'Inactive') DEFAULT 'Active' AFTER name",
        'sort_order' => "INT DEFAULT 0 AFTER status"
    ],
    'master_sub_categories' => [
        'status' => "ENUM('Active', 'Inactive') DEFAULT 'Active' AFTER name",
        'sort_order' => "INT DEFAULT 0 AFTER status"
    ],
    'master_colours' => [
        'status' => "ENUM('Active', 'Inactive') DEFAULT 'Active' AFTER name",
        'sort_order' => "INT DEFAULT 0 AFTER status"
    ],
    'master_fabric_types' => [
        'status' => "ENUM('Active', 'Inactive') DEFAULT 'Active' AFTER name",
        'sort_order' => "INT DEFAULT 0 AFTER status"
    ],
    'master_sizes' => [
        'status' => "ENUM('Active', 'Inactive') DEFAULT 'Active' AFTER name",
        'sort_order' => "INT DEFAULT 0 AFTER status"
    ],
    'blouse_styles' => [
        'status' => "ENUM('Active', 'Inactive') DEFAULT 'Active' AFTER description",
        'sort_order' => "INT DEFAULT 0 AFTER status"
    ],
    'add_ons' => [
        'status' => "ENUM('Active', 'Inactive') DEFAULT 'Active' AFTER name",
        'sort_order' => "INT DEFAULT 0 AFTER status"
    ]
];

foreach ($tables as $table => $columns) {
    echo "<strong>Checking table: $table</strong><br>";
    
    // Check if table exists
    $checkTable = $conn->query("SHOW TABLES LIKE '$table'");
    if ($checkTable->num_rows == 0) {
        echo "<span style='color:orange'>Table $table does not exist. Skipping.</span><br><br>";
        continue;
    }

    // Get current columns
    $result = $conn->query("DESCRIBE $table");
    $existing_columns = [];
    while ($row = $result->fetch_assoc()) {
        $existing_columns[] = $row['Field'];
    }

    foreach ($columns as $col => $definition) {
        if (!in_array($col, $existing_columns)) {
            echo "Adding column: $col... ";
            $sql = "ALTER TABLE $table ADD COLUMN $col $definition";
            if ($conn->query($sql)) {
                echo "<span style='color:green'>Success!</span><br>";
            } else {
                echo "<span style='color:red'>Failed: " . $conn->error . "</span><br>";
            }
        } else {
            echo "Column $col already exists.<br>";
        }
    }
    echo "<br>";
}

echo "<strong>Database repair complete.</strong><br>";
echo "You can now try adding saree types again in the admin panel.";

$conn->close();
?>
