<?php
require_once 'api/config/db.php';
$conn = getDB();
$res = $conn->query("DESCRIBE products");
$out = [];
while ($row = $res->fetch_assoc()) {
    $out[] = $row['Field'];
}
file_put_contents('actual_columns.txt', implode(", ", $out));
echo "Done.\n";
?>
