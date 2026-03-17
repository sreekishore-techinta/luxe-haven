<?php
error_reporting(E_ALL);
ini_set('display_errors', 0); // We handle output ourselves

require_once 'config/db.php';
$conn = getDB();

$results = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Get all column names for a table
function getColumns(mysqli $conn, string $table): array
{
    $cols = [];
    $res = $conn->query("SHOW COLUMNS FROM `$table`");
    if ($res)
        while ($r = $res->fetch_assoc())
            $cols[] = $r['Field'];
    return $cols;
}

// Check if a table exists
function tableExists(mysqli $conn, string $table): bool
{
    $res = $conn->query("SHOW TABLES LIKE '$table'");
    return $res && $res->num_rows > 0;
}

// Run an update only if column exists in $cols
function runIfCol(mysqli $conn, array $cols, string $col, string $label, string $sql): void
{
    global $results;
    if (!in_array($col, $cols)) {
        $results[] = "⚠️  [$label] Skipped — column '$col' not found.";
        return;
    }
    if ($conn->query($sql)) {
        $results[] = "✅ [$label] {$conn->affected_rows} rows updated.";
    } else {
        $results[] = "❌ [$label] Error: " . $conn->error;
    }
}

// Run unconditionally
function run(mysqli $conn, string $label, string $sql): void
{
    global $results;
    if ($conn->query($sql)) {
        $results[] = "✅ [$label] {$conn->affected_rows} rows updated.";
    } else {
        $results[] = "❌ [$label] Error: " . $conn->error;
    }
}

// =============================================================================
// PRODUCTS TABLE
// =============================================================================

if (!tableExists($conn, 'products')) {
    $results[] = "❌ [products] Table not found!";
} else {
    $pCols = getColumns($conn, 'products');
    $results[] = "ℹ️  [products] Columns found: " . implode(', ', $pCols);

    // slug
    runIfCol(
        $conn,
        $pCols,
        'slug',
        'slug default',
        "UPDATE products SET slug = CONCAT(LOWER(REPLACE(TRIM(name), ' ', '-')), '-', id) WHERE slug IS NULL OR slug = ''"
    );

    // description
    runIfCol(
        $conn,
        $pCols,
        'description',
        'description default',
        "UPDATE products SET description = CONCAT('Premium quality ', name, '. A beautiful addition to your wardrobe, crafted with care and precision.') WHERE description IS NULL OR description = ''"
    );

    // price sanity
    runIfCol(
        $conn,
        $pCols,
        'price',
        'price > 0',
        "UPDATE products SET price = 1999 WHERE price IS NULL OR price = 0"
    );

    // mrp_price
    runIfCol(
        $conn,
        $pCols,
        'mrp_price',
        'mrp_price = price',
        "UPDATE products SET mrp_price = price WHERE mrp_price IS NULL OR mrp_price = 0"
    );

    // discount
    runIfCol(
        $conn,
        $pCols,
        'discount',
        'discount = 0',
        "UPDATE products SET discount = 0 WHERE discount IS NULL"
    );

    // stock_quantity
    if (in_array('stock_quantity', $pCols) && in_array('stock_qty', $pCols)) {
        run(
            $conn,
            'stock_quantity from stock_qty',
            "UPDATE products SET stock_quantity = stock_qty WHERE (stock_quantity IS NULL OR stock_quantity = 0) AND stock_qty > 0"
        );
    }
    runIfCol(
        $conn,
        $pCols,
        'stock_quantity',
        'stock_quantity default 10',
        "UPDATE products SET stock_quantity = 10 WHERE stock_quantity IS NULL OR stock_quantity = 0"
    );

    // stock_qty
    if (in_array('stock_qty', $pCols) && in_array('stock_quantity', $pCols)) {
        run(
            $conn,
            'stock_qty sync from stock_quantity',
            "UPDATE products SET stock_qty = stock_quantity WHERE stock_qty IS NULL OR stock_qty = 0"
        );
    }
    runIfCol(
        $conn,
        $pCols,
        'stock_qty',
        'stock_qty default 10',
        "UPDATE products SET stock_qty = 10 WHERE stock_qty IS NULL OR stock_qty = 0"
    );

    // sku
    if (in_array('sku', $pCols)) {
        $skuRows = $conn->query("SELECT id FROM products WHERE sku IS NULL OR sku = ''");
        $skuFixed = 0;
        if ($skuRows) {
            while ($row = $skuRows->fetch_assoc()) {
                $sku = 'LH-' . strtoupper(substr(md5('lh' . $row['id']), 0, 6));
                $conn->query("UPDATE products SET sku = '$sku' WHERE id = {$row['id']}");
                $skuFixed++;
            }
        }
        $results[] = "✅ [sku] $skuFixed rows generated.";
    }

    // availability_status
    runIfCol(
        $conn,
        $pCols,
        'availability_status',
        'availability_status calc',
        "UPDATE products 
         SET availability_status = CASE 
            WHEN COALESCE(stock_quantity, stock_qty, 0) <= 0 THEN 'Out of Stock'
            WHEN COALESCE(stock_quantity, stock_qty, 0) < 10 THEN 'Low Stock'
            ELSE 'In Stock'
         END
         WHERE availability_status IS NULL OR availability_status = ''"
    );

    // status
    runIfCol(
        $conn,
        $pCols,
        'status',
        'status = Active',
        "UPDATE products SET status = 'Active' WHERE status IS NULL OR status = ''"
    );

    // category — sync integer columns
    if (in_array('category', $pCols) && in_array('category_id', $pCols)) {
        run(
            $conn,
            'category from category_id',
            "UPDATE products SET category = category_id WHERE category IS NULL AND category_id IS NOT NULL"
        );
        run(
            $conn,
            'category_id from category int',
            "UPDATE products SET category_id = category WHERE category_id IS NULL AND category IS NOT NULL AND category != 0"
        );
    }
    runIfCol(
        $conn,
        $pCols,
        'category_id',
        'category_id default 1',
        "UPDATE products SET category_id = 1 WHERE category_id IS NULL OR category_id = 0"
    );
    runIfCol(
        $conn,
        $pCols,
        'category',
        'category default 1',
        "UPDATE products SET category = 1 WHERE category IS NULL OR category = 0"
    );

    // fabric — from master_fabric_types join if fabric col exists
    if (in_array('fabric', $pCols)) {
        if (tableExists($conn, 'master_fabric_types') && in_array('fabric_id', $pCols)) {
            run(
                $conn,
                'fabric from master',
                "UPDATE products p JOIN master_fabric_types mft ON mft.id = p.fabric_id SET p.fabric = mft.name WHERE (p.fabric IS NULL OR p.fabric = '') AND p.fabric_id IS NOT NULL"
            );
        }
        run(
            $conn,
            'fabric default',
            "UPDATE products SET fabric = 'Raw Silk' WHERE fabric IS NULL OR fabric = ''"
        );
    }

    // work_type
    runIfCol(
        $conn,
        $pCols,
        'work_type',
        'work_type default',
        "UPDATE products SET work_type = 'Woven' WHERE work_type IS NULL OR work_type = ''"
    );

    // blouse_included
    runIfCol(
        $conn,
        $pCols,
        'blouse_included',
        'blouse_included = 1',
        "UPDATE products SET blouse_included = 1 WHERE blouse_included IS NULL"
    );

    // saree_length
    runIfCol(
        $conn,
        $pCols,
        'saree_length',
        'saree_length default',
        "UPDATE products SET saree_length = '5.5 meters' WHERE saree_length IS NULL OR saree_length = ''"
    );

    // occasion
    runIfCol(
        $conn,
        $pCols,
        'occasion',
        'occasion default',
        "UPDATE products SET occasion = 'Festive' WHERE occasion IS NULL OR occasion = ''"
    );

    // rating / review_count
    runIfCol(
        $conn,
        $pCols,
        'rating',
        'rating default 4.5',
        "UPDATE products SET rating = 4.5 WHERE rating IS NULL OR rating = 0"
    );
    runIfCol(
        $conn,
        $pCols,
        'review_count',
        'review_count default 0',
        "UPDATE products SET review_count = 0 WHERE review_count IS NULL"
    );

    // is_new / is_bestseller / is_new_arrival
    runIfCol(
        $conn,
        $pCols,
        'is_new',
        'is_new = 0',
        "UPDATE products SET is_new = 0 WHERE is_new IS NULL"
    );
    runIfCol(
        $conn,
        $pCols,
        'is_bestseller',
        'is_bestseller = 0',
        "UPDATE products SET is_bestseller = 0 WHERE is_bestseller IS NULL"
    );
    runIfCol(
        $conn,
        $pCols,
        'is_new_arrival',
        'is_new_arrival = 0',
        "UPDATE products SET is_new_arrival = 0 WHERE is_new_arrival IS NULL"
    );

    // meta_title
    runIfCol(
        $conn,
        $pCols,
        'meta_title',
        'meta_title from name',
        "UPDATE products SET meta_title = CONCAT(name, ' | LuxeHaven') WHERE meta_title IS NULL OR meta_title = ''"
    );

    // meta_description
    if (in_array('meta_description', $pCols) && in_array('description', $pCols)) {
        run(
            $conn,
            'meta_description from description',
            "UPDATE products SET meta_description = LEFT(description, 160) WHERE meta_description IS NULL OR meta_description = ''"
        );
    }
}

// =============================================================================
// MASTER TABLES — sort_order & status
// =============================================================================

$masterTables = [
    'master_categories',
    'master_saree_types',
    'master_colours',
    'master_fabric_types',
    'master_sizes',
    'master_sleeve_types',
    'master_neck_types'
];

foreach ($masterTables as $tbl) {
    if (!tableExists($conn, $tbl)) {
        $results[] = "⚠️  [$tbl] Table not found, skipping.";
        continue;
    }
    $mCols = getColumns($conn, $tbl);
    if (in_array('sort_order', $mCols)) {
        run(
            $conn,
            "$tbl sort_order",
            "UPDATE `$tbl` SET sort_order = id WHERE sort_order IS NULL OR sort_order = 0"
        );
    }
    if (in_array('status', $mCols)) {
        run(
            $conn,
            "$tbl status = Active",
            "UPDATE `$tbl` SET status = 'Active' WHERE status IS NULL OR status = ''"
        );
    }
}

// =============================================================================
// ORDERS TABLE
// =============================================================================

if (tableExists($conn, 'orders')) {
    $oCols = getColumns($conn, 'orders');
    runIfCol(
        $conn,
        $oCols,
        'tracking_number',
        'orders tracking_number',
        "UPDATE orders SET tracking_number = CONCAT('TRK', LPAD(id, 8, '0')) WHERE tracking_number IS NULL OR tracking_number = ''"
    );
    runIfCol(
        $conn,
        $oCols,
        'notes',
        'orders notes',
        "UPDATE orders SET notes = 'Order placed via LuxeHaven.' WHERE notes IS NULL OR notes = ''"
    );
    runIfCol(
        $conn,
        $oCols,
        'status',
        'orders status',
        "UPDATE orders SET status = 'Pending' WHERE status IS NULL OR status = ''"
    );
    runIfCol(
        $conn,
        $oCols,
        'payment_status',
        'orders payment_status',
        "UPDATE orders SET payment_status = 'Pending' WHERE payment_status IS NULL OR payment_status = ''"
    );
    if (in_array('payment_notes', $oCols) && in_array('payment_method', $oCols)) {
        run(
            $conn,
            'orders payment_notes',
            "UPDATE orders SET payment_notes = payment_method WHERE payment_notes IS NULL OR payment_notes = ''"
        );
    }
}

// =============================================================================
// CUSTOMERS TABLE
// =============================================================================

if (tableExists($conn, 'customers')) {
    $cCols = getColumns($conn, 'customers');
    runIfCol(
        $conn,
        $cCols,
        'city',
        'customers city',
        "UPDATE customers SET city = 'Not specified' WHERE city IS NULL OR city = ''"
    );
    runIfCol(
        $conn,
        $cCols,
        'state',
        'customers state',
        "UPDATE customers SET state = 'Not specified' WHERE state IS NULL OR state = ''"
    );
    runIfCol(
        $conn,
        $cCols,
        'address',
        'customers address',
        "UPDATE customers SET address = 'Address not provided' WHERE address IS NULL OR address = ''"
    );
}

$conn->close();

// ─── Tally ───────────────────────────────────────────────────────────────────
$passed = count(array_filter($results, fn($r) => strpos($r, '✅') !== false));
$skipped = count(array_filter($results, fn($r) => strpos($r, '⚠️') !== false));
$errors = count(array_filter($results, fn($r) => strpos($r, '❌') !== false));

// ─── Output ──────────────────────────────────────────────────────────────────
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>LuxeHaven — Fill NULL Defaults</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', system-ui, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            padding: 40px;
        }

        h1 {
            color: #D4AF37;
            font-size: 26px;
            margin-bottom: 6px;
        }

        .sub {
            color: #64748b;
            font-size: 13px;
            margin-bottom: 32px;
        }

        .card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 24px;
            max-width: 820px;
        }

        .row {
            padding: 7px 4px;
            border-bottom: 1px solid #0f172a;
            font-size: 12.5px;
            font-family: 'Courier New', monospace;
        }

        .row:last-child {
            border-bottom: none;
        }

        .ok {
            color: #4ade80;
        }

        .err {
            color: #f87171;
        }

        .skip {
            color: #fbbf24;
        }

        .info {
            color: #38bdf8;
        }

        .summary {
            margin-top: 24px;
            max-width: 820px;
            display: flex;
            gap: 16px;
        }

        .stat {
            flex: 1;
            padding: 16px 20px;
            border-radius: 14px;
            text-align: center;
        }

        .stat-ok {
            background: #052e16;
            border: 1px solid #16a34a;
            color: #4ade80;
        }

        .stat-sk {
            background: #1c1a05;
            border: 1px solid #ca8a04;
            color: #fbbf24;
        }

        .stat-err {
            background: #1c0505;
            border: 1px solid #dc2626;
            color: #f87171;
        }

        .stat-num {
            font-size: 32px;
            font-weight: 900;
            display: block;
        }

        .stat-lbl {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 4px;
            opacity: 0.8;
        }

        .del {
            margin-top: 20px;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 14px 20px;
            font-size: 12px;
            color: #94a3b8;
            max-width: 820px;
        }

        .del code {
            background: #0f172a;
            padding: 2px 8px;
            border-radius: 6px;
            color: #D4AF37;
        }
    </style>
</head>

<body>
    <h1>🛠 LuxeHaven — NULL Value Fixer</h1>
    <p class="sub">Dynamically detected columns and filled NULL/empty fields with intelligent defaults.</p>

    <div class="card">
        <?php foreach ($results as $r):
            $cls = 'ok';
            if (strpos($r, '⚠️') !== false)
                $cls = 'skip';
            elseif (strpos($r, '❌') !== false)
                $cls = 'err';
            elseif (strpos($r, 'ℹ️') !== false)
                $cls = 'info';
            ?>
            <div class="row <?= $cls ?>"><?= htmlspecialchars($r) ?></div>
        <?php endforeach; ?>
    </div>

    <div class="summary">
        <div class="stat stat-ok">
            <span class="stat-num"><?= $passed ?></span>
            <div class="stat-lbl">✅ Passed</div>
        </div>
        <div class="stat stat-sk">
            <span class="stat-num"><?= $skipped ?></span>
            <div class="stat-lbl">⚠️ Skipped</div>
        </div>
        <div class="stat stat-err">
            <span class="stat-num"><?= $errors ?></span>
            <div class="stat-lbl">❌ Errors</div>
        </div>
    </div>

    <div class="del">
        ⚠️ <strong>Security:</strong> After confirming the data is correct, delete this file:
        <code>C:\xampp\htdocs\luxe-haven\api\fill_null_defaults.php</code>
    </div>
</body>

</html>
