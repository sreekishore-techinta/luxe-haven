<?php
require_once __DIR__ . '/../api/config/db.php';
$conn = getDB();

// Check for existing settings table
$r = $conn->query("SHOW TABLES LIKE '%setting%'");
echo "--- Settings-like tables ---\n";
while($row = $r->fetch_row()) echo $row[0] . "\n";

// Also check get_settings.php to see how it stores data
echo "\n--- All tables ---\n";
$r2 = $conn->query("SHOW TABLES");
while($row = $r2->fetch_row()) echo $row[0] . "\n";
