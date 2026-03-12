<?php
require_once '../config/db.php';
setCORSHeaders();

// Extract product ID from URL or query param
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    jsonResponse(['status' => 'error', 'message' => 'Valid product ID required'], 400);
}

$conn = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET single product with all images ─────────────────────────────
    case 'GET':
        $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $product = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$product) {
            jsonResponse(['status' => 'error', 'message' => 'Product not found'], 404);
        }

        // Get all images
        $imgStmt = $conn->prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC");
        $imgStmt->bind_param("i", $id);
        $imgStmt->execute();
        $images = $imgStmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $imgStmt->close();
        $conn->close();

        $product['images'] = $images;
        jsonResponse(['status' => 'success', 'data' => $product]);
        break;

    // ─── PUT: Update product ─────────────────────────────────────────────
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);

        $fields = [];
        $params = [];
        $types = "";

        $allowed = [
            'name',
            'category',
            'description',
            'fabric',
            'is_new',
            'is_bestseller',
            'sub_category_id',
            'colour_id',
            'fabric_id',
            'size_id',
            'sleeve_type_id',
            'neck_type_id',
            'occasion_id',
            'pattern_id'
        ];
        $intFields = [
            'is_new',
            'is_bestseller',
            'sub_category_id',
            'colour_id',
            'fabric_id',
            'size_id',
            'sleeve_type_id',
            'neck_type_id',
            'occasion_id',
            'pattern_id'
        ];

        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "$f = ?";
                $val = $data[$f];
                if (in_array($f, $intFields)) {
                    $params[] = ($val === "" || $val === null) ? null : (int) $val;
                    $types .= "i";
                } else {
                    $params[] = $val;
                    $types .= "s";
                }
            }
        }
        if (array_key_exists('price', $data)) {
            $fields[] = "price = ?";
            $params[] = (float) $data['price'];
            $types .= "d";
        }
        if (array_key_exists('discount_price', $data)) {
            $fields[] = "discount_price = ?";
            $params[] = !empty($data['discount_price']) ? (float) $data['discount_price'] : null;
            $types .= "d";
        }
        if (array_key_exists('stock_qty', $data)) {
            $qty = (int) $data['stock_qty'];
            $status = $qty === 0 ? 'Out of Stock' : ($qty < 10 ? 'Low Stock' : 'In Stock');
            $fields[] = "stock_qty = ?";
            $fields[] = "status = ?";
            $params[] = $qty;
            $params[] = $status;
            $types .= "is";
        }
        if (array_key_exists('status', $data)) {
            $fields[] = "status = ?";
            $params[] = $data['status'];
            $types .= "s";
        }

        if (empty($fields)) {
            jsonResponse(['status' => 'error', 'message' => 'No updatable fields provided'], 400);
        }

        $params[] = $id;
        $types .= "i";

        $sql = "UPDATE products SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            $stmt->close();
            $conn->close();
            jsonResponse(['status' => 'success', 'message' => 'Product updated successfully']);
        } else {
            jsonResponse(['status' => 'error', 'message' => 'Update failed: ' . $stmt->error], 500);
        }
        break;

    // ─── DELETE product ──────────────────────────────────────────────────
    case 'DELETE':
        // Delete images from disk first
        $imgStmt = $conn->prepare("SELECT image_path FROM product_images WHERE product_id = ?");
        $imgStmt->bind_param("i", $id);
        $imgStmt->execute();
        $imgResult = $imgStmt->get_result();
        while ($img = $imgResult->fetch_assoc()) {
            $fullPath = dirname(__DIR__, 2) . '/' . $img['image_path'];
            if (file_exists($fullPath))
                @unlink($fullPath);
        }
        $imgStmt->close();

        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute() && $stmt->affected_rows > 0) {
            $stmt->close();
            $conn->close();
            jsonResponse(['status' => 'success', 'message' => 'Product deleted successfully']);
        } else {
            jsonResponse(['status' => 'error', 'message' => 'Product not found or already deleted'], 404);
        }
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
