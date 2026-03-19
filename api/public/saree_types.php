<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM saree_types ORDER BY id ASC";
    $result = $conn->query($sql);
    $data = [];
    $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
        . '://' . $_SERVER['HTTP_HOST'] . str_replace('api/public/saree_types.php', '', $_SERVER['SCRIPT_NAME']);

    while ($row = $result->fetch_assoc()) {
        if ($row['image'] && strpos($row['image'], 'http') !== 0 && strpos($row['image'], 'src') !== 0) {
            $row['image'] = $baseUrl . ltrim($row['image'], '/');
        }
        $data[] = $row;
    }
    jsonResponse(['status' => 'success', 'data' => $data]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn->close();
