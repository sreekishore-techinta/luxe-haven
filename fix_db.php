<?php
require_once 'api/config/db.php';

$conn = getDB();

$tables = [
    'master_categories',
    'master_sub_categories',
    'master_colours',
    'master_fabric_types',
    'master_sizes',
    'master_sleeve_types',
    'master_neck_types',
    'master_occasions',
    'master_patterns'
];

foreach ($tables as $table) {
    echo "Checking table: $table\n";

    // Check for image_path and description
    $res = $conn->query("SHOW COLUMNS FROM $table");
    $columns = [];
    while ($row = $res->fetch_assoc()) {
        $columns[] = $row['Field'];
    }

    if (in_array('image_path', $columns)) {
        echo "Removing image_path from $table\n";
        $conn->query("ALTER TABLE $table DROP COLUMN image_path");
    }
    if (in_array('description', $columns)) {
        echo "Removing description from $table\n";
        $conn->query("ALTER TABLE $table DROP COLUMN description");
    }

    // Add sort_order if missing
    if (!in_array('sort_order', $columns)) {
        echo "Adding sort_order to $table\n";
        $conn->query("ALTER TABLE $table ADD COLUMN sort_order INT DEFAULT 0 AFTER status");
    }

    // Add updated_at if missing
    if (!in_array('updated_at', $columns)) {
        echo "Adding updated_at to $table\n";
        $conn->query("ALTER TABLE $table ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    }
}

echo "Database fix complete.\n";
$conn->close();
?>