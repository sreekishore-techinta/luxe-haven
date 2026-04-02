<?php
require_once 'config/db.php';
$conn = getDB();

$sql = "CREATE TABLE IF NOT EXISTS product_combinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    colour_id INT,
    size_id INT,
    stock_qty INT DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)";

if ($conn->query($sql)) {
    echo json_encode(['status' => 'success', 'message' => 'product_combinations table created or already exists']);
} else {
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
}
?>
