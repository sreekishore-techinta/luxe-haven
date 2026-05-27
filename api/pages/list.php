<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

$sql = "SELECT id, page_name, page_key, page_type FROM site_pages ORDER BY page_type ASC, page_name ASC";
$result = $conn->query($sql);

$pages = [];
$existingKeys = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $pages[] = $row;
        $existingKeys[] = $row['page_key'];
    }
}

// Fetch all dynamic categories
$dynCategories = $conn->query("SELECT name, slug FROM master_categories WHERE status='Active'");
if ($dynCategories && $dynCategories->num_rows > 0) {
    while($cat = $dynCategories->fetch_assoc()) {
        if (!in_array($cat['slug'], $existingKeys)) {
            $pages[] = [
                'id' => 1000 + count($pages),
                'page_name' => $cat['name'],
                'page_key' => $cat['slug'],
                'page_type' => 'Category'
            ];
            $existingKeys[] = $cat['slug'];
        }
    }
}

// Static additions incase DB is missing essentials
$statics = [
    ['name' => 'Suits & Sets', 'key' => 'suit-sets', 'type' => 'Category'],
    ['name' => 'Sarees Main', 'key' => 'sarees', 'type' => 'Category'],
    ['name' => 'All Collections', 'key' => 'collections', 'type' => 'Category'],
    ['name' => 'Sale Banner', 'key' => 'sale_banner', 'type' => 'Home']
];

foreach ($statics as $st) {
    if (!in_array($st['key'], $existingKeys)) {
        $pages[] = [
            'id' => 2000 + count($pages),
            'page_name' => $st['name'],
            'page_key' => $st['key'],
            'page_type' => $st['type']
        ];
        $existingKeys[] = $st['key'];
    }
}

jsonResponse([
    "status" => "success",
    "data" => $pages
]);
