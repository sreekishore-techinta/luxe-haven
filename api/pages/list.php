<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

$sql = "SELECT id, page_name, page_key, page_type FROM site_pages ORDER BY page_type ASC, page_name ASC";
$result = $conn->query($sql);

$pages = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $pages[] = $row;
    }
}

jsonResponse([
    "status" => "success",
    "data" => $pages
]);
