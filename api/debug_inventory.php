<?php
require_once 'config/db.php';
$conn = getDB();
$res = $conn->query("SELECT id, name, status, stock_qty, is_new, is_bestseller FROM products");
$data = $res->fetch_all(MYSQLI_ASSOC);
echo json_encode($data, JSON_PRETTY_PRINT);
?>
