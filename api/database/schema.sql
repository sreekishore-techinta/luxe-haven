-- =============================================
-- Luxe Haven E-Commerce Admin Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS luxe_haven CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE luxe_haven;

-- =============================================
-- ADMINS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'manager') DEFAULT 'admin',
    avatar VARCHAR(255) DEFAULT NULL,
    last_login DATETIME DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin: password = Admin@123
INSERT INTO admins (name, email, password, role) VALUES
('Admin User', 'admin@luxehaven.com', '$2y$10$xopwI26iQl5s516/Kls34.zH1jQhMwr5OCE003zPWa4jwLQEQ00H.', 'super_admin')
ON DUPLICATE KEY UPDATE email = email;

-- =============================================
-- CUSTOMERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    pincode VARCHAR(10) DEFAULT NULL,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category ENUM('Sarees', 'Blouses', 'Suit Sets') NOT NULL,
    description TEXT DEFAULT NULL,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2) DEFAULT NULL,
    fabric VARCHAR(100) DEFAULT NULL,
    stock_qty INT DEFAULT 0,
    status ENUM('In Stock', 'Out of Stock', 'Low Stock') DEFAULT 'In Stock',
    is_new TINYINT(1) DEFAULT 0,
    is_bestseller TINYINT(1) DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- PRODUCT IMAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    is_primary TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT DEFAULT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) DEFAULT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) DEFAULT NULL,
    shipping_state VARCHAR(100) DEFAULT NULL,
    shipping_pincode VARCHAR(10) DEFAULT NULL,
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    shipping_charge DECIMAL(10,2) DEFAULT 0.00,
    discount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL,
    payment_method ENUM('UPI', 'COD', 'Card', 'Net Banking', 'Wallet') DEFAULT 'COD',
    payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
    status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    tracking_number VARCHAR(100) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT DEFAULT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(50) DEFAULT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- =============================================
-- SAMPLE DATA: PRODUCTS
-- =============================================
INSERT IGNORE INTO products (sku, name, category, description, price, discount_price, fabric, stock_qty, status, is_new, is_bestseller, rating, review_count) VALUES
('LS-2001', 'Classic Banarasi Silk Saree', 'Sarees', 'An exquisite handwoven Banarasi silk saree with intricate gold zari work.', 12500.00, 10999.00, 'Pure Silk', 45, 'In Stock', 0, 1, 4.8, 124),
('LS-2002', 'Royal Kanjivaram Masterpiece', 'Sarees', 'Heritage Kanjivaram silk with temple border design in vibrant hues.', 28000.00, 24999.00, 'Kanjivaram Silk', 12, 'Low Stock', 1, 1, 4.9, 89),
('LS-2003', 'Floral Bloom Designer Blouse', 'Blouses', 'Intricately embroidered blouse with floral motifs, perfect for Kanjivaram sarees.', 3500.00, NULL, 'Raw Silk', 60, 'In Stock', 1, 0, 4.6, 45),
('LS-2004', 'Midnight Gala Suit Set', 'Suit Sets', 'Elegant midnight blue Anarkali suit with gold embroidery work.', 8900.00, 7500.00, 'Chanderi', 30, 'In Stock', 0, 0, 4.5, 38),
('LS-2005', 'Ivory Lace Organza Saree', 'Sarees', 'A breathtaking ivory organza saree with delicate lace border.', 15000.00, NULL, 'Organza', 20, 'In Stock', 1, 0, 4.7, 62),
('LS-2006', 'Emerald Zari Blouse', 'Blouses', 'Premium emerald green blouse with zari weave and backless design.', 4200.00, 3800.00, 'Brocade Silk', 35, 'In Stock', 1, 1, 4.9, 57);

-- =============================================
-- SAMPLE DATA: CUSTOMERS
-- =============================================
INSERT IGNORE INTO customers (name, email, phone, address, city, state, pincode, total_orders, total_spent) VALUES
('Ananya Sharma', 'ananya@example.com', '9876543210', '42, Rose Garden, Banjara Hills', 'Hyderabad', 'Telangana', '500034', 5, 48500.00),
('Vikram Reddy', 'vikram@example.com', '9865321470', '12, MG Road, Koramangala', 'Bengaluru', 'Karnataka', '560034', 2, 25200.00),
('Priya Menon', 'priya@example.com', '8765432109', '56, Anna Salai, Nungambakkam', 'Chennai', 'Tamil Nadu', '600006', 8, 92400.00),
('Rahul Deshmukh', 'rahul@example.com', '7654321098', '89, FC Road, Shivajinagar', 'Pune', 'Maharashtra', '411005', 3, 18600.00),
('Sneha Patel', 'sneha@example.com', '9543210987', '23, C.G. Road, Navrangpura', 'Ahmedabad', 'Gujarat', '380009', 6, 74800.00);

-- =============================================
-- SAMPLE DATA: ORDERS
-- =============================================
INSERT IGNORE INTO orders (order_number, customer_id, customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_state, subtotal, total, payment_method, payment_status, status, created_at) VALUES
('#00124', 1, 'Ananya Sharma', 'ananya@example.com', '9876543210', '42, Rose Garden, Banjara Hills', 'Hyderabad', 'Telangana', 4300.00, 4500.00, 'UPI', 'Paid', 'Processing', '2026-03-10 10:22:00'),
('#00125', 2, 'Vikram Reddy', 'vikram@example.com', '9865321470', '12, MG Road, Koramangala', 'Bengaluru', 'Karnataka', 12000.00, 12200.00, 'Card', 'Paid', 'Shipped', '2026-03-09 14:45:00'),
('#00128', 3, 'Priya Menon', 'priya@example.com', '8765432109', '56, Anna Salai, Nungambakkam', 'Chennai', 'Tamil Nadu', 9600.00, 9800.00, 'UPI', 'Paid', 'Delivered', '2026-03-08 09:10:00'),
('#00130', 4, 'Rahul Deshmukh', 'rahul@example.com', '7654321098', '89, FC Road, Shivajinagar', 'Pune', 'Maharashtra', 6000.00, 6150.00, 'COD', 'Pending', 'Pending', '2026-03-08 16:30:00'),
('#00132', 5, 'Sneha Patel', 'sneha@example.com', '9543210987', '23, C.G. Road, Navrangpura', 'Ahmedabad', 'Gujarat', 15200.00, 15400.00, 'Net Banking', 'Paid', 'Delivered', '2026-03-07 11:00:00');

-- =============================================
-- ORDER ITEMS SAMPLE
-- =============================================
INSERT IGNORE INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price) VALUES
(1, 3, 'Floral Bloom Designer Blouse', 'LS-2003', 1, 3500.00, 3500.00),
(1, 6, 'Emerald Zari Blouse', 'LS-2006', 1, 4200.00, 4200.00),
(2, 1, 'Classic Banarasi Silk Saree', 'LS-2001', 1, 12500.00, 12500.00),
(3, 5, 'Ivory Lace Organza Saree', 'LS-2005', 1, 15000.00, 15000.00),
(4, 4, 'Midnight Gala Suit Set', 'LS-2004', 1, 8900.00, 8900.00),
(5, 2, 'Royal Kanjivaram Masterpiece', 'LS-2002', 1, 28000.00, 28000.00);

-- =============================================
-- SYSTEM SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO settings (setting_key, setting_value) VALUES
('store_name', 'Luxe Haven Boutique'),
('support_email', 'support@luxehaven.com'),
('public_notice', 'Exclusive Spring Collection is now live!'),
('tax_rate', '12'),
('maintenance_mode', '0'),
('low_stock_threshold', '10')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- =============================================
-- GENERAL MASTER TABLES
-- =============================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS master_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Sub Categories
CREATE TABLE IF NOT EXISTS master_sub_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES master_categories(id) ON DELETE CASCADE
);

-- 3. Colours
CREATE TABLE IF NOT EXISTS master_colours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    hex_code VARCHAR(20) DEFAULT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Fabric Types
CREATE TABLE IF NOT EXISTS master_fabric_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Sizes
CREATE TABLE IF NOT EXISTS master_sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- XS, S, M, L, XL, XXL, Free Size
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Sleeve Types
CREATE TABLE IF NOT EXISTS master_sleeve_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Neck Types
CREATE TABLE IF NOT EXISTS master_neck_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. Occasion Types
CREATE TABLE IF NOT EXISTS master_occasions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 9. Pattern / Work Types
CREATE TABLE IF NOT EXISTS master_patterns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
