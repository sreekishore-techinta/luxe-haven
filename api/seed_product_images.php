<?php
require_once 'config/db.php';
$conn = getDB();

$assets_dir = __DIR__ . '/../src/assets/';
$upload_dir = __DIR__ . '/uploads/products/';

if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Map of product images available in assets
$available_images = [
    'product-1.jpg',
    'product-2.jpg',
    'product-3.jpg',
    'product-4.jpg',
    'product-5.jpg',
    'product-6.jpg',
    'product-7.jpg',
    'product-8.jpg'
];

echo "Seeding product images...\n";

// Get all products that don't have a primary image
$res = $conn->query("SELECT id FROM products");
$count = 0;

while ($row = $res->fetch_assoc()) {
    $pid = $row['id'];

    // Check if primary image exists
    $chk = $conn->query("SELECT id FROM product_images WHERE product_id = $pid AND is_primary = 1");
    if ($chk->num_rows == 0) {
        // Pick an image from assets (cycling through available)
        $asset_name = $available_images[$count % count($available_images)];
        $extension = pathinfo($asset_name, PATHINFO_EXTENSION);
        $new_name = "seed_prod_{$pid}_" . uniqid() . "." . $extension;
        $dest_path = $upload_dir . $new_name;
        $db_path = "uploads/products/" . $new_name;

        if (copy($assets_dir . $asset_name, $dest_path)) {
            $stmt = $conn->prepare("INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, 1)");
            $stmt->bind_param("is", $pid, $db_path);
            $stmt->execute();
            $stmt->close();
            echo "Added image to product #$pid: $asset_name -> $db_path\n";
        } else {
            echo "Failed to copy $asset_name for product #$pid\n";
        }
    }
    $count++;
}

echo "Seeding complete.\n";
$conn->close();
?>
