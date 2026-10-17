<?php
session_start();
require_once '../config/db.php';
setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);
if (!is_array($data)) {
    $data = $_POST;
}

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$password = (string)($data['password'] ?? '');

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
$check = $conn->prepare("SELECT id FROM customers WHERE email = ? LIMIT 1");
if (!$check) {
    jsonResponse(['status' => 'error', 'message' => 'Database prepare failed: ' . $conn->error], 500);
}
$check->bind_param("s", $email);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    $check->close();
    $conn->close();
    jsonResponse(['status' => 'error', 'message' => 'An account with this email already exists'], 409);
}
$check->close();

$hashed = password_hash($password, PASSWORD_BCRYPT);

// Inspect available columns dynamically
$cols = [];
$colRes = $conn->query("SHOW COLUMNS FROM customers");
if ($colRes) {
    while ($col = $colRes->fetch_assoc()) {
        $cols[] = $col['Field'];
    }
}

$fields = ['name', 'email', 'phone'];
$placeholders = ['?', '?', '?'];
$types = 'sss';
$values = [$name, $email, $phone];

if (in_array('password_hash', $cols)) {
    $fields[] = 'password_hash';
    $placeholders[] = '?';
    $types .= 's';
    $values[] = $hashed;
}
if (in_array('password', $cols)) {
    $fields[] = 'password';
    $placeholders[] = '?';
    $types .= 's';
    $values[] = $hashed;
}
if (in_array('is_active', $cols)) {
    $fields[] = 'is_active';
    $placeholders[] = '1';
}

$sql = "INSERT INTO customers (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    $conn->close();
    jsonResponse(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error], 500);
}

$stmt->bind_param($types, ...$values);

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
    $err = $conn->error;
    $stmt->close();
    $conn->close();
    jsonResponse(['status' => 'error', 'message' => 'Registration failed: ' . $err], 500);
}
