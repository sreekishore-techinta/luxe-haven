<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM saree_types ORDER BY id ASC";
    $result = $conn->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        if (!empty($row['image'])) {
            $row['image'] = ltrim($row['image'], '/');
        }
        $data[] = $row;
    }

    jsonResponse(['status' => 'success', 'data' => $data]);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn->close();
