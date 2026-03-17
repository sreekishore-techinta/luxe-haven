<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();
$type = $_GET['type'] ?? 'all';

$data = [];

if ($type === 'categories' || $type === 'all') {
    $res = $conn->query("SELECT id, name FROM master_categories WHERE status = 'Active' ORDER BY name");
    $data['categories'] = $res->fetch_all(MYSQLI_ASSOC);
}


if ($type === 'colours' || $type === 'all') {
    $res = $conn->query("SELECT id, name, hex_code FROM master_colours WHERE status = 'Active' ORDER BY name");
    $data['colours'] = $res->fetch_all(MYSQLI_ASSOC);
}

if ($type === 'fabric_types' || $type === 'all') {
    $res = $conn->query("SELECT id, name FROM master_fabric_types WHERE status = 'Active' ORDER BY name");
    $data['fabric_types'] = $res->fetch_all(MYSQLI_ASSOC);
}

if ($type === 'sizes' || $type === 'all') {
    $res = $conn->query("SELECT id, name FROM master_sizes WHERE status = 'Active' ORDER BY name");
    $data['sizes'] = $res->fetch_all(MYSQLI_ASSOC);
}

if ($type === 'saree_types' || $type === 'all') {
    $res = $conn->query("SELECT id, name FROM saree_types ORDER BY name");
    $data['saree_types'] = $res->fetch_all(MYSQLI_ASSOC);
}

if ($type === 'blouse_styles' || $type === 'all') {
    $res = $conn->query("SELECT id, name FROM blouse_styles ORDER BY name");
    $data['blouse_styles'] = $res->fetch_all(MYSQLI_ASSOC);
}

jsonResponse(['status' => 'success', 'data' => $data]);
?>
