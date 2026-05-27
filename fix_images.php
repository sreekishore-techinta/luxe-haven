<?php
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'api/config/db.php';
$conn = getDB();

echo "Fixing Duplicate Primary Images...\n";

// This complex query works around the 'You can't specify target table for update in FROM clause' error in MySQL
$conn->query("
    UPDATE product_images 
    SET is_primary = 0 
    WHERE is_primary = 1 
    AND id NOT IN (
        SELECT id FROM (
            SELECT MIN(id) as id 
            FROM product_images 
            WHERE is_primary = 1 
            GROUP BY product_id
        ) x
    )
");

echo "Repair Complete.\n";
?>
