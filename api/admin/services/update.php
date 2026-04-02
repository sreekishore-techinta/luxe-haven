<?php
require_once __DIR__ . '/../../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn = getDB();

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    jsonResponse(['status' => 'error', 'message' => 'Invalid JSON input'], 400);
}

$id = (int)($data['id'] ?? 0);
if (!$id) {
    jsonResponse(['status' => 'error', 'message' => 'Service ID is required'], 400);
}

$title = sanitize($conn, $data['title'] ?? '');
$image_url = sanitize($conn, $data['image_url'] ?? '');
$link_url = sanitize($conn, $data['link_url'] ?? '');
$tag = sanitize($conn, $data['tag'] ?? '');
$display_order = (int)($data['display_order'] ?? 0);
$is_active = (int)($data['is_active'] ?? 1);

if (!$title || !$image_url) {
    jsonResponse(['status' => 'error', 'message' => 'Title and Image URL are required'], 400);
}

$sql = "UPDATE service_categories SET 
        title = '$title', 
        image_url = '$image_url', 
        link_url = '$link_url',
        tag = '$tag', 
        display_order = $display_order, 
        is_active = $is_active 
        WHERE id = $id";


if ($conn->query($sql)) {
    jsonResponse([
        'status' => 'success',
        'message' => 'Service category updated successfully'
    ]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'DATABASE ERROR: ' . $conn->error], 500);
}

$conn->close();
