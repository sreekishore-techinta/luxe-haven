<?php
require_once 'api/config/db.php';
$conn = getDB();

$sql = file_get_contents('blouse_styles.sql');

if ($conn->multi_query($sql)) {
    do {
        if ($result = $conn->store_result()) {
            $result->free();
        }
    } while ($conn->more_results() && $conn->next_result());
    echo "Blouse styles table created and seeded successfully.";
} else {
    echo "Error: " . $conn->error;
}
$conn->close();
?>