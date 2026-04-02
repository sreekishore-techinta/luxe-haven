<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/db.php';
$conn = getDB();

// Update the seeded record to use a real, existing image
$conn->query("UPDATE web_sliders SET image_url = '/uploads/hero/default_hero.jpg' WHERE id = 1");

echo "Seed image updated. Rows affected: " . $conn->affected_rows . "\n";
