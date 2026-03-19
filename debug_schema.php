<?php
require_once 'api/config/db.php';
try {
    $conn = getDB();
    echo "Connected successfully\n";
    $res = $conn->query("SHOW COLUMNS FROM products");
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            echo $row['Field'] . " (" . $row['Type'] . ")\n";
        }
    } else {
        echo "Error: " . $conn->error . "\n";
    }
} catch (Exception $e) {
    echo "Caught exception: " . $e->getMessage() . "\n";
}
?>
