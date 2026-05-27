<?php
require_once '../config/db.php';
setCORSHeaders();

/**
 * Luxe Haven - Elite Order Tracking API
 * Fetches real-time status from 'orders' and 'order_items'
 */

$order_id = $_GET['order_id'] ?? '';

// Support both #9E4F75 and 9E4F75 formats
if (!$order_id) {
    jsonResponse(['status' => 'error', 'message' => 'Order Reference Number is required'], 400);
}

$conn = getDB();

// We search by order_number (e.g. #ABCDEF) or the primary auto-increment ID
$stmt = $conn->prepare("SELECT * FROM orders WHERE order_number = ? OR id = ? LIMIT 1");
$stmt->bind_param("ss", $order_id, $order_id);
$stmt->execute();
$order = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$order) {
    jsonResponse(['status' => 'error', 'message' => 'Order not found. Please verify your reference number.'], 404);
}

// Map the DB status (Pending, Shipped, etc) to UI categories
$status_map = [
    'pending' => 'placed',
    'processing' => 'processing',
    'shipped' => 'shipped',
    'delivered' => 'delivered',
    'cancelled' => 'cancelled'
];

$dbStatus = strtolower($order['status'] ?? 'pending');
$mapped_status = $status_map[$dbStatus] ?? 'placed';

// Fetch items for this order
$iStmt = $conn->prepare("SELECT product_name as name, total_price as price FROM order_items WHERE order_id = ?");
$iStmt->bind_param("i", $order['id']);
$iStmt->execute();
$items = $iStmt->get_result()->fetch_all(MYSQLI_ASSOC);
$iStmt->close();

// Build elite tracking response
$response = [
    'id' => $order['order_number'],
    'status' => $mapped_status,
    'placedAt' => date('F d, Y', strtotime($order['created_at'])),
    'estimatedDelivery' => $order['shipping_date'] 
        ? date('F d, Y', strtotime($order['shipping_date'])) 
        : date('F d, Y', strtotime($order['created_at'] . ' + 7 days')),
    'shippingAddress' => $order['shipping_address'] ?? 'Showroom Address on File',
    'items' => $items,
    'updates' => [
        [
            'time' => date('h:i A, F d, Y', strtotime($order['created_at'])), 
            'title' => 'Order Received', 
            'desc' => 'Your handcrafted selection has been successfully received by our concierge and is entering our preparation queue.'
        ]
    ]
];

// Add smart journey logs based on current status
if (in_array($dbStatus, ['processing', 'shipped', 'delivered'])) {
    array_unshift($response['updates'], [
        'time' => 'Artisan Handover', 
        'title' => 'Preparation Started', 
        'desc' => 'Our master weavers and quality controllers have begun preparing your masterpiece for final dispatch.'
    ]);
}

if (in_array($dbStatus, ['shipped', 'delivered'])) {
    $shipTime = $order['shipping_date'] ? date('h:i A, F d, Y', strtotime($order['shipping_date'])) : 'Logistics Handover';
    array_unshift($response['updates'], [
        'time' => $shipTime, 
        'title' => 'In Transit', 
        'desc' => 'Your shipment is now with our premium logistics partners. Witness the journey to your destination.'
    ]);
}

if ($dbStatus === 'delivered') {
    array_unshift($response['updates'], [
        'time' => 'Final Milestone', 
        'title' => 'Successfully Delivered', 
        'desc' => 'Your Luxe Haven discovery has reached its destination. We hope it adds beauty to your legacy.'
    ]);
}

$conn->close();

jsonResponse([
    'status' => 'success', 
    'data' => $response
]);
