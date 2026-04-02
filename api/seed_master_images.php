<?php
require_once 'config/db.php';

session_start();
$conn = getDB();

// ─── Saree type images (saree_types table) ───────────────────────────────────
// Using high-quality Unsplash images that match each category
$sareeTypeImages = [
    1 => 'assets/hero-banners/pure-silk-hero.png', // Pure Silk Saree
    2 => 'assets/hero-banners/banarasi-hero.png', // Banarasi Saree
    3 => 'assets/hero-banners/kanjivaram-hero.png', // Kanjivaram Saree
    4 => 'assets/hero-banners/organza-hero.png', // Organza Saree
    5 => 'assets/hero-banners/linen-hero.png', // Linen Saree
    6 => 'assets/hero-banners/cotton-hero.png', // Cotton Saree
    7 => 'assets/hero-banners/bridal-hero.png', // Bridal Saree
    8 => 'assets/hero-banners/party-wear-hero.png', // Party Wear Saree
    9 => 'assets/hero-banners/soft-silk-hero.png', // Soft Silk Saree
    10 => 'assets/hero-banners/designer-hero.png', // Designer Saree
];

// ─── Category images (master_categories table) ───────────────────────────────
$categoryImages = [
    1 => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80', // Sarees
    2 => 'https://images.unsplash.com/photo-1540492649367-c8565a571e4b?w=600&q=80', // Blouses
    3 => 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80', // Suit Sets
    4 => 'https://images.unsplash.com/photo-1609748342101-f9a89113a2ab?w=600&q=80', // lishan sarees
    6 => 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80', // New Arrivals
    7 => 'assets/hero-banners/pure-silk-hero.png', // Pure Silk Saree
    8 => 'assets/hero-banners/banarasi-hero.png', // Banarasi Saree
    9 => 'assets/hero-banners/kanjivaram-hero.png', // Kanjivaram Saree
    10 => 'assets/hero-banners/organza-hero.png', // Organza Saree
    11 => 'assets/hero-banners/linen-hero.png', // Linen Saree
    12 => 'assets/hero-banners/cotton-hero.png', // Cotton Saree
    13 => 'assets/hero-banners/bridal-hero.png', // Bridal Saree
    14 => 'assets/hero-banners/party-wear-hero.png', // Party Wear Saree
    15 => 'assets/hero-banners/soft-silk-hero.png', // Soft Silk Saree
    16 => 'assets/hero-banners/designer-hero.png', // Designer Saree
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
