<?php
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'api/config/db.php';
$conn = getDB();

echo "--- PRODUCTS FOR CAT 22 ---\n";
$res = $conn->query("SELECT id, name FROM products WHERE category_id = 22");
echo "Found " . ($res ? $res->num_rows : 0) . " products.\n";

echo "\n--- PRODUCTS FOR CAT 8 ---\n";
$res = $conn->query("SELECT id, name FROM products WHERE category_id = 8");
echo "Found " . ($res ? $res->num_rows : 0) . " products.\n";
?>
