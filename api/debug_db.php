<?php
require_once 'config/db.php';
$conn = getDB();
$res = $conn->query("SHOW COLUMNS FROM products");
$cols = $res->fetch_all(MYSQLI_ASSOC);
$res2 = $conn->query("SELECT * FROM products LIMIT 5");
$rows = $res2->fetch_all(MYSQLI_ASSOC);
echo json_encode(['cols' => $cols, 'data' => $rows], JSON_PRETTY_PRINT);
?>
