<?php
require_once '../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn = getDB();
$where = ["1=1"];
$showOutOfStock = !empty($_GET['show_oos']);
if (!$showOutOfStock) {
    $where[] = "p.status IN ('In Stock', 'Low Stock')";
    $where[] = "p.stock_qty > 0";
}
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
// Filter by ID
if (!empty($_GET['id'])) {
    $where[] = "p.id = ?";
    $params[] = (int) $_GET['id'];
    $types .= "i";
}

// Filter by SKU
if (!empty($_GET['sku'])) {
    $where[] = "p.sku = ?";
    $params[] = $_GET['sku'];
    $types .= "s";
}

if (!empty($_GET['search'])) {
    $s = "%" . $conn->real_escape_string($_GET['search']) . "%";
    $where[] = "(p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)";
    $params[] = $s;
    $params[] = $s;
    $params[] = $s;
    $types .= "sss";
}

// Filters handled above

$whereStr = implode(" AND ", $where);

$page = max(1, (int) ($_GET['page'] ?? 1));
$per_page = (int) ($_GET['per_page'] ?? 50);
$offset = ($page - 1) * $per_page;

$sql = "SELECT p.*,
            pi.image_path as image,
            mc.name as category_name,
            mb.name as brand_name,
            mcl.name as colour_name,
            mft.name as fabric_name,
            msz.name as size_name,
            st.name as saree_type_name,
            bs.name as blouse_style_name
        FROM products p
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
        LEFT JOIN master_categories mc ON mc.id = p.category_id
        LEFT JOIN master_brands mb ON mb.id = p.brand_id
        LEFT JOIN master_colours mcl ON mcl.id = p.colour_id
        LEFT JOIN master_fabric_types mft ON mft.id = p.fabric_id
        LEFT JOIN master_sizes msz ON msz.id = p.size_id
        LEFT JOIN saree_types st ON st.id = p.saree_type_id
        LEFT JOIN blouse_styles bs ON bs.id = p.blouse_style_id
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

$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
    . '://' . $_SERVER['HTTP_HOST'] . str_replace('api/public/products.php', '', $_SERVER['SCRIPT_NAME']);

// Normalize image paths and fetch gallery if single product
foreach ($products as &$p) {
    if (!empty($p['image'])) {
        if (strpos($p['image'], 'http') !== 0) {
            $p['image'] = $baseUrl . ltrim($p['image'], '/');
        }
    } else {
        $p['image'] = null;
    }
    $p['in_stock'] = $p['status'] !== 'Out of Stock' && (int) $p['stock_qty'] > 0;

    // If fetching a single product, get gallery
    if (!empty($_GET['id']) && count($products) === 1) {
        $imgConn = getDB();
        $imgStmt = $imgConn->prepare("SELECT id, image_path FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC");
        $imgStmt->bind_param("i", $p['id']);
        $imgStmt->execute();
        $gallery = $imgStmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $imgStmt->close();
        $imgConn->close();

        foreach ($gallery as &$img) {
            if (!empty($img['image_path'])) {
                if (strpos($img['image_path'], 'http') !== 0) {
                    $img['url'] = $baseUrl . ltrim($img['image_path'], '/');
                } else {
                    $img['url'] = $img['image_path'];
                }
            }
        }
        $p['images'] = $gallery;
    }
}
unset($p);

jsonResponse(['status' => 'success', 'data' => $products]);
