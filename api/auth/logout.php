<?php
session_start();
require_once '../config/db.php';
setCORSHeaders();

session_destroy();

// Also clear the admin_token cookie
setcookie('admin_token', '', [
    'expires'  => time() - 3600,
    'path'     => '/',
    'httponly' => false,
    'samesite' => 'Lax',
    'secure'   => false,
]);

jsonResponse(['status' => 'success', 'message' => 'Logged out successfully']);

