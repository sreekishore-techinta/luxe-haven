<?php
require_once '../config/db.php';
setCORSHeaders();

session_start();
if (!isset($_SESSION['admin_id'])) {
    jsonResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

$type = $_GET['type'] ?? '';
$allowedMasters = [
    'categories' => 'master_categories',
    'sub_categories' => 'master_sub_categories',
    'colours' => 'master_colours',
    'fabric_types' => 'master_fabric_types',
    'sizes' => 'master_sizes',
    'saree_types' => 'saree_types'
];

if (!isset($allowedMasters[$type])) {
    jsonResponse(['status' => 'error', 'message' => 'Invalid master type'], 400);
}

$table = $allowedMasters[$type];
$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $search = $_GET['search'] ?? '';
    $status = $_GET['status'] ?? '';
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? intval($_GET['per_page']) : 10;
    $offset = ($page - 1) * $perPage;

    $whereClauses = [];
    if (!empty($search)) {
        $whereClauses[] = "name LIKE '%" . sanitize($conn, $search) . "%'";
    }
    if (!empty($status)) {
        $whereClauses[] = "status = '" . sanitize($conn, $status) . "'";
    }

    if ($type === 'sub_categories' && isset($_GET['category_id'])) {
        $whereClauses[] = "category_id = " . intval($_GET['category_id']);
    }

    $where = count($whereClauses) > 0 ? "WHERE " . implode(' AND ', $whereClauses) : '';

    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM $table $where";
    $countRes = $conn->query($countSql);
    $totalRows = $countRes->fetch_assoc()['total'];
    $totalPages = ceil($totalRows / $perPage);

    $sql = "SELECT * FROM $table $where ORDER BY sort_order ASC, name ASC LIMIT $offset, $perPage";
    $result = $conn->query($sql);

    $data = [];
    while ($row = $result->fetch_assoc()) {
        if ($type === 'sub_categories' || $type === 'sizes') {
            $catId = $row['category_id'] ?? null;
            if ($catId) {
                $catRes = $conn->query("SELECT name FROM master_categories WHERE id = $catId");
                $catRow = $catRes->fetch_assoc();
                $row['category_name'] = $catRow['name'] ?? 'Unknown';
            } else {
                $row['category_name'] = 'General';
            }
        }
        $data[] = $row;
    }

    jsonResponse([
        'status' => 'success',
        'data' => $data,
        'total' => $totalRows,
        'total_pages' => $totalPages,
        'page' => $page,
        'per_page' => $perPage
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input)
        jsonResponse(['status' => 'error', 'message' => 'Invalid JSON'], 400);

    $name = sanitize($conn, $input['name'] ?? '');
    if (empty($name))
        jsonResponse(['status' => 'error', 'message' => 'Name is required'], 400);

    $fields = ['name'];
    $values = ["'$name'"];

    if (isset($input['status'])) {
        $fields[] = 'status';
        $values[] = "'" . sanitize($conn, $input['status']) . "'";
    }

    // Table specific fields
    // Unified creation logic for professional masters
    if (in_array($type, ['categories', 'sub_categories', 'saree_types', 'brands'])) {
        foreach (['slug', 'image', 'hero_image', 'description', 'meta_title', 'meta_description'] as $f) {
            if (isset($input[$f])) {
                $fields[] = $f;
                $values[] = "'" . sanitize($conn, $input[$f]) . "'";
            }
        }
        foreach (['is_featured', 'show_on_menu'] as $f) {
            if (isset($input[$f])) {
                $fields[] = $f;
                $values[] = (int) $input[$f];
            }
        }
        if ($type === 'sub_categories') {
            if (!isset($input['category_id']))
                jsonResponse(['status' => 'error', 'message' => 'Category is required'], 400);
            $fields[] = 'category_id';
            $values[] = (int) $input['category_id'];
        }
    }
    if ($type === 'colours' && isset($input['hex_code'])) {
        $fields[] = 'hex_code';
        $values[] = "'" . sanitize($conn, $input['hex_code']) . "'";
    }
    if ($type === 'sizes') {
        if (isset($input['category_id'])) {
            $fields[] = 'category_id';
            $values[] = intval($input['category_id']);
        }
        foreach (['chest_size', 'waist_size', 'hip_size', 'shoulder_size', 'length', 'sleeve_length', 'neck_depth', 'inseam', 'description'] as $f) {
            if (isset($input[$f])) {
                $fields[] = $f;
                $values[] = "'" . sanitize($conn, $input[$f]) . "'";
            }
        }
    }
    if (isset($input['sort_order'])) {
        $fields[] = 'sort_order';
        $values[] = intval($input['sort_order']);
    }

    $sql = "INSERT INTO $table (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $values) . ")";

    if ($conn->query($sql)) {
        jsonResponse(['status' => 'success', 'message' => 'Record created', 'id' => $conn->insert_id]);
    } else {
        jsonResponse(['status' => 'error', 'message' => $conn->error], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0)
        jsonResponse(['status' => 'error', 'message' => 'Invalid ID'], 400);

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

    if ($type === 'sub_categories') {
        if (isset($input['category_id']))
            $updates[] = "category_id = " . intval($input['category_id']);
        if (isset($input['image']))
            $updates[] = "image = '" . sanitize($conn, $input['image']) . "'";
        if (isset($input['hero_image']))
            $updates[] = "hero_image = '" . sanitize($conn, $input['hero_image']) . "'";
        if (isset($input['description']))
            $updates[] = "description = '" . sanitize($conn, $input['description']) . "'";
    }
    if ($type === 'categories' || $type === 'saree_styles') {
        if (isset($input['slug']))
            $updates[] = "slug = '" . sanitize($conn, $input['slug']) . "'";
        if (isset($input['image']))
            $updates[] = "image = '" . sanitize($conn, $input['image']) . "'";
        if (isset($input['hero_image']))
            $updates[] = "hero_image = '" . sanitize($conn, $input['hero_image']) . "'";
        if (isset($input['description']))
            $updates[] = "description = '" . sanitize($conn, $input['description']) . "'";
    }
    if ($type === 'colours' && isset($input['hex_code'])) {
        $updates[] = "hex_code = '" . sanitize($conn, $input['hex_code']) . "'";
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
    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0)
        jsonResponse(['status' => 'error', 'message' => 'Invalid ID'], 400);

    $sql = "DELETE FROM $table WHERE id = $id";
    if ($conn->query($sql)) {
        jsonResponse(['status' => 'success', 'message' => 'Record deleted']);
    } else {
        jsonResponse(['status' => 'error', 'message' => $conn->error], 500);
    }
}

$conn->close();
