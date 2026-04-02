<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();
$data = json_decode(file_get_contents("php://input"));

if ($data && !empty($data->content)) {
    $content = sanitize($conn, $data->content);
    $icon = isset($data->icon) ? sanitize($conn, $data->icon) : null;
    $is_active = isset($data->is_active) ? (int)$data->is_active : 1;
    $order_index = isset($data->order_index) ? (int)$data->order_index : 0;

    $stmt = $conn->prepare("INSERT INTO slide_cards (content, icon, is_active, order_index) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssii", $content, $icon, $is_active, $order_index);

    if ($stmt->execute()) {
        jsonResponse(["status" => "success", "message" => "Slide card created successfuly", "id" => $conn->insert_id]);
    } else {
        jsonResponse(["status" => "error", "message" => "Failed to create slide card: " . $stmt->error]);
    }
    $stmt->close();
} else {
    jsonResponse(["status" => "error", "message" => "Content is required"]);
}
