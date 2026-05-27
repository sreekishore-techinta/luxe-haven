<?php
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'api/config/db.php';
$conn = getDB();

echo "Starting Product ID Synchronization...\n";

// 1. Get current Master Categories
$categories = [];
$res = $conn->query("SELECT id, name FROM master_categories");
while ($row = $res->fetch_assoc()) {
    $categories[strtolower(trim($row['name']))] = $row['id'];
}

// 2. Get current Saree Types
$sareeTypes = [];
$res = $conn->query("SELECT id, name FROM saree_types");
while ($row = $res->fetch_assoc()) {
    $sareeTypes[strtolower(trim($row['name']))] = $row['id'];
}

// 3. Update products
$res = $conn->query("SELECT id, name FROM products");
$updatedCount = 0;

while ($product = $res->fetch_assoc()) {
    $pId = $product['id'];
    $pName = strtolower($product['name']);
    
    $newCatId = "NULL";
    $newTypeId = "NULL";

    // Try to match category by name
    foreach ($categories as $catName => $catId) {
        if (strpos($pName, $catName) !== false) {
            $newCatId = $catId;
            break;
        }
    }

    // Try to match saree type by name
    foreach ($sareeTypes as $typeName => $typeId) {
        if (strpos($pName, $typeName) !== false) {
            $newTypeId = $typeId;
            break;
        }
    }

    // Special case for general "Sarees" category
    if ($newCatId === "NULL" && strpos($pName, 'saree') !== false) {
        $newCatId = $categories['sarees'] ?? "NULL";
    }

    $updateSql = "UPDATE products SET category_id = $newCatId, saree_type_id = $newTypeId WHERE id = $pId";
    if ($conn->query($updateSql)) {
        $updatedCount++;
    }
}

echo "Successfully synchronized $updatedCount products.\n";
?>
