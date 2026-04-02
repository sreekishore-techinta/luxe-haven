<?php
require_once __DIR__ . '/../../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'Only DELETE/POST method allowed'], 405);
}

$conn = getDB();
$data = json_decode(file_get_contents("php://input"), true);

$id = isset($data['id']) ? (int)$data['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);

if (!$id) {
    jsonResponse(['status' => 'error', 'message' => 'Missing ID'], 400);
}

$sql = "DELETE FROM reviews WHERE id = $id";

if ($conn->query($sql) === TRUE) {
    jsonResponse(['status' => 'success', 'message' => 'Review deleted successfully']);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Deletion failed: ' . $conn->error], 500);
}

$conn->close();
