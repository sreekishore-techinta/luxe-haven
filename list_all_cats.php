<?php
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'api/config/db.php';
$conn = getDB();

echo "--- ALL MASTER CATEGORIES ---\n";
$res = $conn->query("SELECT id, name, slug, status, show_on_menu FROM master_categories");
while ($row = $res->fetch_assoc()) echo json_encode($row) . "\n";

echo "\n--- ALL SAREE TYPES ---\n";
$res = $conn->query("SELECT id, name, slug, status, show_on_menu FROM saree_types");
while ($row = $res->fetch_assoc()) echo json_encode($row) . "\n";
?>
