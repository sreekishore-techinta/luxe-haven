<?php
require_once 'config/db.php';
$conn = getDB();

// The new hero image path provided by the user (relative to project root)
$newHeroPath = 'src/assets/hero-banners/banarasi-hero.png';

// Update for both 'master_categories', 'saree_types', and 'master_sub_categories' 
// to ensure it shows up wherever Banarasi is used as a header.
$tables = [
    ['table' => 'master_categories', 'name' => 'Banarasi Saree'],
    ['table' => 'saree_types', 'name' => 'Banarasi Saree'],
    ['table' => 'master_sub_categories', 'name' => 'Banarasi Saree']
];

foreach ($tables as $item) {
    $table = $item['table'];
    $name = $item['name'];
    
    // Check if hero_image column exists
    $colRes = $conn->query("SHOW COLUMNS FROM `$table` LIKE 'hero_image'");
    if ($colRes && $colRes->num_rows > 0) {
        $sql = "UPDATE `$table` SET hero_image = '$newHeroPath' WHERE name = '$name'";
        if ($conn->query($sql)) {
            echo "✓ Updated $table hero_image for $name<br>";
        } else {
            echo "✗ Error updating $table: " . $conn->error . "<br>";
        }
    }
}

$conn->close();
echo "<strong>Update complete!</strong>";
?>
