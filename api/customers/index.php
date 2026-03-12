<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET: List / Search customers ───────────────────────────────────
    case 'GET':
        $where = ["1=1"];
        $params = [];
        $types = "";

        if (!empty($_GET['search'])) {
            $s = "%" . $conn->real_escape_string($_GET['search']) . "%";
            $where[] = "(c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)";
            $params = array_merge($params, [$s, $s, $s]);
            $types .= "sss";
        }

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $per_page = (int) ($_GET['per_page'] ?? 20);
        $offset = ($page - 1) * $per_page;
        $whereStr = implode(" AND ", $where);

        // Total
        $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM customers c WHERE $whereStr");
        if ($types && $params)
            $countStmt->bind_param($types, ...$params);
        $countStmt->execute();
        $total = $countStmt->get_result()->fetch_assoc()['total'];
        $countStmt->close();

        $sql = "SELECT c.*, 
                    COUNT(DISTINCT o.id) as order_count,
                    COALESCE(SUM(o.total), 0) as lifetime_value,
                    MAX(o.created_at) as last_order_date
                FROM customers c
                LEFT JOIN orders o ON o.customer_email = c.email
                WHERE $whereStr
                GROUP BY c.id
                ORDER BY c.created_at DESC
                LIMIT ? OFFSET ?";
        $allTypes = $types . "ii";
        $allParams = array_merge($params, [$per_page, $offset]);
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($allTypes, ...$allParams);
        $stmt->execute();
        $customers = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        $conn->close();

        jsonResponse([
            'status' => 'success',
            'data' => $customers,
            'total' => (int) $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => (int) ceil($total / $per_page),
        ]);
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
