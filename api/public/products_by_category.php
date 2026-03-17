<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $slug = $_GET['slug'] ?? '';

    if (empty($slug)) {
        jsonResponse(['status' => 'error', 'message' => 'Category slug is required'], 400);
    }

    // 1. Get category info
    $stmt = $conn->prepare("SELECT id, name, hero_image, description FROM master_categories WHERE slug = ? AND status = 'Active'");
    $stmt->bind_param("s", $slug);
    $stmt->execute();
    $catResult = $stmt->get_result();
    $category = $catResult->fetch_assoc();

    if (!$category) {
        jsonResponse(['status' => 'error', 'message' => 'Category not found'], 404);
    }

    $categoryId = $category['id'];

    // 2. Fetch products for this category
    $sql = "SELECT p.*, pi.image_path as image
            FROM products p 
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE p.category_id = ? 
            ORDER BY p.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $categoryId);
    $stmt->execute();
    $productsResult = $stmt->get_result();

    $products = [];
    $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
        . '://' . $_SERVER['HTTP_HOST'] . '/';

    while ($row = $productsResult->fetch_assoc()) {
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
        'category' => $category,
        'data' => $products
    ]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn->close();
