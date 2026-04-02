<?php
require_once '../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn = getDB();
$where = ["1=1"];
$params = [];
$types = "";

// If a specific ID is requested, we bypass standard visibility/OOS filters to ensure the detail page can load.
$isSingleProduct = !empty($_GET['id']) || !empty($_GET['sku']);

if (!$isSingleProduct) {
    $showOutOfStock = !empty($_GET['show_oos']) || !empty($_GET['search']);
    if (!$showOutOfStock) {
        $where[] = "(p.status IN ('In Stock', 'Low Stock', 'Active'))";
        $where[] = "p.stock_qty > 0";
    } else {
        // Broaden visibility for collections: Show everything that's not Draft
        $where[] = "(p.status NOT IN ('Draft', 'Hidden'))";
    }
}

 else {
    // Single product requested by ID or SKU: only filter by id/sku
    if (!empty($_GET['id'])) {
        $where[] = "p.id = ?";
        $params[] = (int) $_GET['id'];
        $types .= "i";
    }
    if (!empty($_GET['sku'])) {
        $where[] = "p.sku = ?";
        $params[] = $_GET['sku'];
        $types .= "s";
    }
}

// Filter by category name (partial match for better discovery)
if (!empty($_GET['category'])) {
    $searchTerm = $_GET['category'];
    $cat = "%" . $conn->real_escape_string($searchTerm) . "%";
    
    // First attempt: exact phrase match in name, description, category, or fabric
    $whereQuery = "(mc.name LIKE ? OR p.name LIKE ? OR p.description LIKE ? OR mft.name LIKE ? OR st.name LIKE ?)";
    
    // Temporarily check if matches exist
    $checkSql = "SELECT COUNT(*) as count FROM products p 
                LEFT JOIN master_categories mc ON mc.id = p.category_id 
                LEFT JOIN master_fabric_types mft ON mft.id = p.fabric_id 
                LEFT JOIN saree_types st ON st.id = p.saree_type_id 
                WHERE $whereQuery";
    $stmtCheck = $conn->prepare($checkSql);
    $stmtCheck->bind_param("sssss", $cat, $cat, $cat, $cat, $cat);
    $stmtCheck->execute();
    $countRes = $stmtCheck->get_result()->fetch_assoc();
    $stmtCheck->close();

    if ($countRes['count'] > 0) {
        $where[] = $whereQuery;
        $params[] = $cat;
        $params[] = $cat;
        $params[] = $cat;
        $params[] = $cat;
        $params[] = $cat;
        $types .= "sssss";
    } else {
        // Fallback: Split by space and search for any word (at least 3 chars)
        $words = explode(" ", $searchTerm);
        $wordConditions = [];
        foreach ($words as $w) {
            $w = trim($w);
            if (strlen($w) >= 3) {
                $wordConditions[] = "(p.name LIKE ? OR p.description LIKE ? OR mc.name LIKE ?)";
                $wParam = "%" . $conn->real_escape_string($w) . "%";
                $params[] = $wParam;
                $params[] = $wParam;
                $params[] = $wParam;
                $types .= "sss";
            }
        }
        if (!empty($wordConditions)) {
            $where[] = "(" . implode(" OR ", $wordConditions) . ")";
        } else {
             // Absolute fallback if words are too short: everything in that main category if one exists
             $where[] = "1=1"; 
        }
    }
}


if (!empty($_GET['is_new'])) {
    $where[] = "p.is_new = 1";
}
if (!empty($_GET['is_bestseller'])) {
    $where[] = "p.is_bestseller = 1";
}

if (!empty($_GET['search'])) {
    $s = "%" . $conn->real_escape_string($_GET['search']) . "%";
    // Check product name, description, category, and SKU (product code)
    $where[] = "(p.name LIKE ? OR p.description LIKE ? OR mc.name LIKE ? OR p.sku LIKE ?)";
    $params[] = $s;
    $params[] = $s;
    $params[] = $s;
    $params[] = $s;
    $types .= "ssss";
}


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

$baseUrl = getBaseUrl();


// Normalize image paths and fetch gallery if single product
foreach ($products as &$p) {
    if (!empty($p['image'])) {
        $p['image'] = ltrim($p['image'], '/');
    } else {
        $p['image'] = null;
    }
    $p['in_stock'] = $p['status'] !== 'Out of Stock' && (int) $p['stock_qty'] > 0;


    // If fetching a single product, get gallery and combinations
    if (!empty($_GET['id']) && count($products) === 1) {
        $imgConn = getDB();
        $imgStmt = $imgConn->prepare("SELECT id, image_path FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC");
        $imgStmt->bind_param("i", $p['id']);
        $imgStmt->execute();
        $gallery = $imgStmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $imgStmt->close();

        // Main primary images handling
        foreach ($gallery as &$img) {
            if (!empty($img['image_path'])) {
                $img['url'] = ltrim($img['image_path'], '/');
            }
        }
        $p['images'] = $gallery;
        
        // Fetch Color Variants / Combinations
        $colorGroups = [];
        $combStmt = $imgConn->prepare("
            SELECT pc.*, mcl.name as color_name, mcl.hex_code 
            FROM product_combinations pc 
            LEFT JOIN master_colours mcl ON pc.colour_id = mcl.id 
            WHERE pc.product_id = ? 
            ORDER BY pc.id ASC
        ");
        $combStmt->bind_param("i", $p['id']);
        $combStmt->execute();
        $combinations = $combStmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $combStmt->close();

        foreach ($combinations as $comb) {
            $colorName = !empty($comb['color_name']) ? $comb['color_name'] : 'Default Options';
            
            if (!isset($colorGroups[$colorName])) {
                $colorGroups[$colorName] = [
                    'color' => $colorName,
                    'hex' => $comb['hex_code'] ?? null,
                    'images' => [],
                    'variants' => []
                ];
                
                // Add the main product image if we can, to ensure the gallery isn't empty
                if (!empty($p['image'])) {
                    $colorGroups[$colorName]['images'][] = ltrim($p['image'], '/');
                }
            }
            
            if (!empty($comb['image_path'])) {
                $variantImg = ltrim($comb['image_path'], '/');
                if (!in_array($variantImg, $colorGroups[$colorName]['images'])) {
                    $colorGroups[$colorName]['images'][] = $variantImg;
                }
            }

            $colorGroups[$colorName]['variants'][] = [
                'id' => $comb['id'],
                'size_id' => $comb['size_id'],
                'stock' => (int)$comb['stock_qty'],
                'price' => (float)$comb['price']
            ];
        }

        $p['colors'] = array_values($colorGroups);

        // Fetch Related Products natively locally
        $relatedProducts = [];
        if (!empty($p['category_id'])) {
            $relStmt = $imgConn->prepare("
                SELECT p.*, pi.image_path as image, mc.name as category_name, mft.name as fabric_name
                FROM products p 
                LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
                LEFT JOIN master_categories mc ON mc.id = p.category_id
                LEFT JOIN master_fabric_types mft ON mft.id = p.fabric_id
                WHERE p.category_id = ? AND p.id != ? 
                ORDER BY p.created_at DESC LIMIT 4
            ");
            $relStmt->bind_param("ii", $p['category_id'], $p['id']);
            $relStmt->execute();
            $relatedProducts = $relStmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $relStmt->close();

            foreach ($relatedProducts as &$rp) {
                if (!empty($rp['image'])) $rp['image'] = ltrim($rp['image'], '/');
            }
            unset($rp);
        }
        $p['related_products'] = $relatedProducts;
        $imgConn->close();
    }
}
unset($p);

jsonResponse(['status' => 'success', 'data' => $products]);
