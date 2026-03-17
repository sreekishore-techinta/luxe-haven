<?php
require_once 'c:/xampp/htdocs/luxe-haven/api/config/db.php';
$conn = getDB();
$tables = ['orders', 'customers', 'order_items', 'products'];
foreach ($tables as $t) {
    echo "\nTable: $t\n";
    $res = $conn->query("SHOW FULL COLUMNS FROM $t");
    while ($row = $res->fetch_assoc()) {
        echo "  - {$row['Field']} ({$row['Type']}) Default: " . ($row['Default'] ?? 'NONE') . " Null: {$row['Null']}\n";
    }
}
$conn->close();
?>