<?php
// SECURITY: Delete this file from server immediately after running!
// Upload to: https://lishansarees.com/live_fix.php and visit it once.

$host = 'localhost';
$user = 'u891495087_lishan_user';
$pass = 'LishanDb@786#2024';
$db   = 'u891495087_lishan_db2';

$c = new mysqli($host, $user, $pass, $db);
if ($c->connect_error) {
    die("Connection failed: " . $c->connect_error);
}

echo "<pre>";

// 1. Add Banarasi Saree to saree_types if missing
$check = $c->query("SELECT id FROM saree_types WHERE name='Banarasi Saree'");
if ($check->num_rows == 0) {
    $c->query("INSERT INTO saree_types (name, slug, show_on_menu, is_featured, description, image, hero_image)
               VALUES ('Banarasi Saree','banarasi-saree',1,0,
               'Timeless luxury woven in tradition. Our Banarasi collection features intricate silver and gold work from the heart of Varanasi.',
               'assets/hero-banners/banarasi-hero.png','assets/hero-banners/banarasi-hero.png')");
    echo "✓ Inserted Banarasi Saree into saree_types (ID: " . $c->insert_id . ")\n";
} else {
    $r = $check->fetch_assoc();
    echo "✓ Banarasi Saree already in saree_types (ID: {$r['id']})\n";
}

// 2. Add Banarasi Saree to master_categories if missing
$check2 = $c->query("SELECT id FROM master_categories WHERE name='Banarasi Saree'");
if ($check2->num_rows == 0) {
    $c->query("INSERT INTO master_categories (name, slug, status, show_on_menu, sort_order)
               VALUES ('Banarasi Saree','banarasi-saree','Active',1,0)");
    echo "✓ Inserted Banarasi Saree into master_categories (ID: " . $c->insert_id . ")\n";
} else {
    $r2 = $check2->fetch_assoc();
    echo "✓ Banarasi Saree already in master_categories (ID: {$r2['id']})\n";
}

// 3. Fix product statuses
$fix1 = $c->query("UPDATE products SET status='In Stock' WHERE (status IS NULL OR status='' OR status='Active') AND stock_qty > 0");
echo "✓ Fixed empty/invalid status products: " . $c->affected_rows . " rows updated to 'In Stock'\n";

$fix2 = $c->query("UPDATE products SET status='Out of Stock' WHERE stock_qty <= 0 AND (status IS NULL OR status='' OR status='Active')");
echo "✓ Fixed zero-stock products: " . $c->affected_rows . " rows updated to 'Out of Stock'\n";

// 4. Show results
echo "\n=== SAREE TYPES ===\n";
$r = $c->query("SELECT id, name FROM saree_types ORDER BY name");
while ($row = $r->fetch_assoc()) echo "  [{$row['id']}] {$row['name']}\n";

echo "\n=== MASTER CATEGORIES (Saree-related) ===\n";
$r2 = $c->query("SELECT id, name, status FROM master_categories WHERE name LIKE '%Saree%' ORDER BY name");
while ($row = $r2->fetch_assoc()) echo "  [{$row['id']}] {$row['name']} - {$row['status']}\n";

echo "\n✅ DONE. Delete this file from your server now!\n";
echo "</pre>";
?>
