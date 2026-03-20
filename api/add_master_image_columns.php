<?php
require_once 'config/db.php';
$conn = getDB();

$migrations = [
    // Ensure master_categories has hero_image + image columns
    "ALTER TABLE master_categories ADD COLUMN IF NOT EXISTS hero_image VARCHAR(500) DEFAULT NULL",
    "ALTER TABLE master_categories ADD COLUMN IF NOT EXISTS image VARCHAR(500) DEFAULT NULL",

    // Ensure master_sub_categories has image column
    "ALTER TABLE master_sub_categories ADD COLUMN IF NOT EXISTS image VARCHAR(500) DEFAULT NULL",
    "ALTER TABLE master_sub_categories ADD COLUMN IF NOT EXISTS hero_image VARCHAR(500) DEFAULT NULL",

    // Ensure saree_types has image + hero_image columns
    "ALTER TABLE saree_types ADD COLUMN IF NOT EXISTS image VARCHAR(500) DEFAULT NULL",
    "ALTER TABLE saree_types ADD COLUMN IF NOT EXISTS hero_image VARCHAR(500) DEFAULT NULL",
];

foreach ($migrations as $sql) {
    if ($conn->query($sql)) {
        echo "✓ " . substr($sql, 0, 80) . "...<br>";
    } else {
        echo "✗ Error: " . $conn->error . "<br>";
    }
}

echo "<br><strong>Done! All image columns verified.</strong><br>";

// Show current columns for verification
foreach (['master_categories', 'master_sub_categories', 'saree_types'] as $table) {
    echo "<br><strong>$table columns:</strong><br>";
    $res = $conn->query("DESCRIBE $table");
    while ($row = $res->fetch_assoc()) {
        echo "  - {$row['Field']} ({$row['Type']})<br>";
    }
}

$conn->close();
?>
