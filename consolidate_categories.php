<?php
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'api/config/db.php';
$conn = getDB();

echo "Starting Category Consolidation...\n";

// List of categories to merge (Target ID => Source ID or similar name)
// Based on your DB, we want to move products from older IDs to the ones you're likely using now, 
// OR consolidate everything to the cleanest name.

$consolidations = [
    'banarasi-saree' => 'banarasi-sarees',
    'cotton-saree' => 'cotton-sarees',
    'soft-silk-saree' => 'soft-silk-sarees',
    'bridal-saree' => 'bridal-sarees'
];

foreach ($consolidations as $slug1 => $slug2) {
    // Get IDs for both
    $res1 = $conn->query("SELECT id, name FROM master_categories WHERE slug = '$slug1'");
    $res2 = $conn->query("SELECT id, name FROM master_categories WHERE slug = '$slug2'");
    
    $cat1 = $res1->fetch_assoc();
    $cat2 = $res2->fetch_assoc();
    
    if ($cat1 && $cat2) {
        $id1 = $cat1['id'];
        $id2 = $cat2['id'];
        
        echo "Merging '{$cat1['name']}' (ID $id1) and '{$cat2['name']}' (ID $id2)...\n";
        
        // Move products from ID 1 to ID 2 (assuming ID 2 is the newer/plural one often used in nav)
        $conn->query("UPDATE products SET category_id = $id2 WHERE category_id = $id1");
        
        // Also check saree_type_id
        $conn->query("UPDATE products SET saree_type_id = $id2 WHERE saree_type_id = $id1");
        
        // Disable the old one so it doesn't show in nav
        $conn->query("UPDATE master_categories SET status = 'Inactive', show_on_menu = 0 WHERE id = $id1");
        
        echo "Done.\n";
    }
}

echo "Consolidation complete. Products have been moved to the active categories.\n";
?>
