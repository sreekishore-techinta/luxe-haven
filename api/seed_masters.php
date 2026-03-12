<?php
require_once 'config/db.php';
$conn = getDB();

$data = [
    'master_categories' => [
        ['name' => 'Sarees', 'image_path' => 'assets/category-sarees.jpg', 'status' => 'Active'],
        ['name' => 'Blouses', 'image_path' => 'assets/category-blouses.jpg', 'status' => 'Active'],
        ['name' => 'Suit Sets', 'image_path' => 'assets/category-suits.jpg', 'status' => 'Active']
    ],
    'master_fabric_types' => [
        ['name' => 'Pure Silk', 'status' => 'Active'],
        ['name' => 'Kanjivaram Silk', 'status' => 'Active'],
        ['name' => 'Organza', 'status' => 'Active'],
        ['name' => 'Chanderi', 'status' => 'Active']
    ],
    'master_colours' => [
        ['name' => 'Royal Blue', 'hex_code' => '#002366', 'status' => 'Active'],
        ['name' => 'Emerald Green', 'hex_code' => '#50C878', 'status' => 'Active'],
        ['name' => 'Ruby Red', 'hex_code' => '#E0115F', 'status' => 'Active']
    ],
    'master_sizes' => [
        ['name' => 'S', 'status' => 'Active'],
        ['name' => 'M', 'status' => 'Active'],
        ['name' => 'L', 'status' => 'Active'],
        ['name' => 'XL', 'status' => 'Active'],
        ['name' => 'Free Size', 'status' => 'Active']
    ]
];

foreach ($data as $table => $rows) {
    foreach ($rows as $row) {
        $fields = implode(', ', array_keys($row));
        $values = "'" . implode("', '", array_values($row)) . "'";
        $conn->query("INSERT IGNORE INTO $table ($fields) VALUES ($values)");
    }
    echo "Seeded $table\n";
}

$conn->close();
