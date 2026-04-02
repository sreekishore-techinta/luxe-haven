<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

$page = isset($_GET['page']) ? sanitize($conn, $_GET['page']) : null;

// Find sliders for this page_key using the mapping table
$sql = "SELECT s.* FROM web_sliders s 
        JOIN web_slider_pages wsp ON s.id = wsp.slider_id 
        WHERE s.is_active = 1 ";

if ($page) {
    if ($page === 'Home') $page = 'home'; // Handle common case
    $sql .= " AND wsp.page_key = '$page' ";
}

$sql .= " ORDER BY s.order_index ASC";

$result = $conn->query($sql);

$sliders = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $sliders[] = $row;
    }
}

jsonResponse([
    "status" => "success",
    "data" => $sliders
]);
