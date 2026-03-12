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
$maxSize = 5 * 1024 * 1024; // 5MB
$uploadDir = dirname(__DIR__, 2) . '/uploads/products/';
$uploadUrl = 'uploads/products/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$conn = getDB();
$isPrimary = (int) ($_POST['is_primary'] ?? 0);
$uploaded = [];
$errors = [];

// Normalize $_FILES['images'] for multiple uploads
$files = $_FILES['images'];
$count = is_array($files['name']) ? count($files['name']) : 1;

for ($i = 0; $i < $count; $i++) {
    $name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
    $tmpName = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
    $size = is_array($files['size']) ? $files['size'][$i] : $files['size'];
    $type = is_array($files['type']) ? $files['type'][$i] : $files['type'];
    $error = is_array($files['error']) ? $files['error'][$i] : $files['error'];

    if ($error !== UPLOAD_ERR_OK) {
        $errors[] = "$name: Upload error code $error";
        continue;
    }
    if ($size > $maxSize) {
        $errors[] = "$name: Exceeds 5MB limit";
        continue;
    }
    // Validate actual MIME type (not just extension)
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $tmpName);
    finfo_close($finfo);
    if (!in_array($mimeType, $allowedTypes)) {
        $errors[] = "$name: Invalid file type ($mimeType)";
        continue;
    }

    $ext = pathinfo($name, PATHINFO_EXTENSION);
    $newName = 'product_' . $productId . '_' . uniqid() . '.' . $ext;
    $destPath = $uploadDir . $newName;

    if (move_uploaded_file($tmpName, $destPath)) {
        // If first image and no primary set yet, mark as primary
        $setAsPrimary = ($isPrimary === 1 || ($i === 0 && empty($uploaded))) ? 1 : 0;

        // If setting as primary, clear other primaries
        if ($setAsPrimary) {
            $conn->query("UPDATE product_images SET is_primary = 0 WHERE product_id = " . intval($productId));
        }

        $imgPath = $uploadUrl . $newName;
        $sort = $i;
        $stmt = $conn->prepare("INSERT INTO product_images (product_id, image_path, is_primary, sort_order) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("isii", $productId, $imgPath, $setAsPrimary, $sort);
        $stmt->execute();
        $stmt->close();

        $uploaded[] = ['path' => $imgPath, 'is_primary' => $setAsPrimary];
    } else {
        $errors[] = "$name: Failed to move file";
    }
}

$conn->close();
jsonResponse([
    'status' => empty($errors) ? 'success' : 'partial',
    'message' => count($uploaded) . ' image(s) uploaded',
    'uploaded' => $uploaded,
    'errors' => $errors,
]);
