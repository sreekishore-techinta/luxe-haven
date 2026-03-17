<?php
/**
 * One-time repair: copy image_url -> image_path for existing records
 * where image_path is empty but image_url has a value.
 */
require_once 'config/db.php';
$conn = getDB();

$result = $conn->query("
    UPDATE product_images
    SET image_path = image_url
    WHERE (image_path IS NULL OR image_path = '')
      AND (image_url IS NOT NULL AND image_url != '')
");

$affected = $conn->affected_rows;

$conn->close();

echo json_encode([
  'status' => 'success',
  'message' => "Repaired $affected product_images rows.",
]);
?>
