<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();
$sql = "SELECT id, name, description, price, category, image FROM blouse_styles ORDER BY name ASC";
$result = $conn->query($sql);
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}
jsonResponse(['status' => 'success', 'data' => $data]);
$conn->close();
