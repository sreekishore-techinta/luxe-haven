<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$customers = [
    ["id" => 1, "name" => "Ananya Sharma", "email" => "ananya@example.com", "phone" => "+91 98765 43210", "city" => "Mumbai", "orders" => 12, "spent" => "₹54,000", "status" => "Gold"],
    ["id" => 2, "name" => "Vikram Reddy", "email" => "vikram@example.com", "phone" => "+91 87654 32109", "city" => "Hyderabad", "orders" => 5, "spent" => "₹22,200", "status" => "Regular"],
    ["id" => 3, "name" => "Priya Menon", "email" => "priya@example.com", "phone" => "+91 76543 21098", "city" => "Kochi", "orders" => 8, "spent" => "₹35,800", "status" => "Silver"],
    ["id" => 4, "name" => "Rahul Deshmukh", "email" => "rahul@example.com", "phone" => "+91 65432 10987", "city" => "Pune", "orders" => 3, "spent" => "₹12,150", "status" => "Regular"],
    ["id" => 5, "name" => "Sneha Patel", "email" => "sneha@example.com", "phone" => "+91 54321 09876", "city" => "Ahmedabad", "orders" => 15, "spent" => "₹68,400", "status" => "Platinum"],
    ["id" => 6, "name" => "Arjun Singh", "email" => "arjun@example.com", "phone" => "+91 43210 98765", "city" => "Delhi", "orders" => 2, "spent" => "₹7,200", "status" => "Regular"],
    ["id" => 7, "name" => "Kavita Rao", "email" => "kavita@example.com", "phone" => "+91 32109 87654", "city" => "Bangalore", "orders" => 22, "spent" => "₹1,24,500", "status" => "Platinum"]
];

echo json_encode([
    "status" => "success",
    "data" => $customers
]);
?>