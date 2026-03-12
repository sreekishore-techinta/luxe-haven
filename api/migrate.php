<?php
require_once 'config/db.php';

$conn = getDB();

$sql = file_get_contents(__DIR__ . '/database/schema.sql');

// Split the SQL file into individual queries using semicolon as a delimiter
// This is a naive split and might fail on semicolons inside strings or triggers,
// but for this schema it should be fine.
$queries = explode(';', $sql);

$success = 0;
$errors = [];

foreach ($queries as $query) {
    $q = trim($query);
    if (!empty($q)) {
        if ($conn->query($q)) {
            $success++;
        } else {
            $errors[] = "Error executing query: " . $conn->error . "\nQuery: " . substr($q, 0, 100) . "...";
        }
    }
}

echo "Database Migration Completed\n";
echo "Successfully executed $success queries.\n";
if (!empty($errors)) {
    echo "Encountered " . count($errors) . " errors:\n";
    foreach ($errors as $error) {
        echo "- $error\n";
    }
}

$conn->close();
