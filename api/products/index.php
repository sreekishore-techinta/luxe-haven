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

        $countSql = "SELECT COUNT(*) as total FROM products p 
                     LEFT JOIN product_combinations pc ON pc.product_id = p.id 
                     LEFT JOIN master_categories mc ON mc.id = p.category_id 
                     WHERE $whereStr";
        $countStmt = $conn->prepare($countSql);
        if ($types && $params)
            $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $total = $countStmt->get_result()->fetch_assoc()['total'];
        $countStmt->close();

        $baseUrl = getBaseUrl();


        $sql = "SELECT p.*, mc.name as category_name, st.name as saree_type_name,
                       mcl_v.name as variant_colour_name, msz_v.name as variant_size_name,
                       pc.id as combination_id, pc.stock_qty as variant_stock, pc.price as variant_price, pc.image_path as variant_image,
                       mft.name as fabric_name,
                       mcl.name as colour_name, msz.name as size_name,
                       (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
                FROM products p
                LEFT JOIN product_combinations pc ON pc.product_id = p.id
                LEFT JOIN master_categories mc ON mc.id = p.category_id
                LEFT JOIN master_colours mcl ON mcl.id = p.colour_id
                LEFT JOIN master_fabric_types mft ON mft.id = p.fabric_id
                LEFT JOIN master_sizes msz ON msz.id = p.size_id
                LEFT JOIN master_colours mcl_v ON mcl_v.id = pc.colour_id
                LEFT JOIN master_sizes msz_v ON msz_v.id = pc.size_id
                LEFT JOIN saree_types st ON st.id = p.saree_type_id
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

        // Normalize images to full URLs and fallback to main product data if variant is current
        foreach ($products as &$p) {
            $p['primary_image'] = !empty($p['primary_image']) ? ltrim($p['primary_image'], '/') : null;
            $p['image'] = $p['primary_image'];

            // If variant exists, override main product display data
            if ($p['combination_id']) {
                $p['name'] = $p['name'] . " (" . ($p['variant_size_name'] ?: 'N/A') . " - " . ($p['variant_colour_name'] ?: 'N/A') . ")";
                $p['stock_qty'] = $p['variant_stock'];
                $p['price'] = $p['variant_price'] ?: $p['price'];
                if ($p['variant_image']) {
                    $p['primary_image'] = ltrim($p['variant_image'], '/');
                    $p['image'] = $p['primary_image'];
                }
            }
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
        // Disable errors in output to prevent breaking JSON
        ini_set('display_errors', 0);
        error_reporting(0);

        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (empty($data['name']) || empty($data['price'])) {
                jsonResponse(['status' => 'error', 'message' => 'Name and price are required'], 400);
            }

            // Variables for binding
            $name = $data['name'];
            $slug = !empty($data['slug']) ? $data['slug'] : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
            $cat_id = !empty($data['category_id']) ? (int) $data['category_id'] : null;
            $fabric_id = !empty($data['fabric_id']) ? (int) $data['fabric_id'] : null;
            $color_id = !empty($data['colour_id']) ? (int) $data['colour_id'] : null;
            $size_id = !empty($data['size_id']) ? (int) $data['size_id'] : null;
            $saree_type_id = !empty($data['saree_type_id']) ? (int) $data['saree_type_id'] : null;
            $desc = $data['description'] ?? '';
            $price = (float) ($data['price'] ?? 0);
            $mrp = !empty($data['mrp_price']) ? (float) $data['mrp_price'] : $price;
            $stock = (isset($data['stock_qty']) && $data['stock_qty'] !== '') ? (int)$data['stock_qty'] : (isset($data['stock']) ? (int)$data['stock'] : 50);
            $sku = !empty($data['sku']) ? $data['sku'] : strtoupper('LH-' . substr(uniqid(), -6));
            $status = $data['status'] ?? 'Active';
            if ($stock <= 0) $status = 'Out of Stock';

            $work = $data['work_type'] ?? '';
            $blouse = (int)($data['blouse_included'] ?? 1);
            $length = $data['saree_length'] ?? '';
            $is_bestseller = (int) ($data['is_bestseller'] ?? 0);
            $is_new = (int) ($data['is_new'] ?? 1);
            $meta_t = $data['meta_title'] ?? '';
            $meta_d = $data['meta_description'] ?? '';

            // Using the columns confirmed by most migration scripts
            $sql = "INSERT INTO products (name, slug, category_id, saree_type_id, description, price, mrp_price, stock_qty, sku, status, fabric_id, colour_id, size_id, work_type, blouse_included, saree_length, is_bestseller, is_new, meta_title, meta_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                jsonResponse(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error], 500);
            }

            $stmt->bind_param(
                "ssiisddissiiisisiiss",
                $name, $slug, $cat_id, $saree_type_id, $desc, $price, $mrp, $stock, $sku, $status, $fabric_id, $color_id, $size_id, $work, $blouse, $length, $is_bestseller, $is_new, $meta_t, $meta_d
            );

            if ($stmt->execute()) {
                $id = $stmt->insert_id;
                
                // ── Handle Combinations ──────────────────────────────────────
                if (isset($data['combinations']) && is_array($data['combinations'])) {
                    // Ensure Table
                    $conn->query("CREATE TABLE IF NOT EXISTS product_combinations (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        product_id INT NOT NULL,
                        colour_id INT,
                        size_id INT,
                        stock_qty INT DEFAULT 0,
                        price DECIMAL(10,2) DEFAULT 0.00,
                        image_path VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX (product_id)
                    )");
                    
                    // Ensure older tables are patched correctly without crashing JSON outputs
                    $checkCols = $conn->query("SHOW COLUMNS FROM product_combinations LIKE 'image_path'");
                    if ($checkCols && $checkCols->num_rows === 0) {
                        $conn->query("ALTER TABLE product_combinations ADD COLUMN image_path VARCHAR(255) AFTER price");
                    }

                    $cStmt = $conn->prepare("INSERT INTO product_combinations (product_id, colour_id, size_id, stock_qty, price, image_path) VALUES (?, ?, ?, ?, ?, ?)");
                    foreach ($data['combinations'] as $c) {
                        $c_cid = !empty($c['colour_id']) ? (int)$c['colour_id'] : null;
                        $c_sid = !empty($c['size_id']) ? (int)$c['size_id'] : null;
                        $c_qty = (int)($c['stock_qty'] ?? 0);
                        $c_price = (float)($c['price'] ?? 0);
                        $c_img = !empty($c['image_path']) ? $c['image_path'] : null;
                        $cStmt->bind_param("iiiids", $id, $c_cid, $c_sid, $c_qty, $c_price, $c_img);
                        $cStmt->execute();
                    }
                    $cStmt->close();
                }

                jsonResponse(['status' => 'success', 'message' => 'Product created', 'id' => $id], 201);
            } else {
                jsonResponse(['status' => 'error', 'message' => 'Execute failed: ' . $stmt->error], 500);
            }
        } catch (Exception $e) {
            jsonResponse(['status' => 'error', 'message' => 'System error: ' . $e->getMessage()], 500);
        }
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
?>
