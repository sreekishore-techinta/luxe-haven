<?php
require_once '../config/db.php';
setCORSHeaders();

$conn = getDB();

// ─── Revenue & Orders Stats ────────────────────────────────────────────
$statsResult = $conn->query("
    SELECT
        COUNT(*)                                               AS total_orders,
        COALESCE(SUM(total), 0)                               AS total_revenue,
        COALESCE(SUM(CASE WHEN status='Pending' THEN 1 END),0)     AS pending_orders,
        COALESCE(SUM(CASE WHEN status='Processing' THEN 1 END),0)  AS processing_orders,
        COALESCE(SUM(CASE WHEN status='Shipped' THEN 1 END),0)     AS shipped_orders,
        COALESCE(SUM(CASE WHEN status='Delivered' THEN 1 END),0)   AS delivered_orders,
        COALESCE(SUM(CASE WHEN status='Cancelled' THEN 1 END),0)   AS cancelled_orders
    FROM orders
");
$orderStats = $statsResult->fetch_assoc();

// This month vs last month revenue
$revenueResult = $conn->query("
    SELECT
        COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) THEN total END), 0) AS this_month,
        COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(NOW() - INTERVAL 1 MONTH) AND YEAR(created_at) = YEAR(NOW() - INTERVAL 1 MONTH) THEN total END), 0) AS last_month
    FROM orders WHERE status != 'Cancelled'
");
$revenue = $revenueResult->fetch_assoc();
$revenueChange = $revenue['last_month'] > 0
    ? round((($revenue['this_month'] - $revenue['last_month']) / $revenue['last_month']) * 100, 1)
    : 100;

// ─── Customer Stats ────────────────────────────────────────────────────
$custResult = $conn->query("SELECT COUNT(*) as total FROM customers");
$totalCustomers = $custResult->fetch_assoc()['total'];

$newCustResult = $conn->query("SELECT COUNT(*) as new_this_month FROM customers WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())");
$newCustomers = $newCustResult->fetch_assoc()['new_this_month'];

// ─── Product Stats ─────────────────────────────────────────────────────
$prodResult = $conn->query("SELECT COUNT(*) as total, SUM(stock_qty) as total_stock FROM products");
$prodStats = $prodResult->fetch_assoc();

$lowStockResult = $conn->query("SELECT COUNT(*) as count FROM products WHERE status = 'Low Stock' OR status = 'Out of Stock'");
$lowStock = $lowStockResult->fetch_assoc()['count'];

// ─── Recent Orders ─────────────────────────────────────────────────────
$recentResult = $conn->query("
    SELECT o.id, o.order_number, o.customer_name, o.customer_email,
           o.total, o.status, o.payment_status, o.created_at,
           COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT 8
");
$recentOrders = $recentResult->fetch_all(MYSQLI_ASSOC);

// ─── Inventory Summary ─────────────────────────────────────────────────
$inventoryResult = $conn->query("
    SELECT category,
           COUNT(*) as total_products,
           SUM(stock_qty) as total_stock,
           SUM(CASE WHEN status='In Stock' THEN 1 ELSE 0 END) as in_stock,
           SUM(CASE WHEN status='Low Stock' THEN 1 ELSE 0 END) as low_stock,
           SUM(CASE WHEN status='Out of Stock' THEN 1 ELSE 0 END) as out_of_stock
    FROM products
    GROUP BY category
");
$inventory = $inventoryResult->fetch_all(MYSQLI_ASSOC);

// ─── Sales by Category ─────────────────────────────────────────────────
$salesResult = $conn->query("
    SELECT p.category, 
           COUNT(oi.id) as total_sold,
           COALESCE(SUM(oi.total_price), 0) as revenue
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status != 'Cancelled'
    GROUP BY p.category
    ORDER BY revenue DESC
");
$salesByCategory = $salesResult->fetch_all(MYSQLI_ASSOC);

$conn->close();

// ─── Format dashboard stats cards ─────────────────────────────────────
$stats = [
    [
        'title' => 'Total Revenue',
        'value' => '₹' . number_format($orderStats['total_revenue'], 0, '.', ','),
        'change' => ($revenueChange >= 0 ? '+' : '') . $revenueChange . '%',
        'isPositive' => $revenueChange >= 0,
        'icon' => 'DollarSign',
        'color' => 'bg-blue-50 text-blue-600',
        'raw' => (float) $orderStats['total_revenue'],
    ],
    [
        'title' => 'New Orders',
        'value' => (string) $orderStats['total_orders'],
        'change' => '+' . $orderStats['processing_orders'] . ' processing',
        'isPositive' => true,
        'icon' => 'ShoppingBag',
        'color' => 'bg-emerald-50 text-emerald-600',
        'raw' => (int) $orderStats['total_orders'],
    ],
    [
        'title' => 'Active Customers',
        'value' => number_format($totalCustomers),
        'change' => '+' . $newCustomers . ' this month',
        'isPositive' => true,
        'icon' => 'Users',
        'color' => 'bg-orange-50 text-orange-600',
        'raw' => (int) $totalCustomers,
    ],
    [
        'title' => 'Total Products',
        'value' => (string) $prodStats['total'],
        'change' => $lowStock > 0 ? $lowStock . ' need restock' : 'All stocked',
        'isPositive' => $lowStock === 0,
        'icon' => 'TrendingUp',
        'color' => 'bg-purple-50 text-purple-600',
        'raw' => (int) $prodStats['total'],
    ],
];

jsonResponse([
    'status' => 'success',
    'data' => [
        'stats' => $stats,
        'order_summary' => $orderStats,
        'recent_orders' => $recentOrders,
        'inventory' => $inventory,
        'sales_by_category' => $salesByCategory,
        'revenue' => [
            'this_month' => (float) $revenue['this_month'],
            'last_month' => (float) $revenue['last_month'],
            'change_pct' => $revenueChange,
        ],
    ],
]);
