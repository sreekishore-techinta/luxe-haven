<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Saree category is usually id = 1
    $catId = 1;

    $sql = "SELECT id, name, slug, image FROM master_sub_categories WHERE category_id = $catId AND status = 'Active' ORDER BY sort_order ASC, name ASC";
    $result = $conn->query($sql);

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    jsonResponse(['status' => 'success', 'data' => $data]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn->close();
