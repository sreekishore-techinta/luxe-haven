<?php
require_once 'api/config/db.php';
$conn = getDB();
$res = $conn->query("DESCRIBE orders");
$cols = [];
while ($row = $res->fetch_assoc())
    $cols[] = $row['Field'];
echo "Orders Columns: " . implode(", ", $cols) . "\n";

$res = $conn->query("DESCRIBE customers");
$cols = [];
while ($row = $res->fetch_assoc())
    $cols[] = $row['Field'];
echo "Customers Columns: " . implode(", ", $cols) . "\n";
$conn->close();
