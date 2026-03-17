<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('store_name', 'public_notice')");
    $settings = [];
    while ($row = $result->fetch_assoc()) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    $resp = [
        "store_name" => $settings['store_name'] ?? "Luxe Haven",
        "public_notice" => $settings['public_notice'] ?? ""
    ];
    jsonResponse(['status' => 'success', 'data' => $resp]);
}
?>
