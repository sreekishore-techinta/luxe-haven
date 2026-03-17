<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT id, name, slug FROM master_categories WHERE status = 'Active' ORDER BY sort_order ASC, name ASC";
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
