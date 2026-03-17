<?php
require_once 'api/config/db.php';
$conn = getDB();
$res = $conn->query("SELECT * FROM product_images LIMIT 15");
while ($row = $res->fetch_assoc()) {
    echo "ID: " . $row['id'] . " | ProductID: " . $row['product_id'] . " | Path: " . $row['image_path'] . "\n";
}
