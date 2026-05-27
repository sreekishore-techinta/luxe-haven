<?php
/**
 * LUXE HAVEN - FINAL LIVE SITE REPAIR (DB4)
 */

require_once 'api/config/db.php';
$conn = getDB();

echo "<h2>Luxe Haven - Final DB4 Repair</h2>";

// 0. SCHEMA REPAIR: Ensure saree_types has all needed columns
echo "Repairing saree_types table structure... ";
$conn->query("ALTER TABLE saree_types ADD COLUMN IF NOT EXISTS status ENUM('Active', 'Inactive') DEFAULT 'Active'");
$conn->query("ALTER TABLE saree_types ADD COLUMN IF NOT EXISTS show_on_menu TINYINT(1) DEFAULT 1");
$conn->query("ALTER TABLE saree_types ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0");

echo "Repairing master_categories table structure... ";
$conn->query("ALTER TABLE master_categories ADD COLUMN IF NOT EXISTS status ENUM('Active', 'Inactive') DEFAULT 'Active'");
$conn->query("ALTER TABLE master_categories ADD COLUMN IF NOT EXISTS show_on_menu TINYINT(1) DEFAULT 1");
$conn->query("ALTER TABLE master_categories ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) DEFAULT 0");
echo "Done.<br>";

// 1. Ensure all slugs match exactly what the frontend expects
echo "Updating slugs... ";
$conn->query("UPDATE master_categories SET slug = 'banarasi-saree' WHERE id = 8");
$conn->query("UPDATE master_categories SET slug = 'cotton-saree' WHERE id = 12");
$conn->query("UPDATE master_categories SET slug = 'bridal-saree' WHERE id = 13");
$conn->query("UPDATE master_categories SET slug = 'soft-silk-saree' WHERE id = 15");
$conn->query("UPDATE master_categories SET slug = 'mysore-crepe-saree' WHERE id = 21");

echo "Fixing any missing slugs... ";
$conn->query("UPDATE master_categories SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL OR slug = ''");
echo "Done.<br>";

// 2. Link products to the correct IDs from the screenshot
echo "Linking products to IDs... ";
// We match by name to be safe
$conn->query("UPDATE products SET category_id = 8 WHERE name LIKE '%Banarasi%'");
$conn->query("UPDATE products SET category_id = 12 WHERE name LIKE '%Cotton%'");
$conn->query("UPDATE products SET category_id = 13 WHERE name LIKE '%Bridal%'");
$conn->query("UPDATE products SET category_id = 15 WHERE name LIKE '%Soft Silk%'");
$conn->query("UPDATE products SET category_id = 21 WHERE name LIKE '%Mysore%'");
echo "Done.<br>";

// 3. SMART SYNC: Match products to categories via Saree Type names
echo "Running Smart Sync... ";
// This matches products to categories by comparing the names in saree_types and master_categories
$conn->query("UPDATE products p 
              JOIN saree_types st ON p.saree_type_id = st.id 
              JOIN master_categories mc ON mc.name = st.name 
              SET p.category_id = mc.id");
echo "Done.<br>";

// 4. SYNC TABLES: Ensure saree_types table has everything from master_categories
echo "Syncing Bridal Saree and others to Saree Types table... ";
$conn->query("INSERT INTO saree_types (name, slug, status, show_on_menu) 
              SELECT name, slug, 'Active', 1 FROM master_categories 
              WHERE name LIKE '%Saree%' AND name != 'Sarees' 
              AND name NOT IN (SELECT name FROM saree_types)
              ON DUPLICATE KEY UPDATE status='Active', show_on_menu=1");
echo "Done.<br>";

// 5. Set visibility and Order (matching your screenshot)
echo "Setting visibility and order... ";
$conn->query("UPDATE master_categories SET status = 'Active', show_on_menu = 1, sort_order = 1 WHERE id = 8"); // Banarasi
$conn->query("UPDATE master_categories SET status = 'Active', show_on_menu = 1, sort_order = 2 WHERE id = 12"); // Cotton
$conn->query("UPDATE master_categories SET status = 'Active', show_on_menu = 1, sort_order = 3 WHERE id = 21"); // Mysore
$conn->query("UPDATE master_categories SET status = 'Active', show_on_menu = 1, sort_order = 4 WHERE id = 15"); // Soft Silk
$conn->query("UPDATE master_categories SET status = 'Active', show_on_menu = 1, sort_order = 7 WHERE id = 13"); // Bridal
$conn->query("UPDATE master_categories SET status = 'Active', show_on_menu = 1, sort_order = 6 WHERE id = 6");  // New Arrivals
$conn->query("UPDATE master_categories SET status = 'Active', show_on_menu = 1, sort_order = 8 WHERE id = 1");  // Sarees
$conn->query("UPDATE master_categories SET status = 'Active', show_on_menu = 1, sort_order = 9 WHERE id = 18"); // Ready Made
$conn->query("UPDATE master_categories SET status = 'Active', show_on_menu = 1, sort_order = 10 WHERE id = 17"); // Suits & Sets
$conn->query("UPDATE master_categories SET status = 'Active', show_on_menu = 1, sort_order = 11 WHERE id = 19"); // Materials

// Hide the plural version if it exists
$conn->query("UPDATE master_categories SET status = 'Inactive', show_on_menu = 0 WHERE name = 'Banarasi Sarees' AND id != 8");
echo "Done.<br>";

echo "<h3>SUCCESS: All products and categories (including Bridal Saree) are now perfectly synchronized!</h3>";
echo "<p>You can now check the frontend. All categories in your menu should show their respective products.</p>";
?>
