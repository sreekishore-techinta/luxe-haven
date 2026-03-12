<?php
require_once '../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn = getDB();
$where = ["p.status != 'Inactive'"];
$params = [];
$types = "";

// Filter by category name (from master_categories or products.category field)
if (!empty($_GET['category'])) {
    $where[] = "(p.category = ? OR mc.name = ?)";
    $params[] = $_GET['category'];
    $params[] = $_GET['category'];
    $types .= "ss";
}

if (!empty($_GET['is_new'])) {
    $where[] = "p.is_new = 1";
}
if (!empty($_GET['is_bestseller'])) {
    $where[] = "p.is_bestseller = 1";
}
if (!empty($_GET['search'])) {
    $s = "%" . $conn->real_escape_string($_GET['search']) . "%";
    $where[] = "(p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)";
    $params[] = $s;
    $params[] = $s;
    $params[] = $s;
    $types .= "sss";
}

// Stock filter — only show products that have stock
$showOutOfStock = !empty($_GET['show_oos']); // allow querying OOS explicitly
if (!$showOutOfStock) {
    // Still show them but mark them
}

$whereStr = implode(" AND ", $where);

$page = max(1, (int) ($_GET['page'] ?? 1));
$per_page = (int) ($_GET['per_page'] ?? 50);
$offset = ($page - 1) * $per_page;

$sql = "SELECT p.*,
            pi.image_path as primary_image,
            mc.name as category_name
        FROM products p
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
        LEFT JOIN master_categories mc ON mc.name = p.category
        WHERE $whereStr
        ORDER BY p.is_new DESC, p.is_bestseller DESC, p.created_at DESC
        LIMIT ? OFFSET ?";

$allTypes = $types . "ii";
$allParams = array_merge($params, [$per_page, $offset]);
$stmt = $conn->prepare($sql);
$stmt->bind_param($allTypes, ...$allParams);
$stmt->execute();
$products = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$conn->close();

// Normalize image paths
foreach ($products as &$p) {
    if ($p['primary_image']) {
        $p['image_url'] = "http://localhost:8000/" . $p['primary_image'];
    } else {
        $p['image_url'] = null;
    }
    $p['in_stock'] = $p['status'] !== 'Out of Stock' && (int) $p['stock_qty'] > 0;
}
unset($p);

jsonResponse(['status' => 'success', 'data' => $products]);
