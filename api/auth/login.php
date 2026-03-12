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
$stmt = $conn->prepare("SELECT id, name, email, password, role, avatar FROM admins WHERE email = ? AND is_active = 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result->fetch_assoc();
$stmt->close();
$conn->close();

if (!$admin || !password_verify($password, $admin['password'])) {
    jsonResponse(['status' => 'error', 'message' => 'Invalid email or password'], 401);
}

// Update last login
$conn2 = getDB();
$conn2->query("UPDATE admins SET last_login = NOW() WHERE id = " . intval($admin['id']));
$conn2->close();

$_SESSION['admin_id'] = $admin['id'];
$_SESSION['admin_name'] = $admin['name'];
$_SESSION['admin_email'] = $admin['email'];
$_SESSION['admin_role'] = $admin['role'];

jsonResponse([
    'status' => 'success',
    'message' => 'Login successful',
    'admin' => [
        'id' => $admin['id'],
        'name' => $admin['name'],
        'email' => $admin['email'],
        'role' => $admin['role'],
        'avatar' => $admin['avatar'],
    ]
]);
