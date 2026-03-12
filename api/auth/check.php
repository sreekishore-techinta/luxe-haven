<?php
session_start();
require_once '../config/db.php';
setCORSHeaders();

if (isset($_SESSION['admin_id'])) {
    jsonResponse([
        'status' => 'success',
        'authenticated' => true,
        'admin' => [
            'id' => $_SESSION['admin_id'],
            'name' => $_SESSION['admin_name'],
            'email' => $_SESSION['admin_email'],
            'role' => $_SESSION['admin_role'],
        ]
    ]);
} else {
    jsonResponse(['status' => 'error', 'authenticated' => false, 'message' => 'Not authenticated'], 401);
}
