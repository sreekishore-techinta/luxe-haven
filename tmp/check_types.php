<?php
require_once 'api/config/db.php';
$conn = getDB();
$res = $conn->query("SELECT * FROM saree_types");
while ($row = $res->fetch_assoc()) {
    echo $row['name'] . ' | ' . $row['slug'] . ' | ' . $row['hero_image'] . "\n";
}
$conn->close();
