<?php
if(isset($_GET['type']) && $_GET['type'] == 'saree_types') {
    file_put_contents(__DIR__.'/DEBUG_SAREE_TYPES.txt', date('Y-m-d H:i:s') . "\nHOST: " . ($_SERVER['HTTP_HOST'] ?? 'none') . "\nIS_LOCAL: " . (defined('IS_LOCAL') && IS_LOCAL ? 'TRUE' : 'FALSE') . "\nJSON: " . json_encode($data) . "\n", FILE_APPEND);
}
