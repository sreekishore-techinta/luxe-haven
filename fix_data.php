<?php
require_once 'api/config/db.php';
$conn = getDB();

// 1. Update products by matching category string to master_categories name
$res = $conn->query("SELECT id, name FROM master_categories");
$cats = [];
while ($row = $res->fetch_assoc()) {
    $cats[$row['name']] = $row['id'];
}

echo "Updating category links...\n";
foreach ($cats as $name => $id) {
    $stmt = $conn->prepare("UPDATE products SET category_id = ? WHERE category = ? AND (category_id IS NULL OR category_id = 0)");
    $stmt->bind_param("is", $id, $name);
    $stmt->execute();
    echo "Linked '$name' products to Category ID $id (affected: " . $stmt->affected_rows . ")\n";
}

// 2. Set default stock 50 for anything with 0 or NULL
$conn->query("UPDATE products SET stock_qty = 50 WHERE stock_qty IS NULL OR stock_qty = 0");
echo "Updated default stock for empty records.\n";

echo "Migration complete.\n";
$conn->close();
