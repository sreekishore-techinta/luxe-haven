<?php
require_once 'api/config/db.php';
$conn = getDB();
$res = $conn->query("SHOW TABLES");
$tables = [];
while ($row = $res->fetch_array()) {
    $tables[] = $row[0];
}
echo json_encode($tables);
?>
