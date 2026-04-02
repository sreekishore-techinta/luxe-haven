<?php
require_once __DIR__ . '/config/db.php';
setCORSHeaders();

$conn = getDB();

$sql = "CREATE TABLE IF NOT EXISTS slide_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    icon VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if ($conn->query($sql) === TRUE) {
    // Seed some initial data
    $checkSql = "SELECT COUNT(*) as count FROM slide_cards";
    $result = $conn->query($checkSql);
    $row = $result->fetch_assoc();
    if ($row['count'] == 0) {
        $seedSql = "INSERT INTO slide_cards (content, icon, order_index) VALUES 
        ('Free shipping on all orders over ₹4,999', '✨', 1),
        ('New banarasi silk collections out now', '🔥', 2),
        ('Get 10% off on your first order with code WELCOME10', '💎', 3);";
        $conn->query($seedSql);
    }
    jsonResponse(["status" => "success", "message" => "Table slide_cards created and seeded successfully"]);
} else {
    jsonResponse(["status" => "error", "message" => "Error creating table: " . $conn->error]);
}
