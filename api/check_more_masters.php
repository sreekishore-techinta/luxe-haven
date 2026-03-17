<?php
require_once 'config/db.php';
$conn = getDB();
$tables = ['master_fabric_types', 'master_neck_types', 'master_sleeve_types', 'master_occasions', 'master_patterns'];
foreach ($tables as $t) {
    echo "Table: $t\n";
    $res = $conn->query("DESCRIBE $t");
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            echo "{$row['Field']} - {$row['Type']}\n";
        }
    } else {
        echo "Table does not exist.\n";
    }
    echo "\n";
}
$conn->close();
?>
