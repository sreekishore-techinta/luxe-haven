<?php
require_once __DIR__ . '/../config/db.php';
setCORSHeaders();

$conn = getDB();

// Self-healing: create only if not exists — never drop
$conn->query("CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    rating INT NOT NULL DEFAULT 5,
    message TEXT NOT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$sql = "SELECT id, name, rating, message, status, created_at
        FROM reviews
        WHERE status = 'approved'
        ORDER BY created_at DESC";

$result = $conn->query($sql);

if (!$result) {
    jsonResponse(['status' => 'error', 'message' => 'DB error: ' . $conn->error], 500);
}

$reviews = [];
while ($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}

jsonResponse(['status' => 'success', 'data' => $reviews]);

$conn->close();
