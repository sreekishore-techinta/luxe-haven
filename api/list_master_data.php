<?php
require_once 'config/db.php';
$conn = getDB();

$tables = [
    'categories' => 'master_categories',
    'saree_types' => 'saree_types',
    'sub_categories' => 'master_sub_categories',
];

$result = [];
foreach ($tables as $key => $table) {
    $res = $conn->query("SELECT id, name FROM $table ORDER BY id ASC");
    $rows = [];
    while ($row = $res->fetch_assoc()) $rows[] = $row;
    $result[$key] = $rows;
}

header('Content-Type: application/json');
echo json_encode($result, JSON_PRETTY_PRINT);
$conn->close();
?>
