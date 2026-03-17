<?php
$conn = new mysqli('localhost', 'root', '', 'luxe_haven');
echo "--- sleeve_types ---\n";
$res1 = $conn->query("SHOW COLUMNS FROM master_sleeve_types");
while ($row = $res1->fetch_assoc())
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
echo "\n--- neck_types ---\n";
$res2 = $conn->query("SHOW COLUMNS FROM master_neck_types");
while ($row = $res2->fetch_assoc())
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
?>