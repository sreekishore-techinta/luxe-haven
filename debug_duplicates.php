<?php
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'api/config/db.php';
$conn = getDB();

echo "--- CHECKING PRODUCTS FOR ID 29 ---\n";
$res = $conn->query("SELECT * FROM products WHERE id = 29");
while ($row = $res->fetch_assoc()) echo json_encode($row) . "\n";

echo "\n--- CHECKING DUPLICATE PRIMARY IMAGES ---\n";
$res = $conn->query("SELECT product_id, COUNT(*) as count FROM product_images WHERE is_primary = 1 GROUP BY product_id HAVING count > 1");
while ($row = $res->fetch_assoc()) echo json_encode($row) . "\n";

echo "\n--- SIMULATING SUIT SETS QUERY ---\n";
$searchTerm = "suits and sets";
$cat = "%$searchTerm%";
$sql = "SELECT p.id, p.name 
        FROM products p 
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
        LEFT JOIN master_categories mc ON mc.id = p.category_id 
        LEFT JOIN master_fabric_types mft ON mft.id = p.fabric_id 
        LEFT JOIN saree_types st ON st.id = p.saree_type_id 
        WHERE (mc.name LIKE '$cat' OR p.name LIKE '$cat' OR p.description LIKE '$cat' OR mft.name LIKE '$cat' OR st.name LIKE '$cat')";
$res = $conn->query($sql);
$ids = [];
while ($row = $res->fetch_assoc()) {
    $ids[] = $row['id'];
}
$counts = array_count_values($ids);
foreach ($counts as $id => $count) {
    if ($count > 1) echo "Product ID $id appears $count times in result set!\n";
}
?>
