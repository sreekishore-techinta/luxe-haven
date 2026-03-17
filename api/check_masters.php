<?php
require_once 'config/db.php';
$conn = getDB();
foreach (['master_colours', 'master_sizes'] as $t) {
    echo "Table: $t\n";
    $res = $conn->query("DESCRIBE $t");
    while ($row = $res->fetch_assoc()) {
        echo "{$row['Field']} - {$row['Type']}\n";
    }
    echo "\n";
}
$conn->close();
?>
