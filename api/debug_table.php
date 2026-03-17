<?php
require_once 'config/db.php';
$conn = getDB();
$res = $conn->query("DESCRIBE orders");
$cols = [];
while ($row = $res->fetch_assoc()) {
    $cols[] = $row['Field'];
}
echo json_encode(['columns' => $cols]);
$conn->close();
?>
