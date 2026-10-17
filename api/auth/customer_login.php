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

$email = trim($data['email'] ?? '');
$password = (string)($data['password'] ?? '');

if (empty($email) || empty($password)) {
    jsonResponse(['status' => 'error', 'message' => 'Email and password are required'], 400);
}

$conn = getDB();

// Determine available columns dynamically to prevent SQL failure if schema differs
$cols = [];
$colRes = $conn->query("SHOW COLUMNS FROM customers");
if ($colRes) {
    while ($col = $colRes->fetch_assoc()) {
        $cols[] = $col['Field'];
    }
}

$selectFields = ['id', 'name', 'email', 'phone'];
if (in_array('password_hash', $cols)) {
    $selectFields[] = 'password_hash';
}
if (in_array('password', $cols)) {
    $selectFields[] = 'password';
}
if (in_array('is_active', $cols)) {
    $selectFields[] = 'is_active';
}

$selectClause = implode(', ', $selectFields);
$stmt = $conn->prepare("SELECT $selectClause FROM customers WHERE email = ? LIMIT 1");

if (!$stmt) {
    jsonResponse(['status' => 'error', 'message' => 'Database prepare failed: ' . $conn->error], 500);
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$customer = $result ? $result->fetch_assoc() : null;
$stmt->close();

if (!$customer) {
    $conn->close();
    jsonResponse(['status' => 'error', 'message' => 'No account found with this email. Please click "Register" above to create your account.'], 401);
}

// Check password against password_hash or password column
$storedHash = $customer['password_hash'] ?? $customer['password'] ?? '';
$isValid = false;

if (!empty($storedHash)) {
    if (password_verify($password, $storedHash)) {
        $isValid = true;
    } elseif ($password === $storedHash) {
        // Plain text match - auto-upgrade to modern bcrypt hash
        $isValid = true;
        $newHash = password_hash($password, PASSWORD_BCRYPT);
        if (in_array('password_hash', $cols) && in_array('password', $cols)) {
            $up = $conn->prepare("UPDATE customers SET password_hash = ?, password = ? WHERE id = ?");
            if ($up) {
                $up->bind_param("ssi", $newHash, $newHash, $customer['id']);
                $up->execute();
                $up->close();
            }
        } elseif (in_array('password_hash', $cols)) {
            $up = $conn->prepare("UPDATE customers SET password_hash = ? WHERE id = ?");
            if ($up) {
                $up->bind_param("si", $newHash, $customer['id']);
                $up->execute();
                $up->close();
            }
        } elseif (in_array('password', $cols)) {
            $up = $conn->prepare("UPDATE customers SET password = ? WHERE id = ?");
            if ($up) {
                $up->bind_param("si", $newHash, $customer['id']);
                $up->execute();
                $up->close();
            }
        }
    }
}

$conn->close();

if (!$isValid) {
    jsonResponse(['status' => 'error', 'message' => 'Incorrect password. Please try again.'], 401);
}

if (isset($customer['is_active']) && !$customer['is_active']) {
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
        'phone' => $customer['phone'] ?? '',
    ]
]);
