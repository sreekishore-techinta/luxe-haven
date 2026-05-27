<?php
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'api/config/db.php';
$conn = getDB();

echo "--- PRODUCTS ---\n";
$res = $conn->query("SELECT id, name, category_id, saree_type_id, status FROM products LIMIT 20");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        echo json_encode($row) . "\n";
    }
} else {
    echo "Error products: " . $conn->error . "\n";
}

echo "\n--- CATEGORIES ---\n";
$res = $conn->query("SELECT id, name, slug FROM master_categories");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        echo json_encode($row) . "\n";
    }
} else {
    echo "Error categories: " . $conn->error . "\n";
}

echo "\n--- SAREE TYPES ---\n";
$res = $conn->query("SELECT id, name, slug FROM saree_types");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        echo json_encode($row) . "\n";
    }
} else {
    echo "Error saree_types: " . $conn->error . "\n";
}
?>
