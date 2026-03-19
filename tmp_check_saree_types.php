<?php
require_once 'api/config/db.php';
$conn = getDB();
$sql = "SELECT COUNT(*) as count FROM saree_types";
$result = $conn->query($sql);
if ($result) {
    $row = $result->fetch_assoc();
    echo "Total saree_types: " . $row['count'] . "\n";
} else {
    echo "Table saree_types does not exist or error: " . $conn->error . "\n";
}
$conn->close();
