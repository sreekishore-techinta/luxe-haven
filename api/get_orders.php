<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$orders = [
    ["id" => "#00124", "name" => "Ananya Sharma", "email" => "ananya@example.com", "amount" => "₹4,500", "status" => "Processing", "date" => "2026-03-10", "items" => 2],
    ["id" => "#00125", "name" => "Vikram Reddy", "email" => "vikram@example.com", "amount" => "₹12,200", "status" => "Shipped", "date" => "2026-03-09", "items" => 1],
    ["id" => "#00128", "name" => "Priya Menon", "email" => "priya@example.com", "amount" => "₹9,800", "status" => "Completed", "date" => "2026-03-08", "items" => 3],
    ["id" => "#00130", "name" => "Rahul Deshmukh", "email" => "rahul@example.com", "amount" => "₹6,150", "status" => "Pending", "date" => "2026-03-08", "items" => 1],
    ["id" => "#00132", "name" => "Sneha Patel", "email" => "sneha@example.com", "amount" => "₹15,400", "status" => "Completed", "date" => "2026-03-07", "items" => 2],
    ["id" => "#00135", "name" => "Arjun Singh", "email" => "arjun@example.com", "amount" => "₹7,200", "status" => "Cancelled", "date" => "2026-03-06", "items" => 1],
    ["id" => "#00140", "name" => "Kavita Rao", "email" => "kavita@example.com", "amount" => "₹11,500", "status" => "Completed", "date" => "2026-03-05", "items" => 4]
];

echo json_encode([
    "status" => "success",
    "data" => $orders
]);
?>
