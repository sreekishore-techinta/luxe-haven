<?php
require_once 'config/db.php';
$conn = getDB();
$res = $conn->query("SELECT id, name, price, discount_price, status, stock_qty FROM products WHERE id IN (1, 2, 3, 5, 6, 29, 31, 32)");
$rows = $res->fetch_all(MYSQLI_ASSOC);
echo json_encode($rows, JSON_PRETTY_PRINT);
?>
