<?php
require_once 'config/db.php';
$conn = getDB();

$newHeroPath = 'src/assets/hero-banners/bridal-hero.png';
$name = 'Bridal Saree';

$tables = [
    'master_categories',
    'saree_types',
    'master_sub_categories'
];

foreach ($tables as $table) {
    $colRes = $conn->query("SHOW COLUMNS FROM `$table` LIKE 'hero_image'");
    if ($colRes && $colRes->num_rows > 0) {
        $sql = "UPDATE `$table` SET hero_image = '$newHeroPath' WHERE name = '$name'";
        if ($conn->query($sql)) {
            echo "✓ Updated $table hero_image for $name<br>";
        }
    }
}

$conn->close();
echo "<strong>Bridal update complete!</strong>";
?>
