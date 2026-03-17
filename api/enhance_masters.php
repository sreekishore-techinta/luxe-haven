<?php
require_once 'config/db.php';
$conn = getDB();

echo "Enhancing Master Tables...\n";

// Update master_sizes
$sql_sizes = "ALTER TABLE master_sizes 
    ADD COLUMN IF NOT EXISTS category_id INT(11) DEFAULT NULL AFTER name,
    ADD COLUMN IF NOT EXISTS chest_size VARCHAR(50) DEFAULT NULL AFTER category_id,
    ADD COLUMN IF NOT EXISTS waist_size VARCHAR(50) DEFAULT NULL AFTER chest_size,
    ADD COLUMN IF NOT EXISTS shoulder_size VARCHAR(50) DEFAULT NULL AFTER waist_size,
    ADD COLUMN IF NOT EXISTS length VARCHAR(50) DEFAULT NULL AFTER shoulder_size,
    ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL AFTER length";

if ($conn->query($sql_sizes)) {
    echo "master_sizes enhanced.\n";
} else {
    echo "Error enhancing master_sizes: " . $conn->error . "\n";
}

// Ensure master_colours has hex_code (it already does, but let's be sure about nullable/defaults)
$sql_colours = "ALTER TABLE master_colours 
    MODIFY COLUMN hex_code VARCHAR(20) DEFAULT '#000000'";

if ($conn->query($sql_colours)) {
    echo "master_colours refined.\n";
} else {
    echo "Error refining master_colours: " . $conn->error . "\n";
}

$conn->close();
?>
