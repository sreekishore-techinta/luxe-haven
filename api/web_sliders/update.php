<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if updating only status (is_active toggle) via JSON payload
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    if (strpos($contentType, 'application/json') !== false) {
        $json = json_decode(file_get_contents('php://input'), true);
        if ($json && isset($json['id'])) {
            $id = (int)$json['id'];
            $stmt = $conn->prepare("SELECT * FROM web_sliders WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $existing = $stmt->get_result()->fetch_assoc();
            
            $is_active = isset($json['is_active']) ? (int)$json['is_active'] : $existing['is_active'];
            
            $stmt = $conn->prepare("UPDATE web_sliders SET is_active=? WHERE id=?");
            $stmt->bind_param("ii", $is_active, $id);
            if ($stmt->execute()) jsonResponse(["status" => "success", "message" => "Updated status"]);
            else jsonResponse(["status" => "error", "message" => "Update Failed"]);
            exit;
        }
    }

    $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
    if ($id <= 0) {
        jsonResponse(["status" => "error", "message" => "Valid ID is required for update"]);
    }

    $title = isset($_POST['title']) ? sanitize($conn, $_POST['title']) : '';
    $subtitle = isset($_POST['subtitle']) ? sanitize($conn, $_POST['subtitle']) : '';
    $description = isset($_POST['description']) ? sanitize($conn, $_POST['description']) : '';
    $button_text = isset($_POST['button_text']) ? sanitize($conn, $_POST['button_text']) : '';
    $button_link = isset($_POST['button_link']) ? sanitize($conn, $_POST['button_link']) : '';
    $order_index = isset($_POST['order_index']) ? (int)$_POST['order_index'] : 0;
    $is_active = isset($_POST['is_active']) ? (int)$_POST['is_active'] : 1;
    $pages_json = isset($_POST['pages']) ? $_POST['pages'] : '[]';
    $pages = json_decode($pages_json, true);

    if (empty($title)) {
        jsonResponse(["status" => "error", "message" => "Title is required."]);
    }

    $res = $conn->query("SELECT image_url, logo_url FROM web_sliders WHERE id = $id");
    $existing = $res->fetch_assoc();
    $image_url = $existing ? $existing['image_url'] : null;
    $logo_url = $existing ? $existing['logo_url'] : null;

    $uploadDir = __DIR__ . '/../../uploads/hero/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $fileInfo = pathinfo($_FILES['image']['name']);
        $extension = strtolower($fileInfo['extension'] ?? '');
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

        if (in_array($extension, $allowedExtensions)) {
            $newFileName = uniqid('slider_') . '.' . $extension;
            $targetPath = $uploadDir . $newFileName;

            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                $image_url = '/uploads/hero/' . $newFileName;
                if ($existing && $existing['image_url'] && strpos($existing['image_url'], 'default') === false) {
                    $oldPath = __DIR__ . '/../../uploads' . $existing['image_url'];
                    if (file_exists($oldPath)) unlink($oldPath);
                }
            }
        }
    }

    // Handle Logo Removal
    if (isset($_POST['remove_logo']) && $_POST['remove_logo'] === '1') {
        if ($existing && $existing['logo_url']) {
            $oldLogoPath = __DIR__ . '/../../uploads' . $existing['logo_url'];
            if (file_exists($oldLogoPath)) unlink($oldLogoPath);
        }
        $logo_url = null;
    }

    // Handle Logo Upload
    if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
        $logoInfo = pathinfo($_FILES['logo']['name']);
        $logoExt = strtolower($logoInfo['extension'] ?? '');
        $allowedLogoExtensions = ['png', 'svg', 'webp', 'jpg', 'jpeg', 'avif'];

        if (in_array($logoExt, $allowedLogoExtensions)) {
            $newLogoName = uniqid('slider_logo_') . '.' . $logoExt;
            $logoTargetPath = $uploadDir . $newLogoName;

            if (move_uploaded_file($_FILES['logo']['tmp_name'], $logoTargetPath)) {
                $logo_url = '/uploads/hero/' . $newLogoName;
                if ($existing && $existing['logo_url']) {
                    $oldLogoPath = __DIR__ . '/../../uploads' . $existing['logo_url'];
                    if (file_exists($oldLogoPath)) unlink($oldLogoPath);
                }
            }
        }
    }

    $conn->begin_transaction();
    try {
        $first_page = !empty($pages) ? $pages[0] : 'home';
        $stmt = $conn->prepare("UPDATE web_sliders SET page_name=?, title=?, subtitle=?, description=?, button_text=?, button_link=?, image_url=?, logo_url=?, order_index=?, is_active=? WHERE id=?");
        $stmt->bind_param("ssssssssiii", $first_page, $title, $subtitle, $description, $button_text, $button_link, $image_url, $logo_url, $order_index, $is_active, $id);
        $stmt->execute();

        // Sync mapping table
        if (!empty($pages)) {
            $conn->query("DELETE FROM web_slider_pages WHERE slider_id = $id");
            foreach ($pages as $p_key) {
                $pst = $conn->prepare("INSERT INTO web_slider_pages (slider_id, page_key) VALUES (?, ?)");
                $pst->bind_param("is", $id, $p_key);
                $pst->execute();
            }
        }

        $conn->commit();
        jsonResponse(["status" => "success", "message" => "Slider updated successfully"]);
    } catch (Exception $e) {
        $conn->rollback();
        jsonResponse(["status" => "error", "message" => "Failed to update slider: " . $e->getMessage()]);
    }
}
