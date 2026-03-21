<?php
require_once 'config/db.php';
$conn = getDB();
$res = $conn->query("SELECT id, name, hero_image FROM saree_types");
echo "ID | Name | Hero Image\n";
echo "---|------|-----------\n";
while ($row = $res->fetch_assoc()) {
    echo "{$row['id']} | {$row['name']} | {$row['hero_image']}\n";
}
$conn->close();
?>
