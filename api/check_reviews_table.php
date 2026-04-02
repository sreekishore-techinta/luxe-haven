<?php
require_once __DIR__ . '/config/db.php';
$conn = getDB();
$result = $conn->query("SHOW TABLES LIKE 'reviews'");
if ($result->num_rows > 0) {
    echo "Table 'reviews' EXISTS";
} else {
    echo "Table 'reviews' MISSING";
}
$conn->close();
