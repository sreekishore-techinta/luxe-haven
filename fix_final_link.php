<?php
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'api/config/db.php';
$conn = getDB();

echo "Correcting Product Links...\n";

// Move all products to ID 8 (the singular 'Banarasi Saree' which matches the screenshot URL)
$conn->query("UPDATE products SET category_id = 8 WHERE category_id = 22 OR name LIKE '%Banarasi%'");
echo "Updated Banarasi products to ID 8.\n";

// Ensure Saree Type is also set to 18
$conn->query("UPDATE products SET saree_type_id = 18 WHERE category_id = 8");
echo "Linked to Saree Type 18.\n";

// Make sure ID 8 is ACTIVE and visible
$conn->query("UPDATE master_categories SET status = 'Active', show_on_menu = 1 WHERE id = 8");
echo "Ensured Category 8 is Active.\n";

echo "Repair complete. Please check the 'Banarasi Saree' page now.\n";
?>
