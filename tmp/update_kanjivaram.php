<?php
require_once 'api/config/db.php';
$conn = getDB();

$newPath = 'src/assets/hero-banners/kanjivaram-hero.png';
$slug = 'kanjivaram-saree';

$stmt = $conn->prepare("UPDATE saree_types SET hero_image = ?, image = ? WHERE slug = ?");
$stmt->bind_param("sss", $newPath, $newPath, $slug);

if ($stmt->execute()) {
    echo "Successfully updated Kanjivaram hero image.\n";
} else {
    echo "Error updating database: " . $stmt->error . "\n";
}

$stmt->close();
$conn->close();
