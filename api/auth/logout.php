<?php
session_start();
require_once '../config/db.php';
setCORSHeaders();

session_destroy();
jsonResponse(['status' => 'success', 'message' => 'Logged out successfully']);
