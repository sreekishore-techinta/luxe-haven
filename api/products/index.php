<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        $where = ["1=1"];
        $params = [];
        $types = "";

        if (!empty($_GET['search'])) {
            $s = "%" . $_GET['search'] . "%";
            $searchType = $_GET['search_type'] ?? 'name';

            if ($searchType === 'id') {
                $where[] = "p.id = ?";
                $params[] = (int) $_GET['search'];
                $types .= "i";
            } elseif ($searchType === 'category') {
                $where[] = "mc.name LIKE ?";
                $params[] = $s;
                $types .= "s";
            } else {
                $where[] = "(p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)";
                $params = array_merge($params, [$s, $s, $s]);
                $types .= "sss";
            }
        }

        if (!empty($_GET['category_id'])) {
            $where[] = "p.category_id = ?";
            $params[] = (int) $_GET['category_id'];
            $types .= "i";
        }

        if (!empty($_GET['status']) && $_GET['status'] !== 'All Status') {
            $where[] = "p.status = ?";
            $params[] = $_GET['status'];
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

        // Sorting
        $allowedSort = ['price', 'created_at', 'stock_quantity'];
        $sortBy = in_array($_GET['sort_by'] ?? '', $allowedSort) ? $_GET['sort_by'] : 'created_at';
        $order = strtoupper($_GET['order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $per_page = (int) ($_GET['per_page'] ?? 10);
        $offset = ($page - 1) * $per_page;

        $whereStr = implode(" AND ", $where);

        $countSql = "SELECT COUNT(*) as total FROM products p LEFT JOIN master_categories mc ON mc.id = p.category_id WHERE $whereStr";
        $countStmt = $conn->prepare($countSql);
        if ($types && $params)
            $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $total = $countStmt->get_result()->fetch_assoc()['total'];
        $countStmt->close();

        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
            . '://' . $_SERVER['HTTP_HOST'] . '/';

        $sql = "SELECT p.*, mc.name as category_name,
                       mcl.name as colour_name, mft.name as fabric_name,
                       msz.name as size_name,
                       (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
                FROM products p
                LEFT JOIN master_categories mc ON mc.id = p.category_id
                LEFT JOIN master_colours mcl ON mcl.id = p.colour_id
                LEFT JOIN master_fabric_types mft ON mft.id = p.fabric_id
                LEFT JOIN master_sizes msz ON msz.id = p.size_id
                WHERE $whereStr
                ORDER BY p.$sortBy $order
                LIMIT ? OFFSET ?";

        $stmt = $conn->prepare($sql);
        $allTypes = $types . "ii";
        $allParams = array_merge($params, [$per_page, $offset]);
        $stmt->bind_param($allTypes, ...$allParams);
        $stmt->execute();
        $products = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        // Normalize images to full URLs
        foreach ($products as &$p) {
            if (!empty($p['primary_image'])) {
                if (strpos($p['primary_image'], 'http') !== 0) {
                    $p['primary_image'] = $baseUrl . ltrim($p['primary_image'], '/');
                }
            } else {
                $p['primary_image'] = null;
            }
            // Compatibility alias
            $p['image'] = $p['primary_image'];
        }
        unset($p);

        jsonResponse([
            'status' => 'success',
            'data' => $products,
            'total' => (int) $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => (int) ceil($total / $per_page)
        ]);
        break;

    case 'POST':
        // Silence raw errors to prevent them from breaking the JSON response
        ini_set('display_errors', 0);
        error_reporting(0);

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['name']) || empty($data['price'])) {
                jsonResponse(['status' => 'error', 'message' => 'Name and price are required'], 400);
            }

            // Create variables for bind_param (v5.3+ requires variables for reference)
            $name = $data['name'];
            $slug = !empty($data['slug']) ? $data['slug'] : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));

            $cat_id = !empty($data['category_id']) ? (int) $data['category_id'] : null;
            $fabric_id = !empty($data['fabric_id']) ? (int) $data['fabric_id'] : null;
            $color_id = !empty($data['colour_id']) ? (int) $data['colour_id'] : null;
            $size_id = !empty($data['size_id']) ? (int) $data['size_id'] : null;

            $saree_type_id = !empty($data['saree_type_id']) ? (int) $data['saree_type_id'] : null;
            $blouse_style_id = !empty($data['blouse_style_id']) ? (int) $data['blouse_style_id'] : null;

            $desc = $data['description'] ?? '';
            $price = (float) ($data['price'] ?? 0);
            $mrp = !empty($data['mrp_price']) ? (float) $data['mrp_price'] : $price;
            $discount = (float) ($data['discount'] ?? 0);

            // Default stock to 50 if not provided
            $stockInput = isset($data['stock_quantity']) ? $data['stock_quantity'] : ($data['stock'] ?? null);
            $stock = ($stockInput === null || $stockInput === '') ? 50 : (int) $stockInput;

            $sku = !empty($data['sku']) ? $data['sku'] : strtoupper('LH-' . substr(uniqid(), -6));

            $avail = $stock <= 0 ? 'Out of Stock' : ($stock < 10 ? 'Low Stock' : 'In Stock');
            $status = $data['status'] ?? 'Active';
            if ($stock <= 0)
                $status = 'Out of Stock';

            $work = $data['work_type'] ?? '';
            $blouse = $data['blouse_included'] ?? 0;
            $length = $data['saree_length'] ?? '';
            $is_bestseller = (int) ($data['is_bestseller'] ?? 0);
            $is_new_arrival = (int) ($data['is_new_arrival'] ?? 0);
            $meta_t = $data['meta_title'] ?? '';
            $meta_d = $data['meta_description'] ?? '';

            $sql = "INSERT INTO products (name, slug, category_id, category, description, price, mrp_price, discount, stock_quantity, stock_qty, sku, availability_status, status, fabric_id, colour_id, size_id, saree_type_id, blouse_style_id, work_type, blouse_included, saree_length, is_bestseller, is_new, is_new_arrival, meta_title, meta_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $conn->error);
            }

            $stmt->bind_param(
                "ssiisdddiisssiiiiisisiiiiss",
                $name,
                $slug,
                $cat_id, // category_id
                $cat_id, // category
                $desc,
                $price,
                $mrp,
                $discount,
                $stock, // stock_quantity
                $stock, // stock_qty
                $sku,
                $avail, // availability_status
                $status, // status
                $fabric_id,
                $color_id,
                $size_id,
                $saree_type_id,
                $blouse_style_id,
                $work,
                $blouse,
                $length,
                $is_bestseller,
                $is_new_arrival, // is_new
                $is_new_arrival, // is_new_arrival
                $meta_t,
                $meta_d
            );

            if ($stmt->execute()) {
                jsonResponse(['status' => 'success', 'message' => 'Product created', 'id' => $stmt->insert_id], 201);
            } else {
                jsonResponse(['status' => 'error', 'message' => 'Query failed: ' . $stmt->error], 500);
            }
        } catch (Exception $e) {
            jsonResponse(['status' => 'error', 'message' => 'System error: ' . $e->getMessage()], 500);
        }
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
?>
