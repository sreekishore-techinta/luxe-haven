<?php
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'api/config/db.php';
$conn = getDB();
$res = $conn->query("DESCRIBE saree_types");
while($row = $res->fetch_assoc()) {
    echo $row['Field'] . "\n";
}
