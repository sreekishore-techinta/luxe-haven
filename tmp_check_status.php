<?php
require_once 'api/config/db.php';
$conn = getDB();
$res = $conn->query("SELECT status, count(*) FROM products GROUP BY status");
while ($row = $res->fetch_array())
    echo "Status: " . $row[0] . " | Count: " . $row[1] . "\n";
$conn->close();
?>