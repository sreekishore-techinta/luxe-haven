<?php
header("Content-Type: text/plain");
require_once 'config/database.php';

echo "Checking MySQL Connection...\n";
try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    if ($conn->connect_error) {
        echo "FAIL: Could not connect to MySQL server: " . $conn->connect_error . "\n";
        echo "ACTION: Please make sure MySQL is started in your XAMPP Control Panel.\n";
        exit;
    }
    echo "SUCCESS: Connected to MySQL server.\n";

    echo "Checking Database '" . DB_NAME . "'...\n";
    if (!$conn->select_db(DB_NAME)) {
        echo "FAIL: Database '" . DB_NAME . "' does not exist.\n";
        echo "ACTION: Run the migration script or create the database.\n";
        exit;
    }
    echo "SUCCESS: Database found.\n";

    echo "Checking 'admins' table...\n";
    $res = $conn->query("SHOW TABLES LIKE 'admins'");
    if ($res->num_rows === 0) {
        echo "FAIL: 'admins' table does not exist.\n";
        echo "ACTION: Run the setup_admin.php or migration script.\n";
        exit;
    }
    echo "SUCCESS: 'admins' table exists.\n";

    echo "Checking Admin Users...\n";
    $res = $conn->query("SELECT email, role FROM admins");
    if ($res->num_rows === 0) {
        echo "FAIL: No admin users found.\n";
        echo "ACTION: Run setup_admin.php to create default admin.\n";
    } else {
        while ($row = $res->fetch_assoc()) {
            echo "FOUND: " . $row['email'] . " (" . $row['role'] . ")\n";
        }
    }

    $conn->close();
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>