<?php
require_once '../../config/db.php';
setCORSHeaders();

session_start();
if (!isset($_SESSION['admin_id'])) {
    jsonResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
}

$conn = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
            . '://' . $_SERVER['HTTP_HOST'] . '/';
        $sql = "SELECT * FROM blouse_styles ORDER BY id DESC";
        $result = $conn->query($sql);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            if (!empty($row['image']) && strpos($row['image'], 'http') !== 0) {
                $row['image'] = $baseUrl . ltrim($row['image'], '/');
            }
            $data[] = $row;
        }
        jsonResponse(['status' => 'success', 'data' => $data]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input)
            jsonResponse(['status' => 'error', 'message' => 'Invalid JSON'], 400);

        $name = sanitize($conn, $input['name'] ?? '');
        $description = sanitize($conn, $input['description'] ?? '');
        $price = (float) ($input['price'] ?? 0);
        $category = sanitize($conn, $input['category'] ?? 'Designer');
        $image = sanitize($conn, $input['image'] ?? '');

        if (empty($name)) {
            jsonResponse(['status' => 'error', 'message' => 'Name is required'], 400);
        }

        $stmt = $conn->prepare("INSERT INTO blouse_styles (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ss dss", $name, $description, $price, $category, $image);

        if ($stmt->execute()) {
            jsonResponse(['status' => 'success', 'message' => 'Blouse style created', 'id' => $conn->insert_id]);
        } else {
            jsonResponse(['status' => 'error', 'message' => $conn->error], 500);
        }
        break;

    case 'PUT':
        $id = intval($_GET['id'] ?? 0);
        if ($id <= 0)
            jsonResponse(['status' => 'error', 'message' => 'Invalid ID'], 400);

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input)
            jsonResponse(['status' => 'error', 'message' => 'Invalid JSON'], 400);

        $updates = [];
        $types = "";
        $params = [];

        if (isset($input['name'])) {
            $updates[] = "name = ?";
            $params[] = sanitize($conn, $input['name']);
            $types .= "s";
        }
        if (isset($input['description'])) {
            $updates[] = "description = ?";
            $params[] = sanitize($conn, $input['description']);
            $types .= "s";
        }
        if (isset($input['price'])) {
            $updates[] = "price = ?";
            $params[] = (float) $input['price'];
            $types .= "d";
        }
        if (isset($input['category'])) {
            $updates[] = "category = ?";
            $params[] = sanitize($conn, $input['category']);
            $types .= "s";
        }
        if (isset($input['image'])) {
            $updates[] = "image = ?";
            $params[] = sanitize($conn, $input['image']);
            $types .= "s";
        }

        if (empty($updates))
            jsonResponse(['status' => 'error', 'message' => 'No fields to update'], 400);

        $sql = "UPDATE blouse_styles SET " . implode(', ', $updates) . " WHERE id = ?";
        $params[] = $id;
        $types .= "i";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            jsonResponse(['status' => 'success', 'message' => 'Blouse style updated']);
        } else {
            jsonResponse(['status' => 'error', 'message' => $conn->error], 500);
        }
        break;

    case 'DELETE':
        $id = intval($_GET['id'] ?? 0);
        if ($id <= 0)
            jsonResponse(['status' => 'error', 'message' => 'Invalid ID'], 400);

        $stmt = $conn->prepare("DELETE FROM blouse_styles WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            jsonResponse(['status' => 'success', 'message' => 'Blouse style deleted']);
        } else {
            jsonResponse(['status' => 'error', 'message' => $conn->error], 500);
        }
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        break;
}

$conn->close();
