<?php
require_once __DIR__ . '/../../config/db.php';
setCORSHeaders();

$conn = getDB();

// Self-healing: Ensure table exists
$conn->query("CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    message TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$status = isset($_GET['status']) ? sanitize($conn, $_GET['status']) : null;

$sql = "SELECT * FROM reviews";
if ($status) {
    $sql .= " WHERE status = '$status'";
}
$sql .= " ORDER BY created_at DESC";

$result = $conn->query($sql);

if (!$result) {
    jsonResponse([
        "status" => "error",
        "message" => "DATABASE ERROR: " . $conn->error . " (Ensure the reviews table exists)"
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
