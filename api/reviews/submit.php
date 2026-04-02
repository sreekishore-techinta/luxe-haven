<?php
require_once __DIR__ . '/../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'Only POST method allowed'], 405);
}

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

$data = json_decode(file_get_contents("php://input"), true);

$name = isset($data['name']) ? sanitize($conn, $data['name']) : null;
$email = isset($data['email']) ? sanitize($conn, $data['email']) : null;
$rating = isset($data['rating']) ? (int)$data['rating'] : 0;
$message = isset($data['message']) ? sanitize($conn, $data['message']) : null;

if (!$name || !$rating || !$message) {
    jsonResponse(['status' => 'error', 'message' => 'Missing required fields (name, rating, message)'], 400);
}

if ($rating < 1 || $rating > 5) {
    jsonResponse(['status' => 'error', 'message' => 'Rating must be between 1 and 5'], 400);
}

$sql = "INSERT INTO reviews (name, email, rating, message, status) VALUES ('$name', '$email', $rating, '$message', 'pending')";

if ($conn->query($sql) === TRUE) {
    jsonResponse([
        'status' => 'success',
        'message' => 'Your review will be published after approval'
    ]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Failed to submit review: ' . $conn->error], 500);
}

$conn->close();
