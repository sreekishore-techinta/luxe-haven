<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM saree_types ORDER BY id ASC";
    $result = $conn->query($sql);
    $data = [];
    $baseUrl = "http://localhost/luxe-haven/api/";
    while ($row = $result->fetch_assoc()) {
        if ($row['image'] && !str_starts_with($row['image'], 'http') && !str_starts_with($row['image'], 'src')) {
            $row['image'] = $baseUrl . $row['image'];
        }
        $data[] = $row;
    }
    jsonResponse(['status' => 'success', 'data' => $data]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn->close();
