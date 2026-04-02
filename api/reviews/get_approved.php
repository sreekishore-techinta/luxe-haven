<?php
require_once __DIR__ . '/../config/db.php';
setCORSHeaders();

$conn = getDB();

$sql = "SELECT id, name, rating, message, status, created_at FROM reviews WHERE status = 'approved' ORDER BY created_at DESC";

$result = $conn->query($sql);

if (!$result) {
    jsonResponse([
        "status" => "error", 
        "message" => "DATABASE ERROR: " . $conn->error . " (Initialize the reviews table)"
    ], 500);
}

$reviews = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }
}

jsonResponse([
    "status" => "success",
    "data" => $reviews
]);

$conn->close();
