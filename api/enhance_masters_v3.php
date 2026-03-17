<?php
require_once 'config/db.php';
$conn = getDB();

echo "Executing Enhancement Phase 3...\n";

// Saree Types enhancement
$sql_saree = "ALTER TABLE saree_types 
    ADD COLUMN IF NOT EXISTS slug VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS show_on_menu TINYINT(1) DEFAULT 1,
    ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT NULL";

if ($conn->query($sql_saree))
    echo "saree_types enhanced.\n";
else
    echo "Error saree_types: " . $conn->error . "\n";

// Master Sizes enhancement
$sql_sizes = "ALTER TABLE master_sizes 
    ADD COLUMN IF NOT EXISTS hip_size VARCHAR(50) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS sleeve_length VARCHAR(50) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS neck_depth VARCHAR(50) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS inseam VARCHAR(50) DEFAULT NULL";

if ($conn->query($sql_sizes))
    echo "master_sizes enhanced.\n";
else
    echo "Error master_sizes: " . $conn->error . "\n";

// Ensure slug columns exist for other tables
$tables = ['master_categories', 'master_brands'];
foreach ($tables as $table) {
    if ($conn->query("ALTER TABLE $table ADD COLUMN IF NOT EXISTS slug VARCHAR(255) DEFAULT NULL")) {
        echo "$table slug added.\n";
    }
}

// Master Sub-Categories slug (might be missing)
if ($conn->query("ALTER TABLE master_sub_categories ADD COLUMN IF NOT EXISTS slug VARCHAR(255) DEFAULT NULL AFTER category_id")) {
    echo "master_sub_categories slug added.\n";
}

$conn->close();
echo "Enhancement Phase 3 Complete.\n";
?>
