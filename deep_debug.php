<?php
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'api/config/db.php';
$conn = getDB();

echo "--- CATEGORY CHECK ---\n";
$res = $conn->query("SELECT id, name, slug FROM master_categories WHERE name LIKE '%Banarasi%'");
while ($row = $res->fetch_assoc()) echo json_encode($row) . "\n";

echo "\n--- PRODUCT CHECK (CAT 8) ---\n";
$res = $conn->query("SELECT id, name, category_id, status FROM products WHERE category_id = 8");
if ($res) {
    echo "Found " . $res->num_rows . " products.\n";
    while ($row = $res->fetch_assoc()) echo json_encode($row) . "\n";
}

echo "\n--- API SIMULATION ---\n";
$slug = "banarasi-saree";
$stmt = $conn->prepare("SELECT id FROM master_categories WHERE slug = ?");
$stmt->bind_param("s", $slug);
$stmt->execute();
$catId = $stmt->get_result()->fetch_assoc()['id'] ?? null;
echo "Slug '$slug' resolved to Category ID: " . ($catId ?? 'NULL') . "\n";

?>
