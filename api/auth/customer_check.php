<?php
session_start();
require_once '../config/db.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Check if customer is logged in
    if (!empty($_SESSION['customer_id'])) {
        jsonResponse([
            'status' => 'success',
            'loggedIn' => true,
            'customer' => [
                'id' => $_SESSION['customer_id'],
                'name' => $_SESSION['customer_name'],
                'email' => $_SESSION['customer_email'],
            ]
        ]);
    } else {
        jsonResponse(['status' => 'success', 'loggedIn' => false]);
    }
} elseif ($method === 'POST') {
    // Logout
    session_destroy();
    jsonResponse(['status' => 'success', 'message' => 'Logged out']);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
