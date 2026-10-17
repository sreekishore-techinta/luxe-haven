<?php
error_reporting(E_ALL);
ini_set('display_errors', 0); // Prevent HTML error traces from corrupting JSON output

// Fix session cookie for cross-port Vite proxy (dev environment)
if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
    @ini_set('session.cookie_samesite', 'Lax');
    @ini_set('session.cookie_httponly', '1');
}

$httpHost = $_SERVER['HTTP_HOST'] ?? '';
$remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';
$serverName = $_SERVER['SERVER_NAME'] ?? '';

$isLocal = (
    php_sapi_name() === 'cli' ||
    stripos($httpHost, 'localhost') !== false ||
    stripos($httpHost, '127.0.0.1') !== false ||
    stripos($serverName, 'localhost') !== false ||
    stripos($serverName, '127.0.0.1') !== false ||
    $remoteAddr === '127.0.0.1' ||
    $remoteAddr === '::1' ||
    strpos($httpHost, '192.168.') === 0 ||
    strpos($remoteAddr, '192.168.') === 0 ||
    file_exists('C:\\xampp') ||
    file_exists('C:/xampp')
);
define('IS_LOCAL', $isLocal);

define('DB_HOST', IS_LOCAL ? 'localhost' : 'localhost');
define('DB_USER', IS_LOCAL ? 'root' : 'u891495087_lishan_db4');
define('DB_PASS', IS_LOCAL ? '' : 'Techinta@2026');
define('DB_NAME', IS_LOCAL ? 'luxe_haven' : 'u891495087_lishan_db4');

// Disable mysqli exceptions to return clean JSON errors via handle checks
mysqli_report(MYSQLI_REPORT_OFF);

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
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
    } else {
        header("Access-Control-Allow-Origin: *");
    }

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

/**
 * Checks admin authentication via:
 * 1. PHP session ($_SESSION['admin_id'])
 * 2. admin_token cookie (set at login for cross-port proxy support)
 * Returns admin_id on success, or sends 401 and exits.
 */
function requireAdminAuth(): int
{
    // Method 1: PHP session (works when same origin)
    if (!empty($_SESSION['admin_id'])) {
        return (int) $_SESSION['admin_id'];
    }

    // Method 2: admin_token cookie (works through Vite proxy)
    $token = $_COOKIE['admin_token'] ?? '';
    if ($token) {
        $parts = explode('.', $token, 2);
        if (count($parts) === 2) {
            $payload = $parts[0];
            $sig     = $parts[1];
            $secret  = 'luxe_haven_admin_secret_2024';
            if (hash_hmac('sha256', $payload, $secret) === $sig) {
                $data = json_decode(base64_decode($payload), true);
                if ($data && isset($data['admin_id']) && isset($data['exp']) && $data['exp'] > time()) {
                    return (int) $data['admin_id'];
                }
            }
        }
    }

    // Not authenticated
    jsonResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
    exit(); // unreachable but satisfies type checker
}

/**
 * Creates a signed admin_token cookie value for the given admin.
 */
function createAdminToken(int $adminId, string $role): string
{
    $secret  = 'luxe_haven_admin_secret_2024';
    $payload = base64_encode(json_encode([
        'admin_id' => $adminId,
        'role'     => $role,
        'exp'      => time() + (86400 * 7), // 7 days
    ]));
    $sig = hash_hmac('sha256', $payload, $secret);
    return $payload . '.' . $sig;
}

function getBaseUrl(): string
{
    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http');
    $host = $_SERVER['HTTP_HOST'] ?? '';
    // If local, project is in /luxe-haven/, else root /
    $root = IS_LOCAL ? '/luxe-haven/' : '/';
    return "{$protocol}://{$host}{$root}";
}

