<?php
require_once 'config/db.php';
$conn = getDB();

echo "Adding Optional Customization Fields...\n";

// Categories
$sql_cat = "ALTER TABLE master_categories 
    ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS show_on_menu TINYINT(1) DEFAULT 1,
    ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT NULL";

if ($conn->query($sql_cat))
    echo "master_categories enhanced.\n";

// Sub-Categories
$sql_sub = "ALTER TABLE master_sub_categories 
    ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS show_on_menu TINYINT(1) DEFAULT 1,
    ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT NULL";

if ($conn->query($sql_sub))
    echo "master_sub_categories enhanced.\n";

// Brands
$sql_brand = "ALTER TABLE master_brands 
    ADD COLUMN IF NOT EXISTS image VARCHAR(255) DEFAULT NULL AFTER name,
    ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL AFTER image,
    ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS sort_order INT(11) DEFAULT 0";

if ($conn->query($sql_brand))
    echo "master_brands enhanced.\n";

$conn->close();
?>
