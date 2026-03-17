<?php
require_once '../config/db.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDB();

// Authentication check
session_start();
if (!isset($_SESSION['customer_id'])) {
    jsonResponse(['status' => 'error', 'message' => 'Login required'], 401);
}
$customerId = $_SESSION['customer_id'];

switch ($method) {
    case 'GET':
        $stmt = $conn->prepare("SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC");
        $stmt->bind_param("i", $customerId);
        $stmt->execute();
        $res = $stmt->get_result();
        $addresses = $res->fetch_all(MYSQLI_ASSOC);
        jsonResponse(['status' => 'success', 'data' => $addresses]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['full_name']) || empty($data['phone']) || empty($data['address_line1']) || empty($data['city']) || empty($data['state']) || empty($data['pincode'])) {
            jsonResponse(['status' => 'error', 'message' => 'Missing required fields'], 400);
        }

        $fullName = $data['full_name'];
        $phone = $data['phone'];
        $line1 = $data['address_line1'];
        $line2 = $data['address_line2'] ?? '';
        $city = $data['city'];
        $state = $data['state'];
        $pincode = $data['pincode'];
        $isDefault = !empty($data['is_default']) ? 1 : 0;

        if ($isDefault) {
            $conn->query("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = $customerId");
        }

        $stmt = $conn->prepare("INSERT INTO customer_addresses (customer_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssssssi", $customerId, $fullName, $phone, $line1, $line2, $city, $state, $pincode, $isDefault);

        if ($stmt->execute()) {
            jsonResponse(['status' => 'success', 'message' => 'Address added', 'id' => $stmt->insert_id]);
        } else {
            jsonResponse(['status' => 'error', 'message' => 'Failed to add address'], 500);
        }
        break;

    case 'DELETE':
        $addrId = (int) ($_GET['id'] ?? 0);
        if ($addrId <= 0)
            jsonResponse(['status' => 'error', 'message' => 'Invalid ID'], 400);

        $stmt = $conn->prepare("DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?");
        $stmt->bind_param("ii", $addrId, $customerId);
        if ($stmt->execute()) {
            jsonResponse(['status' => 'success', 'message' => 'Address deleted']);
        } else {
            jsonResponse(['status' => 'error', 'message' => 'Failed to delete'], 500);
        }
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}

$conn->close();
