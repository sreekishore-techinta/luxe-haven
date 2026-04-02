<?php
require_once __DIR__ . '/../../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(['status' => 'error', 'message' => 'Only POST/PUT method allowed'], 405);
}

$conn = getDB();
$data = json_decode(file_get_contents("php://input"), true);

$id = isset($data['id']) ? (int)$data['id'] : 0;
$status = isset($data['status']) ? sanitize($conn, $data['status']) : null;

if (!$id || !$status) {
    jsonResponse(['status' => 'error', 'message' => 'Missing required fields (id, status)'], 400);
}

if (!in_array($status, ['pending', 'approved', 'rejected'])) {
    jsonResponse(['status' => 'error', 'message' => 'Invalid status'], 400);
}

$sql = "UPDATE reviews SET status = '$status' WHERE id = $id";

if ($conn->query($sql) === TRUE) {
    jsonResponse(['status' => 'success', 'message' => 'Review status updated successfully']);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Update failed: ' . $conn->error], 500);
}

$conn->close();
