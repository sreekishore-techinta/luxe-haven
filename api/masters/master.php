<?php
require_once '../config/db.php';
setCORSHeaders();

session_start();
if (!isset($_SESSION['admin_id'])) {
    jsonResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

$type = $_GET['type'] ?? '';
$id = intval($_GET['id'] ?? 0);

$allowedMasters = [
    'categories' => 'master_categories',
    'sub_categories' => 'master_sub_categories',
    'colours' => 'master_colours',
    'fabric_types' => 'master_fabric_types',
    'sizes' => 'master_sizes',
    'sleeve_types' => 'master_sleeve_types',
    'neck_types' => 'master_neck_types',
    'occasions' => 'master_occasions',
    'patterns' => 'master_patterns'
];

if (!isset($allowedMasters[$type]) || $id <= 0) {
    jsonResponse(['status' => 'error', 'message' => 'Invalid request'], 400);
}

$table = $allowedMasters[$type];
$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM $table WHERE id = $id";
    $result = $conn->query($sql);
    $row = $result->fetch_assoc();
    if (!$row)
        jsonResponse(['status' => 'error', 'message' => 'Not found'], 404);
    jsonResponse(['status' => 'success', 'data' => $row]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input)
        jsonResponse(['status' => 'error', 'message' => 'Invalid JSON'], 400);

    $updates = [];
    if (isset($input['name']))
        $updates[] = "name = '" . sanitize($conn, $input['name']) . "'";
    if (isset($input['status']))
        $updates[] = "status = '" . sanitize($conn, $input['status']) . "'";

    // Table specific
    if ($type === 'sub_categories' && isset($input['category_id']))
        $updates[] = "category_id = " . intval($input['category_id']);
    if ($type === 'colours' && isset($input['hex_code']))
        $updates[] = "hex_code = '" . sanitize($conn, $input['hex_code']) . "'";
    if (isset($input['sort_order']))
        $updates[] = "sort_order = " . intval($input['sort_order']);

    if (empty($updates))
        jsonResponse(['status' => 'error', 'message' => 'No fields to update'], 400);

    $sql = "UPDATE $table SET " . implode(', ', $updates) . " WHERE id = $id";
    if ($conn->query($sql)) {
        jsonResponse(['status' => 'success', 'message' => 'Record updated']);
    } else {
        jsonResponse(['status' => 'error', 'message' => $conn->error], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $sql = "DELETE FROM $table WHERE id = $id";
    if ($conn->query($sql)) {
        jsonResponse(['status' => 'success', 'message' => 'Record deleted']);
    } else {
        jsonResponse(['status' => 'error', 'message' => $conn->error], 500);
    }
}

$conn->close();
