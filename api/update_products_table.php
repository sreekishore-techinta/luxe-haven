<?php
require_once 'config/db.php';
$conn = getDB();

$sqls = [
    "ALTER TABLE products MODIFY category VARCHAR(100) NULL",
    "ALTER TABLE products ADD COLUMN sub_category_id INT NULL AFTER category",
    "ALTER TABLE products ADD COLUMN colour_id INT NULL AFTER sub_category_id",
    "ALTER TABLE products ADD COLUMN fabric_id INT NULL AFTER colour_id",
    "ALTER TABLE products ADD COLUMN size_id INT NULL AFTER fabric_id",
    "ALTER TABLE products ADD COLUMN sleeve_type_id INT NULL AFTER size_id",
    "ALTER TABLE products ADD COLUMN neck_type_id INT NULL AFTER sleeve_type_id",
    "ALTER TABLE products ADD COLUMN occasion_id INT NULL AFTER neck_type_id",
    "ALTER TABLE products ADD COLUMN pattern_id INT NULL AFTER occasion_id"
];

foreach ($sqls as $sql) {
    if ($conn->query($sql)) {
        echo "Executed: $sql\n";
    } else {
        echo "Error: " . $conn->error . " for query: $sql\n";
    }
}

$conn->close();
