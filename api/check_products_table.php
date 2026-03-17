<?php
require_once 'config/db.php';
$conn = getDB();
$res = $conn->query("DESCRIBE products");
$cols = $res->fetch_all(MYSQLI_ASSOC);
echo json_encode($cols);
?>
