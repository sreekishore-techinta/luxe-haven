<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Connect to local database directly
$conn = new mysqli('localhost', 'root', '', 'luxe_haven');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$cats = [
    ['name' => 'Suits and Sets', 'slug' => 'suits-sets', 'status' => 'Active', 'sort_order' => 10, 'is_featured' => 1, 'show_on_menu' => 1],
    ['name' => 'Ready Made', 'slug' => 'ready-made', 'status' => 'Active', 'sort_order' => 20, 'is_featured' => 1, 'show_on_menu' => 1],
    ['name' => 'Materials', 'slug' => 'materials', 'status' => 'Active', 'sort_order' => 30, 'is_featured' => 1, 'show_on_menu' => 1]
];

foreach ($cats as $c) {
    // Check if exists
    $stmt = $conn->prepare("SELECT id FROM master_categories WHERE name = ?");
    $stmt->bind_param("s", $c['name']);
    $stmt->execute();
    $res = $stmt->get_result();
    
    if ($res->num_rows === 0) {
        $ins = $conn->prepare("INSERT INTO master_categories (name, slug, status, sort_order, is_featured, show_on_menu) VALUES (?, ?, ?, ?, ?, ?)");
        $ins->bind_param("sssiii", $c['name'], $c['slug'], $c['status'], $c['sort_order'], $c['is_featured'], $c['show_on_menu']);
        if ($ins->execute()) {
            echo "Inserted: " . $c['name'] . "\n";
        } else {
            echo "Error inserting " . $c['name'] . ": " . $conn->error . "\n";
        }
    } else {
        echo "Already exists: " . $c['name'] . "\n";
    }
}

$conn->close();
?>
