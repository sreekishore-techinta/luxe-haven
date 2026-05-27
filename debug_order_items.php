<?php
$db = new mysqli('127.0.0.1', 'root', '', 'luxe_haven');
if ($db->connect_error) die("Connection failed: " . $db->connect_error);

echo "--- ORDER ITEMS TABLE ---\n";
$res = $db->query("DESCRIBE order_items");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
?>
