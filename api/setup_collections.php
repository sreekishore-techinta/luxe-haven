<?php
require_once 'config/db.php';
$conn = getDB();

// 1. Add 'collections' to site_pages so it shows up in Admin Web Sliders
$conn->query("INSERT IGNORE INTO site_pages (page_name, page_key, page_type) VALUES ('Collections', 'collections', 'main')");

// 2. Ensure products table has correct columns (we don't want to break it, just check)
// Assuming products exist.

echo "Setup complete. 'Collections' added to Page Targets.";
?>
