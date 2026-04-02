<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();
$data = json_decode(file_get_contents("php://input"));

if ($data && isset($data->id) && !empty($data->content)) {
    $id = (int)$data->id;
    $content = sanitize($conn, $data->content);
    $icon = isset($data->icon) ? sanitize($conn, $data->icon) : null;
    $is_active = isset($data->is_active) ? (int)$data->is_active : 1;
    $order_index = isset($data->order_index) ? (int)$data->order_index : 0;

    $stmt = $conn->prepare("UPDATE slide_cards SET content = ?, icon = ?, is_active = ?, order_index = ? WHERE id = ?");
    $stmt->bind_param("ssiii", $content, $icon, $is_active, $order_index, $id);

    if ($stmt->execute()) {
        jsonResponse(["status" => "success", "message" => "Slide card updated successfully"]);
    } else {
        jsonResponse(["status" => "error", "message" => "Failed to update slide card: " . $stmt->error]);
    }
    $stmt->close();
} else {
    jsonResponse(["status" => "error", "message" => "Fill all required fields"]);
}
