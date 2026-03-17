<?php
require_once 'config/db.php';
$conn = getDB();
$res = $conn->query("SHOW TABLES");
while ($row = $res->fetch_array()) {
    echo $row[0] . "\n";
}
$conn->close();
?>
