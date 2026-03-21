<?php
// Strict error suppression for live production environment
error_reporting(0);
ini_set('display_errors', 0);

define('IS_LOCAL', (($_SERVER['HTTP_HOST'] ?? '') === 'localhost' || ($_SERVER['REMOTE_ADDR'] ?? '') === '127.0.0.1'));

define('DB_HOST', 'localhost');
define('DB_USER', IS_LOCAL ? 'root' : 'u891495087_lishan');
define('DB_PASS', IS_LOCAL ? '' : '8!NCzGuU');
define('DB_NAME', IS_LOCAL ? 'luxe_haven' : 'u891495087_lishan');

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