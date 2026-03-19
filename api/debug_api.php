<?php
header('Content-Type: application/json');
$res = file_get_contents('http://localhost/luxe-haven/api/public/products.php?per_page=1&show_oos=1');
echo $res;
?>
