<?php
// Enable session for login
session_start();

// Improved CORS Handling
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit;
}

header("Content-Type: application/json");

require_once 'config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            echo json_encode([
                "status" => "error",
                "message" => "Email and password are required"
            ]);
            exit;
        }

        $conn = getDB();

        // Select all necessary fields to match dashboard requirements
        $stmt = $conn->prepare("SELECT id, name, email, password, role FROM admins WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $admin = $result->fetch_assoc();

            // Verify password
            if (password_verify($password, $admin['password']) || $password === $admin['password']) {

                // Set all session variables needed by both React and static protection logic
                $_SESSION['admin_id'] = $admin['id'];
                $_SESSION['admin_name'] = $admin['name'];
                $_SESSION['admin_email'] = $admin['email'];
                $_SESSION['admin_role'] = $admin['role'];

                // Track last login if column exists (optional, depends on schema)
                $conn->query("UPDATE admins SET last_login = NOW() WHERE id = " . intval($admin['id']));

                echo json_encode([
                    "status" => "success",
                    "message" => "Login successful",
                    "redirect" => "admin/dashboard.html",
                    "admin" => [
                        "id" => $admin['id'],
                        "name" => $admin['name'],
                        "email" => $admin['email'],
                        "role" => $admin['role']
                    ]
                ]);
            } else {
                echo json_encode([
                    "status" => "error",
                    "message" => "Invalid password"
                ]);
            }
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Account not found"
            ]);
        }
        $conn->close();
    } catch (Exception $e) {
        echo json_encode([
            "status" => "error",
            "message" => "Server error: " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Method not allowed"
    ]);
}
?>
