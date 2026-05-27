<?php
$db = new mysqli('127.0.0.1', 'root', '', 'luxe_haven');
if ($db->connect_error) die("Connection failed: " . $db->connect_error);

// Add column for dynamic add-ons if it doesn't exist
$res = $db->query("SHOW COLUMNS FROM order_items LIKE 'selected_add_ons'");
if ($res->num_rows == 0) {
    if ($db->query("ALTER TABLE order_items ADD COLUMN selected_add_ons TEXT DEFAULT NULL")) {
        echo "Successfully added selected_add_ons column to order_items table.\n";
    } else {
        echo "Error: " . $db->error . "\n";
    }
} else {
    echo "Column selected_add_ons already exists.\n";
}
?>
