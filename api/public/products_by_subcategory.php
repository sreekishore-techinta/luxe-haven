<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $subcategory_slug = $_GET['subcategory'] ?? '';

    if (empty($subcategory_slug)) {
        jsonResponse(['status' => 'error', 'message' => 'Subcategory slug is required'], 400);
    }

    // 1. Try Saree Types only
    $stmt = $conn->prepare("SELECT id, name, description, image, hero_image FROM saree_types WHERE slug = ?");
    $stmt->bind_param("s", $subcategory_slug);
    $stmt->execute();
    $sub_res = $stmt->get_result();
    $subcategory = $sub_res->fetch_assoc();

    if (!$subcategory) {
        jsonResponse(['status' => 'error', 'message' => 'Style not found'], 404);
    }

    $sub_id = $subcategory['id'];
    $filter_col = "p.saree_type_id";

    $sql = "SELECT p.*, pi.image_path as image 
            FROM products p 
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
            WHERE $filter_col = ? AND p.status != 'Inactive'
            ORDER BY p.id DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $sub_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $products = [];
    $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
        . '://' . $_SERVER['HTTP_HOST'] . '/';

    while ($row = $result->fetch_assoc()) {
        if (!empty($row['image'])) {
            if (strpos($row['image'], 'http') !== 0) {
                $row['image'] = $baseUrl . ltrim($row['image'], '/');
            }
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
