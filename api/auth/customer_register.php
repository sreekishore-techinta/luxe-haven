<?php
session_start();
require_once '../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$password = $data['password'] ?? '';

if (empty($name) || empty($email) || empty($password)) {
    jsonResponse(['status' => 'error', 'message' => 'Name, email, and password are required'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['status' => 'error', 'message' => 'Invalid email format'], 400);
}

if (strlen($password) < 6) {
    jsonResponse(['status' => 'error', 'message' => 'Password must be at least 6 characters'], 400);
}

if ($phone && !preg_match('/^[6-9]\d{9}$/', $phone)) {
    jsonResponse(['status' => 'error', 'message' => 'Invalid phone number (10 digits, starts with 6-9)'], 400);
}

$conn = getDB();

// Check duplicate email
$check = $conn->prepare("SELECT id FROM customers WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    jsonResponse(['status' => 'error', 'message' => 'An account with this email already exists'], 409);
}
$check->close();

$hashed = password_hash($password, PASSWORD_BCRYPT);

$stmt = $conn->prepare(
    "INSERT INTO customers (name, email, phone, password_hash, is_active) VALUES (?, ?, ?, ?, 1)"
);
$stmt->bind_param("ssss", $name, $email, $phone, $hashed);

if ($stmt->execute()) {
    $customerId = $stmt->insert_id;
    $stmt->close();

    $_SESSION['customer_id'] = $customerId;
    $_SESSION['customer_name'] = $name;
    $_SESSION['customer_email'] = $email;

    $conn->close();
    jsonResponse([
        'status' => 'success',
        'message' => 'Account created successfully',
        'customer' => ['id' => $customerId, 'name' => $name, 'email' => $email, 'phone' => $phone]
    ], 201);
} else {
    jsonResponse(['status' => 'error', 'message' => 'Registration failed: ' . $conn->error], 500);
}
