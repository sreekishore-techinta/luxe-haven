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
        $sql = "SELECT * FROM saree_types ORDER BY id DESC";
        $result = $conn->query($sql);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            if (!empty($row['image']) && strpos($row['image'], 'http') !== 0) {
                $row['image'] = $baseUrl . ltrim($row['image'], '/');
            }
            if (!empty($row['hero_image']) && strpos($row['hero_image'], 'http') !== 0) {
                $row['hero_image'] = $baseUrl . ltrim($row['hero_image'], '/');
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
        $slug = sanitize($conn, $input['slug'] ?? '');
        $image = sanitize($conn, $input['image'] ?? '');
        $hero_image = sanitize($conn, $input['hero_image'] ?? '');
        $description = sanitize($conn, $input['description'] ?? '');

        if (empty($name) || empty($slug)) {
            jsonResponse(['status' => 'error', 'message' => 'Name and slug are required'], 400);
        }

        $stmt = $conn->prepare("INSERT INTO saree_types (name, slug, image, hero_image, description) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $name, $slug, $image, $hero_image, $description);

        if ($stmt->execute()) {
            jsonResponse(['status' => 'success', 'message' => 'Saree type created', 'id' => $conn->insert_id]);
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
        if (isset($input['slug'])) {
            $updates[] = "slug = ?";
            $params[] = sanitize($conn, $input['slug']);
            $types .= "s";
        }
        if (isset($input['image'])) {
            $updates[] = "image = ?";
            $params[] = sanitize($conn, $input['image']);
            $types .= "s";
        }
        if (isset($input['hero_image'])) {
            $updates[] = "hero_image = ?";
            $params[] = sanitize($conn, $input['hero_image']);
            $types .= "s";
        }
        if (isset($input['description'])) {
            $updates[] = "description = ?";
            $params[] = sanitize($conn, $input['description']);
            $types .= "s";
        }

        if (empty($updates))
            jsonResponse(['status' => 'error', 'message' => 'No fields to update'], 400);

        $sql = "UPDATE saree_types SET " . implode(', ', $updates) . " WHERE id = ?";
        $params[] = $id;
        $types .= "i";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            jsonResponse(['status' => 'success', 'message' => 'Saree type updated']);
        } else {
            jsonResponse(['status' => 'error', 'message' => $conn->error], 500);
        }
        break;

    case 'DELETE':
        $id = intval($_GET['id'] ?? 0);
        if ($id <= 0)
            jsonResponse(['status' => 'error', 'message' => 'Invalid ID'], 400);

        $stmt = $conn->prepare("DELETE FROM saree_types WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            jsonResponse(['status' => 'success', 'message' => 'Saree type deleted']);
        } else {
            jsonResponse(['status' => 'error', 'message' => $conn->error], 500);
        }
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        break;
}

$conn->close();
