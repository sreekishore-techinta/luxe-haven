<?php
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'api/config/db.php';
$conn = getDB();

echo "Repairing Slugs...\n";

function slugify($text) {
    return strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $text), '-'));
}

// Fix master_categories
$res = $conn->query("SELECT id, name, slug FROM master_categories");
while ($row = $res->fetch_assoc()) {
    if (empty($row['slug'])) {
        $newSlug = slugify($row['name']);
        $conn->query("UPDATE master_categories SET slug = '$newSlug' WHERE id = " . $row['id']);
        echo "Updated category: " . $row['name'] . " -> $newSlug\n";
    }
}

// Fix saree_types
$res = $conn->query("SELECT id, name, slug FROM saree_types");
while ($row = $res->fetch_assoc()) {
    if (empty($row['slug'])) {
        $newSlug = slugify($row['name']);
        $conn->query("UPDATE saree_types SET slug = '$newSlug' WHERE id = " . $row['id']);
        echo "Updated saree type: " . $row['name'] . " -> $newSlug\n";
    }
}

echo "Slug repair complete.\n";
?>
