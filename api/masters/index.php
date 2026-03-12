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
    'sleeve_types' => 'master_sleeve_types',
    'neck_types' => 'master_neck_types',
    'occasions' => 'master_occasions',
    'patterns' => 'master_patterns'
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
        if ($type === 'sub_categories') {
            $catId = $row['category_id'];
            $catRes = $conn->query("SELECT name FROM master_categories WHERE id = $catId");
            $catRow = $catRes->fetch_assoc();
            $row['category_name'] = $catRow['name'] ?? 'Unknown';
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
    if ($type === 'sub_categories') {
        if (!isset($input['category_id']))
            jsonResponse(['status' => 'error', 'message' => 'Category is required'], 400);
        $fields[] = 'category_id';
        $values[] = intval($input['category_id']);
    }
    if ($type === 'colours' && isset($input['hex_code'])) {
        $fields[] = 'hex_code';
        $values[] = "'" . sanitize($conn, $input['hex_code']) . "'";
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

$conn->close();
