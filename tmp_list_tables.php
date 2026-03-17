<?php
$conn = new mysqli('localhost', 'root', '', 'luxe_haven');
$res = $conn->query("SHOW TABLES");
while ($row = $res->fetch_array()) {
    echo $row[0] . "\n";
}
?>