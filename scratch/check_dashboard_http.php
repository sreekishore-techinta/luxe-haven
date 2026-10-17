<?php
$r = file_get_contents('http://127.0.0.1/uma/luxe-haven/api/dashboard/index.php');
if ($r === false) {
    echo "FAILED TO FETCH\n";
} else {
    $d = json_decode($r);
    if ($d && isset($d->status)) {
        echo "STATUS: " . $d->status . "\n";
        if ($d->data && $d->data->stats) {
            echo "Stats count: " . count($d->data->stats) . "\n";
        }
        echo "Inventory count: " . count($d->data->inventory) . "\n";
    } else {
        echo "RAW: " . substr($r, 0, 500) . "\n";
    }
}
