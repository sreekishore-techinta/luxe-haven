<?php
require_once 'config/db.php';
$conn = getDB();
$res = $conn->query("SELECT * FROM product_images");
$data = [];
while ($row = $res->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
$conn->close();
?>
