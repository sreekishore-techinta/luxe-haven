<?php
require_once '../../config/db.php';
setCORSHeaders();

$conn = getDB();

if (!isset($_GET['id'])) {
    jsonResponse(["status" => "error", "message" => "Missing service ID"]);
}

$id = intval($_GET['id']);
$sql = "SELECT id, title, image_url, link_url, linked_category_id, tag, display_order, is_active FROM service_categories WHERE id = $id";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    jsonResponse([
        "status" => "success",
        "data" => $result->fetch_assoc()
    ]);
} else {
    jsonResponse(["status" => "error", "message" => "Service category not found"]);
}
?>
