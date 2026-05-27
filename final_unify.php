<?php
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'api/config/db.php';
$conn = getDB();

echo "Final Unification Started...\n";

// 1. Move all products from 'Banarasi Saree' (8) to 'banarasi sarees' (22)
// Since 22 is the one likely in the nav menu right now.
$conn->query("UPDATE products SET category_id = 22 WHERE category_id = 8");
echo "Moved products from Cat 8 to Cat 22.\n";

// 2. Ensure saree_type_id is also set to 18 (the current Banarasi Saree type)
$conn->query("UPDATE products SET saree_type_id = 18 WHERE category_id = 22");
echo "Linked products to Saree Type 18.\n";

// 3. Repeat for other possible duplicates
// Cotton: 12 (Master) vs 6 (Type)
$conn->query("UPDATE products SET saree_type_id = 6 WHERE category_id = 12");
// Soft Silk: 15 (Master) vs 9 (Type)
$conn->query("UPDATE products SET saree_type_id = 9 WHERE category_id = 15");
// Mysore Crepe: 21 (Master) vs 11 (Type)
$conn->query("UPDATE products SET saree_type_id = 11 WHERE category_id = 21");
// Bridal: 13 (Master) vs 7 (Type)
$conn->query("UPDATE products SET saree_type_id = 7 WHERE category_id = 13");

echo "All product IDs have been unified across Master Categories and Saree Types.\n";
echo "Unification Complete.\n";
?>
