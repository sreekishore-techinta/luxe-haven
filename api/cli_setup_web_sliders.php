<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/db.php';
$conn = getDB();

$sql = "CREATE TABLE IF NOT EXISTS web_sliders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    button_text VARCHAR(100) DEFAULT NULL,
    button_link VARCHAR(255) DEFAULT NULL,
    image_url VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if ($conn->query($sql) === TRUE) {
    // Seed data
    $checkSql = "SELECT COUNT(*) as count FROM web_sliders";
    $result = $conn->query($checkSql);
    $row = $result->fetch_assoc();
    if ($row['count'] == 0) {
        $seedSql = "INSERT INTO web_sliders (page_name, title, subtitle, description, button_text, button_link, image_url, order_index) VALUES 
        ('Home', 'Timeless Elegance', 'The Banarasi Collection', 'Discover the rich heritage and unparalleled craftsmanship of our authentic Banarasi silk sarees.', 'Shop Now', '/collections', '/uploads/hero/default_banarasi.png', 1)";
        $conn->query($seedSql);
    }
    echo "Table web_sliders created and seeded successfully\n";
} else {
    echo "Error creating table: " . $conn->error . "\n";
}
