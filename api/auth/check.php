<?php
session_start();
require_once '../config/db.php';
setCORSHeaders();

// Check both session and admin_token cookie
$adminId = null;
if (!empty($_SESSION['admin_id'])) {
    $adminId = (int)$_SESSION['admin_id'];
} else {
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
                    $adminId = (int) $data['admin_id'];
                }
            }
        }
    }
}

if ($adminId) {
    // Fetch fresh admin data
    $conn = getDB();
    $stmt = $conn->prepare("SELECT id, name, email, role, avatar FROM admins WHERE id = ? AND is_active = 1");
    $stmt->bind_param("i", $adminId);
    $stmt->execute();
    $admin = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $conn->close();

    if ($admin) {
        jsonResponse([
            'status' => 'success',
            'authenticated' => true,
            'admin' => $admin
        ]);
    }
}

jsonResponse(['status' => 'error', 'authenticated' => false, 'message' => 'Not authenticated'], 401);

