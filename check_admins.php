<?php
require_once 'config/database.php';
$conn = getDB();
$res = $conn->query("SELECT email FROM admins");
while ($row = $res->fetch_assoc()) {
    echo $row['email'] . "\n";
}
?>