<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();
$data = json_decode(file_get_contents("php://input"));

if ($data && isset($data->id)) {
    $id = (int)$data->id;

    $res = $conn->query("SELECT image_url FROM web_sliders WHERE id = $id");
    $existing = $res->fetch_assoc();

    $stmt = $conn->prepare("DELETE FROM web_sliders WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        if ($existing && $existing['image_url'] && strpos($existing['image_url'], 'default') === false) {
            $oldPath = __DIR__ . '/../../uploads' . $existing['image_url'];
            if (file_exists($oldPath)) unlink($oldPath);
        }
        jsonResponse(["status" => "success", "message" => "Slider deleted successfully"]);
    } else {
        jsonResponse(["status" => "error", "message" => "Failed to delete slider: " . $stmt->error]);
    }
    $stmt->close();
} else {
    jsonResponse(["status" => "error", "message" => "ID is required"]);
}
