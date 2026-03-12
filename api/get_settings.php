<?php
require_once '../config/db.php';

setCORSHeaders();

// Check authentication
session_start();
if (!isset($_SESSION['admin_id'])) {
    jsonResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT setting_key, setting_value FROM settings");
    $settings = [];
    while ($row = $result->fetch_assoc()) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    // Structure for the frontend expectation
    $resp = [
        "store_name" => $settings['store_name'] ?? "Luxe Haven",
        "email" => $settings['support_email'] ?? "",
        "public_notice" => $settings['public_notice'] ?? "",
        "tax_rate" => (float) ($settings['tax_rate'] ?? 0),
        "maintenance_mode" => ($settings['maintenance_mode'] ?? "0") === "1",
        "notifications" => [
            "low_stock" => true,
            "new_order" => true
        ]
    ];
    jsonResponse(['status' => 'success', 'data' => $resp]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    $mapping = [
        'store_name' => 'store_name',
        'email' => 'support_email',
        'public_notice' => 'public_notice',
        'tax_rate' => 'tax_rate',
        'maintenance_mode' => 'maintenance_mode'
    ];

    $stmt = $conn->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");

    foreach ($mapping as $fe_key => $db_key) {
        if (isset($data[$fe_key])) {
            $val = is_bool($data[$fe_key]) ? ($data[$fe_key] ? "1" : "0") : (string) $data[$fe_key];
            $stmt->bind_param("sss", $db_key, $val, $val);
            $stmt->execute();
        }
    }

    jsonResponse(['status' => 'success', 'message' => 'Settings saved successfully']);
}
?>