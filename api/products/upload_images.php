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
$uploadDir = dirname(__DIR__, 2) . '/assets/products/';
$uploadUrl = 'assets/products/';

if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        jsonResponse(['status' => 'error', 'message' => "Failed to create upload directory: $uploadDir. Please check server permissions."], 500);
    }
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

    if ($error !== UPLOAD_ERR_OK) {
        $errors[] = "$name: Upload error ($error)";
        continue;
    }

    if ($size > $maxSize) {
        $errors[] = "$name: Exceeds 10MB limit";
        continue;
    }

    $type = is_array($files['type']) ? $files['type'][$i] : $files['type'];
    if (!in_array(strtolower($type), $allowedTypes)) {
        $errors[] = "$name: Invalid format ($type). Only JPG, PNG, and WebP are allowed.";
        continue;
    }

    $ext = pathinfo($name, PATHINFO_EXTENSION);
    $newName = 'product_' . $productId . '_' . uniqid() . '.' . $ext;
    $destPath = $uploadDir . $newName;

    if (move_uploaded_file($tmpName, $destPath)) {
        $imgPath = $uploadUrl . $newName;

        if (isset($_POST['combination_index'])) {
           // This is a combination image. 
           // In a real setup, we'd probably have the combination ID, but let's assume we update by product_id and index
           // Or better: we updated combinations already, let's find the ID
           $idx = (int)$_POST['combination_index'];
           $res = $conn->query("SELECT id FROM product_combinations WHERE product_id = $productId ORDER BY id ASC LIMIT $idx, 1");
           if ($res && $row = $res->fetch_assoc()) {
               $combId = $row['id'];
               $uStmt = $conn->prepare("UPDATE product_combinations SET image_path = ? WHERE id = ?");
               if ($uStmt) {
                   $uStmt->bind_param("si", $imgPath, $combId);
                   if (!$uStmt->execute()) {
                       $errors[] = "Comb UPDATE failed: " . $uStmt->error;
                   }
                   $uStmt->close();
               } else {
                   $errors[] = "Comb PREPARE failed: " . $conn->error;
               }
           } else {
               $errors[] = "Comb lookup failed for param idx $idx prod $productId. Error: " . $conn->error;
           }
        } else {
            // Main product gallery
            $stmt = $conn->prepare("INSERT INTO product_images (product_id, image_url, image_path, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)");
            $isPrimary = isset($_POST['is_primary']) ? (int)$_POST['is_primary'] : 0;
            $sort = $i;
            $stmt->bind_param("issii", $productId, $imgPath, $imgPath, $isPrimary, $sort);
            $stmt->execute();
            $stmt->close();
        }

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
