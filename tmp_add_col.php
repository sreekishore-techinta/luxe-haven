<?php
$conn = new mysqli('localhost', 'root', '', 'luxe_haven');
$sql = "ALTER TABLE products ADD COLUMN blouse_style_id INT NULL AFTER saree_type_id";
if ($conn->query($sql)) {
    echo "Column added successfully\n";
} else {
    echo "Error: " . $conn->error . "\n";
}
?>