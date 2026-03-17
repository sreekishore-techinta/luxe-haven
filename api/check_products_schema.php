<?php
require_once 'config/db.php';
$conn = getDB();
$res = $conn->query("DESCRIBE products");
$cols = [];
while ($r = $res->fetch_assoc())
    $cols[] = $r;
echo json_encode($cols);
$conn->close();
?>
