<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'luxe_haven');

function getDB()
{
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        die(json_encode([
            "status" => "error",
            "message" => "Database connection failed: " . $conn->connect_error
        ]));
    }
    return $conn;
}
?>