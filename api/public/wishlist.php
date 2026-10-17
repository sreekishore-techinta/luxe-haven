<?php
session_start();
require_once '../config/db.php';
setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];

// Gracefully handle not logged in
if (empty($_SESSION['customer_id'])) {
    if ($method === 'GET') {
        jsonResponse(['status' => 'success', 'data' => []]);
    } else {
        jsonResponse(['status' => 'error', 'message' => 'Please sign in to manage your wishlist', 'unauthorized' => true], 401);
    }
}

$customerId = (int)$_SESSION['customer_id'];
$conn = getDB();

// Determine columns in wishlist table dynamically
$cols = [];
$cRes = $conn->query("SHOW COLUMNS FROM wishlist");
if ($cRes) {
    while ($c = $cRes->fetch_assoc()) {
        $cols[] = $c['Field'];
    }
}

$hasCustId = in_array('customer_id', $cols);
$hasUserId = in_array('user_id', $cols);
$userCol = $hasCustId ? 'customer_id' : ($hasUserId ? 'user_id' : 'customer_id');

if ($method === 'GET') {
    // Fetch wishlist items for current customer
    $whereClause = ($hasCustId && $hasUserId)
        ? "(w.customer_id = ? OR w.user_id = ?)"
        : "w.$userCol = ?";

    $sql = "SELECT p.*, mc.name as category_name, pi.image_path as primary_image
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            LEFT JOIN master_categories mc ON mc.id = p.category_id
            LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
            WHERE $whereClause
            GROUP BY p.id
            ORDER BY w.created_at DESC";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        $conn->close();
        jsonResponse(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error], 500);
    }

    if ($hasCustId && $hasUserId) {
        $stmt->bind_param("ii", $customerId, $customerId);
    } else {
        $stmt->bind_param("i", $customerId);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $data = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $row['image'] = $row['primary_image'] ?? '';
            $row['category'] = $row['category_name'] ?? 'Sarees';
            $data[] = $row;
        }
    }
    $stmt->close();
    $conn->close();

    jsonResponse(['status' => 'success', 'data' => $data]);

} elseif ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    if (!is_array($input)) {
        $input = $_POST;
    }

    $productId = (int)($input['product_id'] ?? 0);
    if ($productId <= 0) {
        $conn->close();
        jsonResponse(['status' => 'error', 'message' => 'Valid product ID is required'], 400);
    }

    // Check if item is already in wishlist
    $whereCheck = ($hasCustId && $hasUserId)
        ? "(customer_id = ? OR user_id = ?) AND product_id = ?"
        : "$userCol = ? AND product_id = ?";

    $checkStmt = $conn->prepare("SELECT id FROM wishlist WHERE $whereCheck LIMIT 1");
    if (!$checkStmt) {
        $conn->close();
        jsonResponse(['status' => 'error', 'message' => 'Prepare failed: ' . $conn->error], 500);
    }

    if ($hasCustId && $hasUserId) {
        $checkStmt->bind_param("iii", $customerId, $customerId, $productId);
    } else {
        $checkStmt->bind_param("ii", $customerId, $productId);
    }

    $checkStmt->execute();
    $exists = $checkStmt->get_result()->fetch_assoc();
    $checkStmt->close();

    if ($exists) {
        // Remove from wishlist
        $delWhere = ($hasCustId && $hasUserId)
            ? "(customer_id = ? OR user_id = ?) AND product_id = ?"
            : "$userCol = ? AND product_id = ?";

        $delStmt = $conn->prepare("DELETE FROM wishlist WHERE $delWhere");
        if ($delStmt) {
            if ($hasCustId && $hasUserId) {
                $delStmt->bind_param("iii", $customerId, $customerId, $productId);
            } else {
                $delStmt->bind_param("ii", $customerId, $productId);
            }
            $delStmt->execute();
            $delStmt->close();
        }
        $conn->close();
        jsonResponse(['status' => 'success', 'message' => 'Removed from wishlist', 'action' => 'removed']);

    } else {
        // Add to wishlist
        $insertFields = [];
        $placeholders = [];
        $types = "";
        $values = [];

        if ($hasCustId) {
            $insertFields[] = "customer_id";
            $placeholders[] = "?";
            $types .= "i";
            $values[] = $customerId;
        }
        if ($hasUserId) {
            $insertFields[] = "user_id";
            $placeholders[] = "?";
            $types .= "i";
            $values[] = $customerId;
        }
        $insertFields[] = "product_id";
        $placeholders[] = "?";
        $types .= "i";
        $values[] = $productId;

        $insertSql = "INSERT INTO wishlist (" . implode(', ', $insertFields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $addStmt = $conn->prepare($insertSql);
        if (!$addStmt) {
            $err = $conn->error;
            $conn->close();
            jsonResponse(['status' => 'error', 'message' => 'Insert prepare failed: ' . $err], 500);
        }

        $addStmt->bind_param($types, ...$values);
        if ($addStmt->execute()) {
            $addStmt->close();
            $conn->close();
            jsonResponse(['status' => 'success', 'message' => 'Added to wishlist', 'action' => 'added']);
        } else {
            $err = $conn->error;
            $addStmt->close();
            $conn->close();
            jsonResponse(['status' => 'error', 'message' => 'Database error: ' . $err], 500);
        }
    }

} else {
    $conn->close();
    jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
