<?php
require_once 'config/db.php';
$conn = getDB();
$res = $conn->query("SHOW COLUMNS FROM products LIKE 'status'");
$row = $res->fetch_assoc();
echo "Type: " . $row['Type'] . "\n";
?>
