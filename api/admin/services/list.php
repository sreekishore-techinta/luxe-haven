<?php
require_once __DIR__ . '/../../config/db.php';
setCORSHeaders();

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

$sql = "SELECT * FROM service_categories ORDER BY display_order ASC, created_at DESC";
$result = $conn->query($sql);

if (!$result) {
    jsonResponse(['status' => 'error', 'message' => 'DATABASE ERROR: ' . $conn->error], 500);
}

$services = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $services[] = $row;
    }
}

jsonResponse([
    'status' => 'success',
    'data' => $services
]);

$conn->close();
