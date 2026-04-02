<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();
$data = json_decode(file_get_contents("php://input"));

if ($data && isset($data->id)) {
    $id = (int)$data->id;

    $stmt = $conn->prepare("DELETE FROM slide_cards WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        jsonResponse(["status" => "success", "message" => "Slide card deleted successfully"]);
    } else {
        jsonResponse(["status" => "error", "message" => "Failed to delete slide card: " . $stmt->error]);
    }
    $stmt->close();
} else {
    jsonResponse(["status" => "error", "message" => "ID is required"]);
}
