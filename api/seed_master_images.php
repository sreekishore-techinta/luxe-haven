<?php
require_once 'config/db.php';

session_start();
$conn = getDB();

// ─── Saree type images (saree_types table) ───────────────────────────────────
// Using high-quality Unsplash images that match each category
$sareeTypeImages = [
    1  => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',  // Pure Silk Saree
    2  => 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80',  // Banarasi Saree
    3  => 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80',  // Kanjivaram Saree
    4  => 'https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600&q=80',  // Organza Saree
    5  => 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80',  // Linen Saree
    6  => 'https://images.unsplash.com/photo-1609748342101-f9a89113a2ab?w=600&q=80',  // Cotton Saree
    7  => 'https://images.unsplash.com/photo-1602214099236-1f8f4c8ce47e?w=600&q=80',  // Bridal Saree
    8  => 'https://images.unsplash.com/photo-1622371915932-6e0e91baa2fb?w=600&q=80',  // Party Wear Saree
    9  => 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80',  // Soft Silk Saree
    10 => 'https://images.unsplash.com/photo-1610030469910-98ea16ef87c2?w=600&q=80',  // Designer Saree
];

// ─── Category images (master_categories table) ───────────────────────────────
$categoryImages = [
    1  => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',  // Sarees
    2  => 'https://images.unsplash.com/photo-1540492649367-c8565a571e4b?w=600&q=80',  // Blouses
    3  => 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80',  // Suit Sets
    4  => 'https://images.unsplash.com/photo-1609748342101-f9a89113a2ab?w=600&q=80',  // lishan sarees
    6  => 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80',  // New Arrivals
    7  => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',  // Pure Silk Saree
    8  => 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80',  // Banarasi Saree
    9  => 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80',  // Kanjivaram Saree
    10 => 'https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600&q=80',  // Organza Saree
    11 => 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80',  // Linen Saree
    12 => 'https://images.unsplash.com/photo-1609748342101-f9a89113a2ab?w=600&q=80',  // Cotton Saree
    13 => 'https://images.unsplash.com/photo-1602214099236-1f8f4c8ce47e?w=600&q=80',  // Bridal Saree
    14 => 'https://images.unsplash.com/photo-1622371915932-6e0e91baa2fb?w=600&q=80',  // Party Wear Saree
    15 => 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80',  // Soft Silk Saree
    16 => 'https://images.unsplash.com/photo-1610030469910-98ea16ef87c2?w=600&q=80',  // Designer Saree
];

// ─── Sub-categories (same mapping as saree_types) ────────────────────────────
$subCategoryImages = $sareeTypeImages;

$results = [];

// Update saree_types
foreach ($sareeTypeImages as $id => $url) {
    $safeUrl = $conn->real_escape_string($url);
    $sql = "UPDATE saree_types SET hero_image = '$safeUrl', image = '$safeUrl' WHERE id = $id";
    $ok = $conn->query($sql);
    $results[] = ($ok ? "✓" : "✗") . " saree_types #$id → " . ($ok ? "OK (rows: {$conn->affected_rows})" : $conn->error);
}

// Update master_categories
foreach ($categoryImages as $id => $url) {
    $safeUrl = $conn->real_escape_string($url);
    $sql = "UPDATE master_categories SET hero_image = '$safeUrl' WHERE id = $id";
    $ok = $conn->query($sql);
    $results[] = ($ok ? "✓" : "✗") . " master_categories #$id → " . ($ok ? "OK (rows: {$conn->affected_rows})" : $conn->error);
}

// Update master_sub_categories
foreach ($subCategoryImages as $id => $url) {
    $safeUrl = $conn->real_escape_string($url);
    $sql = "UPDATE master_sub_categories SET image = '$safeUrl', hero_image = '$safeUrl' WHERE id = $id";
    $ok = $conn->query($sql);
    $results[] = ($ok ? "✓" : "✗") . " master_sub_categories #$id → " . ($ok ? "OK (rows: {$conn->affected_rows})" : $conn->error);
}

$conn->close();

echo "<h2>Image Seeding Results</h2>";
foreach ($results as $r) {
    echo "$r<br>";
}
echo "<br><strong>Done!</strong>";
?>
