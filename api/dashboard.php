<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Mock Data - In a real app, this would come from a MySQL database
$stats = [
    [
        "title" => "Total Revenue",
        "value" => "₹2,84,500",
        "change" => "+12.5%",
        "isPositive" => true,
        "icon" => "DollarSign",
        "color" => "bg-blue-50 text-blue-600"
    ],
    [
        "title" => "New Orders",
        "value" => "148",
        "change" => "+8.2%",
        "isPositive" => true,
        "icon" => "ShoppingBag",
        "color" => "bg-emerald-50 text-emerald-600"
    ],
    [
        "title" => "Active Customers",
        "value" => "1,240",
        "change" => "-2.4%",
        "isPositive" => false,
        "icon" => "Users",
        "color" => "bg-orange-50 text-orange-600"
    ],
    [
        "title" => "Sales Velocity",
        "value" => "24.5",
        "change" => "+18.1%",
        "isPositive" => true,
        "icon" => "TrendingUp",
        "color" => "bg-purple-50 text-purple-600"
    ]
];

$recent_orders = [
    ["id" => "#00124", "name" => "Ananya Sharma", "amount" => "₹4,500", "status" => "Processing", "color" => "text-blue-600 bg-blue-50"],
    ["id" => "#00125", "name" => "Vikram Reddy", "amount" => "₹12,200", "status" => "Shipped", "color" => "text-purple-600 bg-purple-50"],
    ["id" => "#00128", "name" => "Priya Menon", "amount" => "₹9,800", "status" => "Completed", "color" => "text-emerald-600 bg-emerald-50"],
    ["id" => "#00130", "name" => "Rahul Deshmukh", "amount" => "₹6,150", "status" => "Pending", "color" => "text-amber-600 bg-amber-50"],
    ["id" => "#00132", "name" => "Sneha Patel", "amount" => "₹15,400", "status" => "Completed", "color" => "text-emerald-600 bg-emerald-50"]
];

$inventory = [
    ["label" => "Silk Sarees", "count" => 124, "status" => "Healthy", "color" => "bg-emerald-500", "percent" => 85],
    ["label" => "Designer Blouse", "count" => 42, "status" => "Low Stock", "color" => "bg-amber-500", "percent" => 30],
    ["label" => "Cotton Mix", "count" => 86, "status" => "Healthy", "color" => "bg-emerald-500", "percent" => 65],
    ["label" => "Banarasi Special", "count" => 12, "status" => "Critically Low", "color" => "bg-rose-500", "percent" => 10]
];

echo json_encode([
    "status" => "success",
    "data" => [
        "stats" => $stats,
        "recent_orders" => $recent_orders,
        "inventory" => $inventory
    ]
]);
?>
