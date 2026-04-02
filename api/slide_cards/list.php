<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

$sql = "SELECT * FROM slide_cards ORDER BY order_index ASC";
$result = $conn->query($sql);

$slides = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $slides[] = $row;
    }
}

jsonResponse([
    "status" => "success",
    "data" => $slides
]);
