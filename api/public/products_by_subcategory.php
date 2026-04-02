<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $subcategory_slug = $_GET['subcategory'] ?? '';

    if (empty($subcategory_slug)) {
        jsonResponse(['status' => 'error', 'message' => 'Subcategory slug is required'], 400);
    }

    // 1. Try Saree Types
    $stmt = $conn->prepare("SELECT id, name, description, image, hero_image FROM saree_types WHERE slug = ?");
    $stmt->bind_param("s", $subcategory_slug);
    $stmt->execute();
    $sub_res = $stmt->get_result();
    $subcategory = $sub_res->fetch_assoc();

    // 2. Try Master Categories if not found or in addition
    $stmt_cat = $conn->prepare("SELECT id FROM master_categories WHERE slug = ?");
    $stmt_cat->bind_param("s", $subcategory_slug);
    $stmt_cat->execute();
    $cat_res = $stmt_cat->get_result();
    $category_info = $cat_res->fetch_assoc();

    if (!$subcategory && !$category_info) {
        jsonResponse(['status' => 'error', 'message' => 'Style not found'], 404);
    }

    // Set subcategory for metadata if only category info found
    if (!$subcategory) {
        $subcategory = ['name' => $subcategory_slug, 'id' => null];
    }

    $sub_id = $subcategory['id'] ?? -1;
    $cat_id = $category_info['id'] ?? -1;

    $sql = "SELECT p.*, pi.image_path as image 
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
            WHERE (p.saree_type_id = ? OR p.category_id = ?) AND p.status != 'Inactive'
            ORDER BY p.id DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $sub_id, $cat_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $products = [];
    while ($row = $result->fetch_assoc()) {
        if (!empty($row['image'])) {
            $row['image'] = ltrim($row['image'], '/');
        } else {
            $row['image'] = null;
        }
        $products[] = $row;
    }


    jsonResponse([
        'status' => 'success',
        'subcategory' => $subcategory,
        'data' => $products
    ]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn->close();
