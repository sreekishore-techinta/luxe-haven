-- ============================================================
-- Luxe Haven — Full Database Rebuild
-- Drops all corrupt tables and recreates everything clean
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables that may be corrupt or stale
DROP TABLE IF EXISTS product_add_ons;
DROP TABLE IF EXISTS product_combinations;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS customer_addresses;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS add_ons;
DROP TABLE IF EXISTS blouse_styles;
DROP TABLE IF EXISTS master_brands;
DROP TABLE IF EXISTS master_colours;
DROP TABLE IF EXISTS master_fabric_types;
DROP TABLE IF EXISTS master_sizes;
DROP TABLE IF EXISTS master_neck_types;
DROP TABLE IF EXISTS master_sleeve_types;
DROP TABLE IF EXISTS master_occasions;
DROP TABLE IF EXISTS master_patterns;
DROP TABLE IF EXISTS master_sub_categories;
DROP TABLE IF EXISTS master_categories;
DROP TABLE IF EXISTS saree_types;
DROP TABLE IF EXISTS service_categories;
DROP TABLE IF EXISTS service_groups;
DROP TABLE IF EXISTS service_options;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS slide_cards;
DROP TABLE IF EXISTS web_slider_pages;
DROP TABLE IF EXISTS web_sliders;
DROP TABLE IF EXISTS site_pages;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS customers;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- ADMINS
-- ============================================================
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin','admin','manager') DEFAULT 'admin',
    avatar VARCHAR(255) DEFAULT NULL,
    last_login DATETIME DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default admin password = Admin@123
INSERT INTO admins (name, email, password, role) VALUES
('Admin User', 'admin@luxehaven.com', '$2y$10$xopwI26iQl5s516/Kls34.zH1jQhMwr5OCE003zPWa4jwLQEQ00H.', 'super_admin');

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) DEFAULT NULL,
    password VARCHAR(255) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    pincode VARCHAR(10) DEFAULT NULL,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO settings (setting_key, setting_value) VALUES
('store_name',          'Luxe Haven Boutique'),
('support_email',       'support@luxehaven.com'),
('public_notice',       'Exclusive Spring Collection is now live!'),
('tax_rate',            '12'),
('maintenance_mode',    '0'),
('low_stock_threshold', '10');

-- ============================================================
-- MASTER LOOKUP TABLES
-- ============================================================
CREATE TABLE master_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) DEFAULT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    show_on_menu TINYINT(1) DEFAULT 1,
    is_featured TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO master_categories (name, slug, show_on_menu, is_featured, sort_order) VALUES
('Sarees',    'sarees',    1, 1, 1),
('Blouses',   'blouses',   1, 1, 2),
('Suit Sets', 'suit-sets', 1, 0, 3);

CREATE TABLE master_sub_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES master_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE master_brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE master_colours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    hex_code VARCHAR(20) DEFAULT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE master_fabric_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE master_sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE master_sleeve_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE master_neck_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE master_occasions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE master_patterns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SAREE TYPES
-- ============================================================
CREATE TABLE saree_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    hero_image VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    show_on_menu TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO saree_types (name, slug, show_on_menu, sort_order) VALUES
('Kanjivaram',   'kanjivaram',   1, 1),
('Banarasi',     'banarasi',     1, 2),
('Pure Silk',    'pure-silk',    1, 3),
('Soft Silk',    'soft-silk',    1, 4),
('Cotton',       'cotton',       1, 5),
('Organza',      'organza',      1, 6),
('Linen',        'linen',        1, 7),
('Designer',     'designer',     1, 8),
('Bridal',       'bridal',       1, 9),
('Party Wear',   'party-wear',   1, 10);

-- ============================================================
-- BLOUSE STYLES
-- ============================================================
CREATE TABLE blouse_styles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category_id INT DEFAULT NULL,
    colour_id INT DEFAULT NULL,
    fabric_id INT DEFAULT NULL,
    size_id INT DEFAULT NULL,
    brand_id INT DEFAULT NULL,
    saree_type_id INT DEFAULT NULL,
    blouse_style_id INT DEFAULT NULL,
    description TEXT DEFAULT NULL,
    price DECIMAL(10,2) NOT NULL,
    mrp_price DECIMAL(10,2) DEFAULT NULL,
    discount_price DECIMAL(10,2) DEFAULT NULL,
    fabric VARCHAR(100) DEFAULT NULL,
    stock_qty INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'In Stock',
    is_new TINYINT(1) DEFAULT 0,
    is_bestseller TINYINT(1) DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES master_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (colour_id) REFERENCES master_colours(id) ON DELETE SET NULL,
    FOREIGN KEY (fabric_id) REFERENCES master_fabric_types(id) ON DELETE SET NULL,
    FOREIGN KEY (size_id) REFERENCES master_sizes(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES master_brands(id) ON DELETE SET NULL,
    FOREIGN KEY (saree_type_id) REFERENCES saree_types(id) ON DELETE SET NULL,
    FOREIGN KEY (blouse_style_id) REFERENCES blouse_styles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    is_primary TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PRODUCT COMBINATIONS & ADD-ONS
-- ============================================================
CREATE TABLE product_combinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    colour_id INT DEFAULT NULL,
    size_id INT DEFAULT NULL,
    stock_qty INT DEFAULT 0,
    price_modifier DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE add_ons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE product_add_ons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    add_on_id INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (add_on_id) REFERENCES add_ons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
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
    billing_address TEXT DEFAULT NULL,
    billing_city VARCHAR(100) DEFAULT NULL,
    billing_state VARCHAR(100) DEFAULT NULL,
    billing_pincode VARCHAR(10) DEFAULT NULL,
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    shipping_charge DECIMAL(10,2) DEFAULT 0.00,
    discount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL,
    payment_method ENUM('UPI','COD','Card','Net Banking','Wallet') DEFAULT 'COD',
    payment_status ENUM('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
    status ENUM('Pending','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
    tracking_number VARCHAR(100) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- CUSTOMER ADDRESSES & WISHLIST
-- ============================================================
CREATE TABLE customer_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    label VARCHAR(50) DEFAULT 'Home',
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    pincode VARCHAR(10) DEFAULT NULL,
    is_default TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    label VARCHAR(50) DEFAULT 'Home',
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    pincode VARCHAR(10) DEFAULT NULL,
    is_default TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_wishlist (customer_id, product_id),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    rating INT NOT NULL DEFAULT 5,
    message TEXT NOT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SERVICE CATEGORIES
-- ============================================================
CREATE TABLE service_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    link_url VARCHAR(255) DEFAULT NULL,
    linked_category_id INT DEFAULT NULL,
    tag VARCHAR(50) DEFAULT NULL,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SLIDE CARDS
-- ============================================================
CREATE TABLE slide_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    icon VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- WEB SLIDERS
-- ============================================================
CREATE TABLE web_sliders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    button_text VARCHAR(100) DEFAULT NULL,
    button_link VARCHAR(255) DEFAULT NULL,
    image_url VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE site_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(100) NOT NULL,
    page_key VARCHAR(100) NOT NULL UNIQUE,
    page_type ENUM('home','category','user','collection','other') DEFAULT 'other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO site_pages (page_name, page_key, page_type) VALUES
('Home',        'home',        'home'),
('Sale Banner', 'sale_banner', 'other'),
('New Arrivals','new_arrivals','collection');

CREATE TABLE web_slider_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slider_id INT NOT NULL,
    page_key VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (slider_id) REFERENCES web_sliders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Done
-- ============================================================
SELECT 'Database rebuilt successfully' AS result;
SHOW TABLES;
