<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch categories
    $sql = "SELECT id, name, slug FROM master_categories WHERE status = 'Active' ORDER BY sort_order ASC, name ASC";
    $result = $conn->query($sql);

    $categories = [];
    while ($cat = $result->fetch_assoc()) {
        $catId = $cat['id'];

        // Fetch subcategories for this category
        $subSql = "SELECT id, name, slug, image FROM master_sub_categories WHERE category_id = $catId AND status = 'Active' ORDER BY sort_order ASC, name ASC";
        $subRes = $conn->query($subSql);

        $subCategories = [];
        while ($sub = $subRes->fetch_assoc()) {
            $subCategories[] = $sub;
        }

        $cat['sub_categories'] = $subCategories;
        $categories[] = $cat;
    }

    jsonResponse(['status' => 'success', 'data' => $categories]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn->close();
