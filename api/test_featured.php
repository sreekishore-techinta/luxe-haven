<?php
require_once 'config/db.php';
$conn = getDB();

// Count all products
$total = $conn->query("SELECT COUNT(*) as cnt FROM products")->fetch_assoc()['cnt'];
$active = $conn->query("SELECT COUNT(*) as cnt FROM products WHERE status IN ('In Stock','Low Stock') AND stock_qty > 0")->fetch_assoc()['cnt'];
$all_statuses = $conn->query("SELECT status, COUNT(*) as cnt FROM products GROUP BY status")->fetch_all(MYSQLI_ASSOC);
$stock_zero = $conn->query("SELECT COUNT(*) as cnt FROM products WHERE stock_qty = 0 OR stock_qty IS NULL")->fetch_assoc()['cnt'];

echo json_encode([
    'total_products' => $total,
    'active_instock' => $active,
    'zero_stock' => $stock_zero,
    'statuses' => $all_statuses
]);
