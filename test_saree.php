<?php
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_ORIGIN'] = '*';
ob_start();
require 'api/public/saree_types.php';
$out = ob_get_clean();
file_put_contents('output_saree.txt', $out);
