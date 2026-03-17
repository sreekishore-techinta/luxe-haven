<?php
$conn = new mysqli('localhost', 'root', '', 'luxe_haven');
$res = $conn->query("SHOW COLUMNS FROM blouse_styles");
while ($row = $res->fetch_assoc()) {
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
}
?>