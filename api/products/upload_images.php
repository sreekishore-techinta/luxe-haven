<?php
require_once '../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'POST required'], 405);
}

$productId = (int) ($_POST['product_id'] ?? 0);
if ($productId <= 0) {
    jsonResponse(['status' => 'error', 'message' => 'Valid product_id required'], 400);
}

if (empty($_FILES['images'])) {
    jsonResponse(['status' => 'error', 'message' => 'No images uploaded'], 400);
}

$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
$maxSize = 10 * 1024 * 1024; // 10MB
$uploadDir = dirname(__DIR__, 2) . '/uploads/products/';
$uploadUrl = 'uploads/products/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$conn = getDB();
$uploaded = [];
$errors = [];

// Normalize $_FILES['images']
$files = $_FILES['images'];
$count = is_array($files['name']) ? count($files['name']) : 1;

for ($i = 0; $i < $count; $i++) {
    $name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
    $tmpName = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
    $size = is_array($files['size']) ? $files['size'][$i] : $files['size'];
    $error = is_array($files['error']) ? $files['error'][$i] : $files['error'];

    if ($error !== UPLOAD_ERR_OK)
        continue;

    if ($size > $maxSize) {
        $errors[] = "$name: Too large";
        continue;
    }

    $ext = pathinfo($name, PATHINFO_EXTENSION);
    $newName = 'product_' . $productId . '_' . uniqid() . '.' . $ext;
    $destPath = $uploadDir . $newName;

    if (move_uploaded_file($tmpName, $destPath)) {
        $imgPath = $uploadUrl . $newName;

        // Insert into both image_url and image_path columns for compatibility
        $stmt = $conn->prepare("INSERT INTO product_images (product_id, image_url, image_path, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)");
        $isPrimary = ($i === 0 && empty($uploaded)) ? 1 : 0;
        $sort = $i;
        $stmt->bind_param("issii", $productId, $imgPath, $imgPath, $isPrimary, $sort);
        $stmt->execute();
        $stmt->close();

        // Primary image logic is handled by the is_primary flag in product_images
        $uploaded[] = $imgPath;
    }
}

$conn->close();
jsonResponse([
    'status' => 'success',
    'message' => count($uploaded) . ' image(s) uploaded',
    'data' => $uploaded,
    'errors' => $errors
]);
?>
