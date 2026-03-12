<?php
require_once 'config/db.php';
$conn = getDB();

$tables = [
    'master_categories',
    'master_sub_categories'
];

foreach ($tables as $table) {
    echo "Adding sort_order to $table...\n";
    $res = $conn->query("SHOW COLUMNS FROM `$table` LIKE 'sort_order'");
    if ($res->num_rows == 0) {
        $conn->query("ALTER TABLE `$table` ADD COLUMN `sort_order` INT DEFAULT 0") or die($conn->error);
        echo " - Added sort_order\n";
    }
}

echo "\nMigration complete!\n";
$conn->close();
