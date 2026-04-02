<?php
require_once __DIR__ . '/../../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn = getDB();

// Self-healing: Ensure table exists
$conn->query("CREATE TABLE IF NOT EXISTS service_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    tag VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    jsonResponse(['status' => 'error', 'message' => 'Invalid JSON input'], 400);
}

$title = sanitize($conn, $data['title'] ?? '');
$image_url = sanitize($conn, $data['image_url'] ?? '');
$link_url = sanitize($conn, $data['link_url'] ?? '');
$tag = sanitize($conn, $data['tag'] ?? '');
$display_order = (int)($data['display_order'] ?? 0);
$is_active = (int)($data['is_active'] ?? 1);

if (!$title || !$image_url) {
    jsonResponse(['status' => 'error', 'message' => 'Title and Image URL are required'], 400);
}

$sql = "INSERT INTO service_categories (title, image_url, link_url, tag, display_order, is_active) 
        VALUES ('$title', '$image_url', '$link_url', '$tag', $display_order, $is_active)";


if ($conn->query($sql)) {
    jsonResponse([
        'status' => 'success',
        'message' => 'Service category added successfully',
        'id' => $conn->insert_id
    ]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'DATABASE ERROR: ' . $conn->error], 500);
}

$conn->close();
