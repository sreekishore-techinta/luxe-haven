<?php
$conn = new mysqli('localhost', 'root', '', 'luxe_haven');
$res = $conn->query("SELECT id, name FROM master_categories");
while ($row = $res->fetch_assoc()) {
    echo $row['id'] . ": " . $row['name'] . "\n";
}
?>