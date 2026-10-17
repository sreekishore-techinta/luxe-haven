<?php
require_once __DIR__ . '/../api/config/db.php';
$conn = getDB();

// Run full dashboard script logic but simplified
$result = $conn->query("
    SELECT COALESCE(c.name, 'Uncategorized') AS category,
           COUNT(p.id) AS total_products,
           COALESCE(SUM(p.stock_qty), 0) AS total_stock
    FROM products p
    LEFT JOIN master_categories c ON c.id = p.category_id
    GROUP BY c.id, c.name
");
if (!$result) {
    echo "INVENTORY FAIL: " . $conn->error . "\n";
} else {
    echo "INVENTORY OK\n";
    foreach ($result->fetch_all(MYSQLI_ASSOC) as $row) {
        echo "  " . $row['category'] . ": " . $row['total_products'] . " products\n";
    }
}

$result2 = $conn->query("
    SELECT COALESCE(c.name, 'Uncategorized') AS category,
           COUNT(oi.id) AS total_sold,
           COALESCE(SUM(oi.total_price), 0) AS revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    LEFT JOIN master_categories c ON c.id = p.category_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status != 'Cancelled'
    GROUP BY c.id, c.name
    ORDER BY revenue DESC
");
if (!$result2) {
    echo "SALES_BY_CATEGORY FAIL: " . $conn->error . "\n";
} else {
    echo "SALES_BY_CATEGORY OK\n";
}

echo "\nFull dashboard response:\n";
