<?php
$conn = new mysqli('localhost', 'root', '', 'luxe_haven');
$res = $conn->query("SHOW COLUMNS FROM products");
while ($row = $res->fetch_assoc()) {
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
}
?>