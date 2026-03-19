<?php
require_once 'api/config/db.php';
$conn = getDB();

// 1. Update saree sub-collections by matching category/name string to saree_types name
$res = $conn->query("SELECT id, name FROM saree_types");
$types = [];
while ($row = $res->fetch_assoc()) {
    $types[$row['name']] = $row['id'];
}

echo "Updating Saree Style links...\n";
foreach ($types as $name => $id) {
    // If a product's name or category name contains the style name, link it
    $stmt = $conn->prepare("UPDATE products SET saree_type_id = ? WHERE (name LIKE ? OR category LIKE ?) AND (saree_type_id IS NULL OR saree_type_id = 0)");
    $searchTerm = "%$name%";
    $stmt->bind_param("iss", $id, $searchTerm, $searchTerm);
    $stmt->execute();
    echo "Linked '$name' products to Style ID $id (affected: " . $stmt->affected_rows . ")\n";
}

echo "Migration complete.\n";
$conn->close();
