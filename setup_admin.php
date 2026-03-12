<?php
require_once 'api/config/db.php';
$conn = getDB();

// Create default admin if none exists
$result = $conn->query("SELECT id FROM admins LIMIT 1");
if ($result->num_rows === 0) {
    $name = "Admin";
    $email = "admin@luxehaven.com";
    $pass = password_hash("admin123", PASSWORD_BCRYPT);
    $role = "Super Admin";

    $stmt = $conn->prepare("INSERT INTO admins (name, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)");
    $stmt->bind_param("ssss", $name, $email, $pass, $role);
    $stmt->execute();
    echo "Default admin created: admin@luxehaven.com / admin123\n";
} else {
    echo "Admin already exists.\n";
}

$conn->close();
