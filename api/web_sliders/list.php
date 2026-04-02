<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

$sql = "SELECT * FROM web_sliders ORDER BY order_index ASC, id DESC";
$result = $conn->query($sql);

$sliders = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $slider_id = (int)$row['id'];
        
        // Fetch pages assigned to this slider
        $pst = $conn->query("SELECT page_key FROM web_slider_pages WHERE slider_id = $slider_id");
        $pages = [];
        while($p = $pst->fetch_assoc()) {
            $pages[] = $p['page_key'];
        }
        $row['pages'] = $pages;
        $sliders[] = $row;
    }
}

jsonResponse([
    "status" => "success",
    "data" => $sliders
]);
