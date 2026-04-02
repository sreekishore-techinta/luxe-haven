<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = isset($_POST['title']) ? sanitize($conn, $_POST['title']) : '';
    $subtitle = isset($_POST['subtitle']) ? sanitize($conn, $_POST['subtitle']) : '';
    $description = isset($_POST['description']) ? sanitize($conn, $_POST['description']) : '';
    $button_text = isset($_POST['button_text']) ? sanitize($conn, $_POST['button_text']) : '';
    $button_link = isset($_POST['button_link']) ? sanitize($conn, $_POST['button_link']) : '';
    $order_index = isset($_POST['order_index']) ? (int)$_POST['order_index'] : 0;
    $is_active = isset($_POST['is_active']) ? (int)$_POST['is_active'] : 1;
    $pages_json = isset($_POST['pages']) ? $_POST['pages'] : '[]'; // Should be JSON array of page keys
    $pages = json_decode($pages_json, true);
    
    // Fallback: If no pages provided, use 'home'
    if (empty($pages)) $pages = ['home'];

    $image_url = null;

    if (empty($title)) {
        jsonResponse(["status" => "error", "message" => "Title is required."]);
    }

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../../uploads/hero/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileInfo = pathinfo($_FILES['image']['name']);
        $extension = strtolower($fileInfo['extension'] ?? '');
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

        if (!in_array($extension, $allowedExtensions)) {
             jsonResponse(["status" => "error", "message" => "Unsupported image format."]);
        }

        $newFileName = uniqid('slider_') . '.' . $extension;
        $targetPath = $uploadDir . $newFileName;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            $image_url = '/uploads/hero/' . $newFileName;
        } else {
             jsonResponse(["status" => "error", "message" => "Failed to upload image."]);
        }
    } else {
         jsonResponse(["status" => "error", "message" => "An image is required."]);
    }

    $conn->begin_transaction();
    try {
        $stmt = $conn->prepare("INSERT INTO web_sliders (page_name, title, subtitle, description, button_text, button_link, image_url, order_index, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $first_page = $pages[0]; // Set one page for legacy compatibility
        $stmt->bind_param("sssssssii", $first_page, $title, $subtitle, $description, $button_text, $button_link, $image_url, $order_index, $is_active);
        $stmt->execute();
        $slider_id = $conn->insert_id;

        // Save assigned pages
        foreach ($pages as $p_key) {
            $pst = $conn->prepare("INSERT INTO web_slider_pages (slider_id, page_key) VALUES (?, ?)");
            $pst->bind_param("is", $slider_id, $p_key);
            $pst->execute();
        }

        $conn->commit();
        jsonResponse(["status" => "success", "message" => "Slider created successfully", "id" => $slider_id]);
    } catch (Exception $e) {
        $conn->rollback();
        jsonResponse(["status" => "error", "message" => "Failed to create slider: " . $e->getMessage()]);
    }
}
