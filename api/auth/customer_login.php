<?php
session_start();
require_once '../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    jsonResponse(['status' => 'error', 'message' => 'Email and password are required'], 400);
}

$conn = getDB();
$stmt = $conn->prepare(
    "SELECT id, name, email, phone, password_hash, is_active FROM customers WHERE email = ?"
);
$stmt->bind_param("s", $email);
$stmt->execute();
$customer = $stmt->get_result()->fetch_assoc();
$stmt->close();
$conn->close();

if (!$customer || !password_verify($password, $customer['password_hash'])) {
    jsonResponse(['status' => 'error', 'message' => 'Invalid email or password'], 401);
}

if (!$customer['is_active']) {
    jsonResponse(['status' => 'error', 'message' => 'Your account has been deactivated'], 403);
}

$_SESSION['customer_id'] = $customer['id'];
$_SESSION['customer_name'] = $customer['name'];
$_SESSION['customer_email'] = $customer['email'];

jsonResponse([
    'status' => 'success',
    'message' => 'Login successful',
    'customer' => [
        'id' => $customer['id'],
        'name' => $customer['name'],
        'email' => $customer['email'],
        'phone' => $customer['phone'],
    ]
]);
