<?php
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'api/config/db.php';
$conn = getDB();

echo "Hiding duplicate category ID 22...\n";

$conn->query("UPDATE master_categories SET show_on_menu = 0, status = 'Inactive' WHERE id = 22");

echo "Done.\n";
?>
