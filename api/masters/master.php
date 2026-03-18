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
    'patterns' => 'master_patterns',
    'saree_types' => 'saree_types',
    'brands' => 'master_brands'
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
    if (isset($input['sort_order']))
        $updates[] = "sort_order = " . intval($input['sort_order']);

    // Table specific
    // Unified update logic for professional masters
    if (in_array($type, ['categories', 'sub_categories', 'saree_types', 'brands'])) {
        if (isset($input['slug']))
            $updates[] = "slug = '" . sanitize($conn, $input['slug']) . "'";
        if (isset($input['image']) && $type !== 'categories')
            $updates[] = "image = '" . sanitize($conn, $input['image']) . "'";
        if (isset($input['hero_image']))
            $updates[] = "hero_image = '" . sanitize($conn, $input['hero_image']) . "'";
        if (isset($input['description']))
            $updates[] = "description = '" . sanitize($conn, $input['description']) . "'";
        if (isset($input['is_featured']))
            $updates[] = "is_featured = " . (int) $input['is_featured'];

        if ($type === 'categories' || $type === 'sub_categories') {
            if (isset($input['show_on_menu']))
                $updates[] = "show_on_menu = " . (int) $input['show_on_menu'];
            if (isset($input['meta_title']))
                $updates[] = "meta_title = '" . sanitize($conn, $input['meta_title']) . "'";
            if (isset($input['meta_description']))
                $updates[] = "meta_description = '" . sanitize($conn, $input['meta_description']) . "'";
        }
        if ($type === 'sub_categories' && isset($input['category_id'])) {
            $updates[] = "category_id = " . (int) $input['category_id'];
        }
    }

    if ($type === 'colours' && isset($input['hex_code'])) {
        $updates[] = "hex_code = '" . sanitize($conn, $input['hex_code']) . "'";
    }

    if ($type === 'sizes') {
        if (isset($input['category_id']))
            $updates[] = "category_id = " . intval($input['category_id']);
        foreach (['chest_size', 'waist_size', 'hip_size', 'shoulder_size', 'length', 'sleeve_length', 'neck_depth', 'inseam', 'description'] as $f) {
            if (isset($input[$f]))
                $updates[] = "$f = '" . sanitize($conn, $input[$f]) . "'";
        }
    }

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
