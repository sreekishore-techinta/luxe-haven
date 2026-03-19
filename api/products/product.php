<?php
require_once '../config/db.php';
setCORSHeaders();

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0 && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['status' => 'error', 'message' => 'Valid product ID is required'], 400);
}

$conn = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET ─────────────────────────────────────────────────────────────────
    case 'GET':
        $stmt = $conn->prepare(
            "SELECT p.*, 
                    mc.name  AS category_name,
                    mcl.name AS colour_name,
                    mft.name AS fabric_name,
                    msz.name AS size_name,
                    mst.name AS saree_type_name,
                    mbs.name AS blouse_style_name
             FROM products p
             LEFT JOIN master_categories   mc  ON mc.id  = p.category_id
             LEFT JOIN master_colours      mcl ON mcl.id = p.colour_id
             LEFT JOIN master_fabric_types mft ON mft.id = p.fabric_id
             LEFT JOIN master_sizes        msz ON msz.id = p.size_id
             LEFT JOIN saree_types         mst ON mst.id = p.saree_type_id
             LEFT JOIN blouse_styles       mbs ON mbs.id = p.blouse_style_id
             WHERE p.id = ?"
        );
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $product = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$product) {
            jsonResponse(['status' => 'error', 'message' => 'Product not found'], 404);
        }

        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
            . '://' . $_SERVER['HTTP_HOST'] . str_replace('api/products/product.php', '', $_SERVER['SCRIPT_NAME']);

        foreach ($gallery as &$img) {
            if (!empty($img['image_path'])) {
                if (strpos($img['image_path'], 'http') !== 0) {
                    $img['url'] = $baseUrl . ltrim($img['image_path'], '/');
                    $img['image_url'] = $img['url'];
                } else {
                    $img['url'] = $img['image_path'];
                    $img['image_url'] = $img['image_path'];
                }
            }
        }
        unset($img);
        $product['gallery'] = $gallery;

        jsonResponse(['status' => 'success', 'data' => $product]);
        break;

    // ─── PUT (Update Product) ─────────────────────────────────────────────────
    case 'PUT':
        // Catch all PHP errors so they don't corrupt JSON output
        ini_set('display_errors', 0);
        error_reporting(0);

        try {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);

            if (!is_array($data)) {
                jsonResponse(['status' => 'error', 'message' => 'Invalid JSON body'], 400);
            }

            if ($id <= 0) {
                jsonResponse(['status' => 'error', 'message' => 'Valid product ID is required'], 400);
            }

            // Check product exists
            $check = $conn->prepare("SELECT id FROM products WHERE id = ?");
            $check->bind_param("i", $id);
            $check->execute();
            $exists = $check->get_result()->fetch_assoc();
            $check->close();
            if (!$exists) {
                jsonResponse(['status' => 'error', 'message' => 'Product not found'], 404);
            }

            $fields = [];
            $params = [];
            $types = "";

            // ── String fields ────────────────────────────────────────────────
            $stringFields = [
                'name',
                'description',
                'work_type',
                'saree_length',
                'meta_title',
                'meta_description',
                'status',
                'sku',
                'availability_status',
                'fabric',
                'occasion'
            ];

            foreach ($stringFields as $f) {
                if (array_key_exists($f, $data)) {
                    $fields[] = "`$f` = ?";
                    $params[] = (string) $data[$f];
                    $types .= "s";
                }
            }

            // ── Float fields ─────────────────────────────────────────────────
            $floatFields = ['price', 'mrp_price', 'discount', 'rating'];
            foreach ($floatFields as $f) {
                if (array_key_exists($f, $data) && $data[$f] !== '' && $data[$f] !== null) {
                    $fields[] = "`$f` = ?";
                    $params[] = (float) $data[$f];
                    $types .= "d";
                }
            }

            // ── Integer FK / flag fields ──────────────────────────────────────
            $intFields = [
                'category_id',
                'fabric_id',
                'colour_id',
                'size_id',
                'saree_type_id',
                'blouse_style_id',
                'blouse_included',
                'is_bestseller',
                'is_new',
                'is_new_arrival',
                'review_count'
            ];

            foreach ($intFields as $f) {
                if (array_key_exists($f, $data)) {
                    $val = ($data[$f] === '' || $data[$f] === null) ? null : (int) $data[$f];
                    $fields[] = "`$f` = ?";
                    $params[] = $val;
                    $types .= "i";
                }
            }

            // ── Sync category_id → category (legacy int column) ───────────────
            if (array_key_exists('category_id', $data)) {
                $catVal = ($data['category_id'] === '' || $data['category_id'] === null)
                    ? null : (int) $data['category_id'];
                $fields[] = "`category` = ?";
                $params[] = $catVal;
                $types .= "i";
            }

            // ── Sync is_new_arrival → is_new ──────────────────────────────────
            if (array_key_exists('is_new_arrival', $data) && !array_key_exists('is_new', $data)) {
                $fields[] = "`is_new` = ?";
                $params[] = (int) $data['is_new_arrival'];
                $types .= "i";
            }

            // ── Stock (handles both 'stock' and 'stock_quantity' keys) ─────────
            $stockRaw = null;
            if (array_key_exists('stock_quantity', $data))
                $stockRaw = $data['stock_quantity'];
            elseif (array_key_exists('stock', $data))
                $stockRaw = $data['stock'];
            elseif (array_key_exists('stock_qty', $data))
                $stockRaw = $data['stock_qty'];

            if ($stockRaw !== null) {
                $stock = (int) $stockRaw;

                $fields[] = "`stock_quantity` = ?";
                $params[] = $stock;
                $types .= "i";

                $fields[] = "`stock_qty` = ?";
                $params[] = $stock;
                $types .= "i";

                // Recompute availability_status from stock
                $avail = $stock <= 0 ? 'Out of Stock' : ($stock < 10 ? 'Low Stock' : 'In Stock');
                $fields[] = "`availability_status` = ?";
                $params[] = $avail;
                $types .= "s";
            }

            // ── mrp_price fallback ────────────────────────────────────────────
            // If price was updated but mrp_price not explicitly set, keep mrp ≥ price
            if (array_key_exists('price', $data) && !array_key_exists('mrp_price', $data)) {
                $newPrice = (float) $data['price'];
                // Only set mrp_price if currently null — don't override user's mrp
                $fields[] = "`mrp_price` = COALESCE(NULLIF(mrp_price, 0), ?)";
                $params[] = $newPrice;
                $types .= "d";
                // Note: this uses SQL expression so gets special treatment below
            }

            // ── updated_at always refreshed ────────────────────────────────────
            $fields[] = "`updated_at` = NOW()";

            if (count(array_filter($fields, fn($f) => $f !== '`updated_at` = NOW()')) === 0) {
                jsonResponse(['status' => 'error', 'message' => 'No fields provided to update'], 400);
            }

            // ── Build and execute ─────────────────────────────────────────────
            $params[] = $id;
            $types .= "i";

            $sql = "UPDATE products SET " . implode(", ", $fields) . " WHERE id = ?";
            $stmt = $conn->prepare($sql);

            if (!$stmt) {
                throw new Exception("Prepare failed: " . $conn->error . " | SQL: $sql");
            }

            $stmt->bind_param($types, ...$params);

            if ($stmt->execute()) {
                $affected = $stmt->affected_rows;
                $stmt->close();
                jsonResponse([
                    'status' => 'success',
                    'message' => 'Product updated successfully',
                    'id' => $id,
                    'affected' => $affected
                ]);
            } else {
                $err = $stmt->error;
                $stmt->close();
                jsonResponse(['status' => 'error', 'message' => 'Update failed: ' . $err], 500);
            }

        } catch (Exception $e) {
            jsonResponse(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()], 500);
        }
        break;

    // ─── DELETE ───────────────────────────────────────────────────────────────
    case 'DELETE':
        // Remove associated images from disk
        $imgRes = $conn->query("SELECT image_path FROM product_images WHERE product_id = $id");
        if ($imgRes) {
            while ($img = $imgRes->fetch_assoc()) {
                $path = dirname(__DIR__, 2) . '/' . ltrim($img['image_path'] ?? '', '/');
                if (file_exists($path))
                    @unlink($path);
            }
        }
        // Remove image records
        $conn->query("DELETE FROM product_images WHERE product_id = $id");

        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            jsonResponse(['status' => 'success', 'message' => 'Product deleted']);
        } else {
            jsonResponse(['status' => 'error', 'message' => 'Delete failed: ' . $stmt->error], 500);
        }
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
}
?>