<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// In a real application, you would connect to a MySQL database here.
// For this example, we'll return a static list derived from our products data.

$products = [
    ["id" => 1, "name" => "Classic Banarasi Silk Saree", "price" => 12500, "fabric" => "Pure Silk", "image" => "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800"],
    ["id" => 2, "name" => "Floral Bloom Designer Blouse", "price" => 3500, "fabric" => "Silk Cotton", "image" => "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800"],
    ["id" => 3, "name" => "Midnight Gala Suit Set", "price" => 8900, "fabric" => "Chanderi", "image" => "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"],
    ["id" => 4, "name" => "Ivory Lace Saree", "price" => 15000, "fabric" => "Organza", "image" => "https://images.unsplash.com/photo-1594463750939-ebb28c3f5f6e?auto=format&fit=crop&q=80&w=800"],
    ["id" => 5, "name" => "Royal Kanjivaram Masterpiece", "price" => 28000, "fabric" => "Pure Silk", "image" => "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800"]
];

echo json_encode([
    "status" => "success",
    "data" => $products,
    "total" => count($products)
]);
?>