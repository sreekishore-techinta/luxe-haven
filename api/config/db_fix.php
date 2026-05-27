<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

define('IS_LOCAL', (
    ($_SERVER['HTTP_HOST'] ?? '') === 'localhost' ||
    ($_SERVER['REMOTE_ADDR'] ?? '') === '127.0.0.1' ||
    ($_SERVER['REMOTE_ADDR'] ?? '') === '::1' ||
    strpos($_SERVER['HTTP_HOST'] ?? '', '192.168.') === 0 ||
    strpos($_SERVER['HTTP_HOST'] ?? '', '127.0.0.1') === 0
));

define('DB_HOST', IS_LOCAL ? 'localhost' : 'localhost');
define('DB_USER', IS_LOCAL ? 'root' : 'u891495087_lishan_db2');
define('DB_PASS', IS_LOCAL ? '' : 'vtaf!0xT');
define('DB_NAME', IS_LOCAL ? 'luxe_haven' : 'u891495087_lishan_db2');

function getDB(): mysqli
{
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]);
        exit();
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}

function setCORSHeaders(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

function jsonResponse(array $data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data);
    exit();
}

function sanitize(mysqli $conn, $value): string
{
    return $conn->real_escape_string(trim($value));
}
