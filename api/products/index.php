<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET: List / Search / Filter products ───────────────────────────
    case 'GET':
        $where = ["1=1"];
        $params = [];
        $types = "";

        if (!empty($_GET['search'])) {
            $s = "%" . $_GET['search'] . "%";
            $where[] = "(p.name LIKE ? OR p.sku LIKE ? OR p.fabric LIKE ?)";
            $params = array_merge($params, [$s, $s, $s]);
            $types .= "sss";
        }
        if (!empty($_GET['category']) && $_GET['category'] !== 'All') {
            $where[] = "p.category = ?";
            $params[] = $_GET['category'];
            $types .= "s";
        }
        if (!empty($_GET['status']) && $_GET['status'] !== 'All') {
            $where[] = "p.status = ?";
            $params[] = $_GET['status'];
            $types .= "s";
        }
        if (!empty($_GET['fabric']) && $_GET['fabric'] !== 'All') {
            $where[] = "p.fabric = ?";
            $params[] = $_GET['fabric'];
            $types .= "s";
        }
        if (!empty($_GET['min_price'])) {
            $where[] = "p.price >= ?";
            $params[] = (float) $_GET['min_price'];
            $types .= "d";
        }
        if (!empty($_GET['max_price'])) {
            $where[] = "p.price <= ?";
            $params[] = (float) $_GET['max_price'];
            $types .= "d";
        }

        // Pagination
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $per_page = (int) ($_GET['per_page'] ?? 20);
        $offset = ($page - 1) * $per_page;

        $whereStr = implode(" AND ", $where);

        // Count total
        $countSql = "SELECT COUNT(*) as total FROM products p WHERE $whereStr";
        $countStmt = $conn->prepare($countSql);
        if ($types && $params)
            $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $total = $countStmt->get_result()->fetch_assoc()['total'];
        $countStmt->close();

        // Fetch products with primary image
        $sql = "SELECT p.*, pi.image_path as primary_image
                FROM products p
                LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
                WHERE $whereStr
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?";
        $stmt = $conn->prepare($sql);
        $allTypes = $types . "ii";
        $allParams = array_merge($params, [$per_page, $offset]);
        $stmt->bind_param($allTypes, ...$allParams);
        $stmt->execute();
        $products = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        $conn->close();

        jsonResponse([
            'status' => 'success',
            'data' => $products,
            'total' => (int) $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => (int) ceil($total / $per_page),
        ]);
        break;

    // ─── POST: Create new product ───────────────────────────────────────
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        $required = ['name', 'category', 'price', 'fabric', 'stock_qty'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                jsonResponse(['status' => 'error', 'message' => "Field '$field' is required"], 400);
            }
        }

        $sku = strtoupper('LS-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $data['name']), 0, 4)) . rand(1000, 9999));

        $stmt = $conn->prepare(
            "INSERT INTO products (sku, name, category, sub_category_id, colour_id, fabric_id, size_id, sleeve_type_id, neck_type_id, occasion_id, pattern_id, description, price, discount_price, fabric, stock_qty, status, is_new, is_bestseller)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $qty = (int) ($data['stock_qty'] ?? 0);
        $status = $qty === 0 ? 'Out of Stock' : ($qty < 10 ? 'Low Stock' : 'In Stock');
        $discount = !empty($data['discount_price']) ? (float) $data['discount_price'] : null;
        $is_new = (int) ($data['is_new'] ?? 0);
        $is_bestseller = (int) ($data['is_bestseller'] ?? 0);

        // Convert empty strings to null for integer fields
        $sub_cat = !empty($data['sub_category_id']) ? (int) $data['sub_category_id'] : null;
        $col = !empty($data['colour_id']) ? (int) $data['colour_id'] : null;
        $fab_id = !empty($data['fabric_id']) ? (int) $data['fabric_id'] : null;
        $size = !empty($data['size_id']) ? (int) $data['size_id'] : null;
        $sleeve = !empty($data['sleeve_type_id']) ? (int) $data['sleeve_type_id'] : null;
        $neck = !empty($data['neck_type_id']) ? (int) $data['neck_type_id'] : null;
        $occ = !empty($data['occasion_id']) ? (int) $data['occasion_id'] : null;
        $pat = !empty($data['pattern_id']) ? (int) $data['pattern_id'] : null;

        $stmt->bind_param(
            "sssiiiiiiiisddsisii",
            $sku,
            $data['name'],
            $data['category'],
            $sub_cat,
            $col,
            $fab_id,
            $size,
            $sleeve,
            $neck,
            $occ,
            $pat,
            $data['description'],
            $data['price'],
            $discount,
            $data['fabric'],
            $qty,
            $status,
            $is_new,
            $is_bestseller
        );

        if ($stmt->execute()) {
            $newId = $stmt->insert_id;
            $stmt->close();
            $conn->close();
            jsonResponse(['status' => 'success', 'message' => 'Product created successfully', 'id' => $newId, 'sku' => $sku], 201);
        } else {
            jsonResponse(['status' => 'error', 'message' => 'Failed to create product: ' . $conn->error], 500);
        }
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
