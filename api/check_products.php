<?php
require_once 'config/db.php';
$conn = getDB();
$res = $conn->query("DESCRIBE products");
while ($row = $res->fetch_assoc())
    echo $row['Field'] . " ";
?>
