-- ============================================================
-- Luxe Haven — Full Seed Data
-- Master tables + Sample Products + Images
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing seed data
TRUNCATE TABLE product_add_ons;
TRUNCATE TABLE product_combinations;
TRUNCATE TABLE product_images;
TRUNCATE TABLE products;
TRUNCATE TABLE master_brands;
TRUNCATE TABLE master_colours;
TRUNCATE TABLE master_fabric_types;
TRUNCATE TABLE master_sizes;
TRUNCATE TABLE master_neck_types;
TRUNCATE TABLE master_sleeve_types;
TRUNCATE TABLE master_occasions;
TRUNCATE TABLE master_patterns;
TRUNCATE TABLE blouse_styles;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- MASTER BRANDS
-- ============================================================
INSERT INTO master_brands (name, status) VALUES
('Kanchipuram Silks',  'Active'),
('Banarasi Weavers',   'Active'),
('Heritage Looms',     'Active'),
('Royal Drapes',       'Active'),
('Silk India',         'Active');

-- ============================================================
-- MASTER COLOURS
-- ============================================================
INSERT INTO master_colours (name, hex_code, status) VALUES
('Red',           '#CC0000', 'Active'),
('Royal Blue',    '#4169E1', 'Active'),
('Gold',          '#FFD700', 'Active'),
('Green',         '#006400', 'Active'),
('Pink',          '#FF69B4', 'Active'),
('Purple',        '#800080', 'Active'),
('Maroon',        '#800000', 'Active'),
('Navy Blue',     '#000080', 'Active'),
('Orange',        '#FF8C00', 'Active'),
('Ivory',         '#FFFFF0', 'Active'),
('Yellow',        '#FFD700', 'Active'),
('Teal',          '#008080', 'Active'),
('Black',         '#000000', 'Active'),
('White',         '#FFFFFF', 'Active'),
('Peach',         '#FFDAB9', 'Active');

-- ============================================================
-- MASTER FABRIC TYPES
-- ============================================================
INSERT INTO master_fabric_types (name, status) VALUES
('Pure Silk',       'Active'),
('Kanjivaram Silk', 'Active'),
('Banarasi Silk',   'Active'),
('Soft Silk',       'Active'),
('Cotton Silk',     'Active'),
('Organza',         'Active'),
('Linen',           'Active'),
('Chanderi',        'Active'),
('Georgette',       'Active'),
('Chiffon',         'Active'),
('Raw Silk',        'Active'),
('Tussar Silk',     'Active'),
('Brocade',         'Active');

-- ============================================================
-- MASTER SIZES
-- ============================================================
INSERT INTO master_sizes (name, status) VALUES
('Free Size', 'Active'),
('XS',        'Active'),
('S',         'Active'),
('M',         'Active'),
('L',         'Active'),
('XL',        'Active'),
('XXL',       'Active');

-- ============================================================
-- MASTER SLEEVE TYPES
-- ============================================================
INSERT INTO master_sleeve_types (name, status) VALUES
('Sleeveless',    'Active'),
('Short Sleeve',  'Active'),
('3/4 Sleeve',    'Active'),
('Full Sleeve',   'Active'),
('Cap Sleeve',    'Active');

-- ============================================================
-- MASTER NECK TYPES
-- ============================================================
INSERT INTO master_neck_types (name, status) VALUES
('Round Neck',    'Active'),
('V-Neck',        'Active'),
('Boat Neck',     'Active'),
('Sweetheart',    'Active'),
('Square Neck',   'Active'),
('Halter Neck',   'Active'),
('High Neck',     'Active'),
('Backless',      'Active');

-- ============================================================
-- MASTER OCCASIONS
-- ============================================================
INSERT INTO master_occasions (name, status) VALUES
('Bridal',       'Active'),
('Wedding',      'Active'),
('Festival',     'Active'),
('Party Wear',   'Active'),
('Casual',       'Active'),
('Office Wear',  'Active'),
('Daily Wear',   'Active');

-- ============================================================
-- MASTER PATTERNS
-- ============================================================
INSERT INTO master_patterns (name, status) VALUES
('Zari Work',      'Active'),
('Embroidery',     'Active'),
('Plain',          'Active'),
('Printed',        'Active'),
('Woven',          'Active'),
('Bandhani',       'Active'),
('Kalamkari',      'Active'),
('Block Print',    'Active'),
('Sequin Work',    'Active'),
('Thread Work',    'Active');

-- ============================================================
-- BLOUSE STYLES
-- ============================================================
INSERT INTO blouse_styles (name, slug, status, sort_order) VALUES
('Designer Blouse',   'designer-blouse',   'Active', 1),
('Zari Blouse',       'zari-blouse',       'Active', 2),
('Embroidered Blouse','embroidered-blouse','Active', 3),
('Brocade Blouse',    'brocade-blouse',    'Active', 4),
('Plain Blouse',      'plain-blouse',      'Active', 5),
('Backless Blouse',   'backless-blouse',   'Active', 6);

-- ============================================================
-- SUB CATEGORIES
-- ============================================================
-- category_id 1 = Sarees, 2 = Blouses, 3 = Suit Sets
INSERT INTO master_sub_categories (category_id, name, slug, status, sort_order) VALUES
(1, 'Kanjivaram Sarees',  'kanjivaram-sarees',  'Active', 1),
(1, 'Banarasi Sarees',    'banarasi-sarees',    'Active', 2),
(1, 'Silk Sarees',        'silk-sarees',        'Active', 3),
(1, 'Cotton Sarees',      'cotton-sarees',      'Active', 4),
(1, 'Organza Sarees',     'organza-sarees',     'Active', 5),
(1, 'Party Wear Sarees',  'party-wear-sarees',  'Active', 6),
(1, 'Bridal Sarees',      'bridal-sarees',      'Active', 7),
(2, 'Designer Blouses',   'designer-blouses',   'Active', 1),
(2, 'Embroidered Blouses','embroidered-blouses','Active', 2),
(2, 'Zari Blouses',       'zari-blouses',       'Active', 3),
(3, 'Anarkali Suits',     'anarkali-suits',     'Active', 1),
(3, 'Palazzo Suits',      'palazzo-suits',      'Active', 2),
(3, 'Straight Suits',     'straight-suits',     'Active', 3);

-- ============================================================
-- PRODUCTS
-- category_id: 1=Sarees, 2=Blouses, 3=Suit Sets
-- colour_id: 1=Red,2=Royal Blue,3=Gold,4=Green,5=Pink,6=Purple,7=Maroon,8=Navy,9=Orange,10=Ivory
-- fabric_id: 1=Pure Silk,2=Kanjivaram,3=Banarasi,4=Soft Silk,5=Cotton Silk,6=Organza,7=Linen,8=Chanderi
-- saree_type_id: 1=Kanjivaram,2=Banarasi,3=Pure Silk,4=Soft Silk,5=Cotton,6=Organza,7=Linen,8=Designer,9=Bridal,10=Party Wear
-- brand_id: 1-5
-- size_id: 1=Free Size
-- ============================================================
INSERT INTO products (sku, name, category_id, colour_id, fabric_id, size_id, brand_id, saree_type_id, description, price, mrp_price, discount_price, stock_qty, status, is_new, is_bestseller, rating, review_count) VALUES

-- SAREES —— Kanjivaram
('LS-S001', 'Classic Crimson Kanjivaram Silk Saree', 1, 1, 2, 1, 1, 1,
 'An exquisite handwoven Kanjivaram silk saree in deep crimson with intricate gold zari border. A timeless piece for every bridal trousseau.',
 24999.00, 28000.00, 22999.00, 15, 'In Stock', 0, 1, 4.9, 134),

('LS-S002', 'Royal Blue Kanjivaram Temple Border Saree', 1, 2, 2, 1, 1, 1,
 'Heritage Kanjivaram silk with classic temple border design in royal blue and gold. Perfect for weddings and festive occasions.',
 32000.00, 36000.00, 29999.00, 8, 'Low Stock', 1, 1, 4.8, 89),

('LS-S003', 'Emerald Green Kanjivaram Zari Saree', 1, 4, 2, 1, 1, 1,
 'Stunning emerald green Kanjivaram with heavy gold zari work throughout. A classic choice for all auspicious occasions.',
 28500.00, 32000.00, 26999.00, 20, 'In Stock', 0, 0, 4.7, 67),

('LS-S004', 'Maroon Bridal Kanjivaram Masterpiece', 1, 7, 2, 1, 1, 1,
 'Grand bridal Kanjivaram in rich maroon with intricate peacock motifs and gold zari work. The ultimate bridal saree.',
 45000.00, 52000.00, 42999.00, 5, 'Low Stock', 1, 1, 5.0, 45),

-- SAREES —— Banarasi
('LS-S005', 'Ivory Banarasi Silk Saree with Gold Zari', 1, 10, 3, 1, 2, 2,
 'Luxurious ivory Banarasi silk with delicate gold zari weave. Lightweight yet rich — perfect for receptions and ceremonies.',
 18500.00, 22000.00, 17499.00, 25, 'In Stock', 1, 0, 4.6, 78),

('LS-S006', 'Purple Banarasi Brocade Saree', 1, 6, 3, 1, 2, 2,
 'Deep purple Banarasi brocade with intricate floral motifs woven in gold and silver threads. A statement piece for festive wear.',
 21000.00, 25000.00, 19499.00, 18, 'In Stock', 0, 1, 4.7, 92),

('LS-S007', 'Navy Blue Banarasi Georgette Saree', 1, 8, 3, 1, 2, 2,
 'Elegant navy Banarasi georgette with butis across the body and a rich zari border. Comfortable for long occasions.',
 15999.00, 19000.00, 14999.00, 30, 'In Stock', 0, 0, 4.5, 56),

-- SAREES —— Pure Silk / Soft Silk
('LS-S008', 'Peach Soft Silk Saree with Embroidery', 1, 15, 4, 1, 3, 4,
 'Graceful peach soft silk with delicate floral embroidery on the border. Light, comfortable and absolutely elegant.',
 12500.00, 15000.00, 11999.00, 35, 'In Stock', 1, 0, 4.5, 63),

('LS-S009', 'Gold Pure Silk Party Wear Saree', 1, 3, 1, 1, 5, 3,
 'Radiant gold pure silk saree with rich tissue texture. Perfect for grand celebrations and evening events.',
 19999.00, 24000.00, 18499.00, 22, 'In Stock', 0, 1, 4.8, 101),

('LS-S010', 'Pink Soft Silk Floral Saree', 1, 5, 4, 1, 3, 4,
 'Romantic pink soft silk with woven floral motifs and a contrast border. Perfect for daytime functions.',
 13500.00, 16000.00, 12499.00, 28, 'In Stock', 1, 0, 4.4, 48),

-- SAREES —— Organza / Cotton / Linen
('LS-S011', 'Ivory Organza Lace Border Saree', 1, 10, 6, 1, 4, 6,
 'Breathtaking ivory organza with delicate lace border and scattered embroidery. Ideal for cocktail parties and receptions.',
 16500.00, 20000.00, 15499.00, 20, 'In Stock', 1, 0, 4.7, 72),

('LS-S012', 'Teal Cotton Silk Kalamkari Saree', 1, 12, 5, 1, 3, 5,
 'Vibrant teal cotton silk with hand-painted Kalamkari motifs. A beautiful blend of art and tradition.',
 8999.00, 11000.00, 8499.00, 40, 'In Stock', 0, 0, 4.3, 38),

('LS-S013', 'Yellow Linen Saree with Zari Border', 1, 11, 7, 1, 5, 7,
 'Bright yellow linen saree with elegant gold zari border. Lightweight and perfect for summer festivities.',
 7500.00, 9500.00, 6999.00, 50, 'In Stock', 0, 0, 4.2, 29),

-- SAREES —— Designer / Party Wear / Bridal
('LS-S014', 'Red Sequin Designer Party Wear Saree', 1, 1, 9, 1, 4, 10,
 'Show-stopping red georgette with heavy sequin embroidery throughout. Perfect for cocktail parties and sangeet nights.',
 22000.00, 28000.00, 20999.00, 12, 'In Stock', 1, 1, 4.8, 88),

('LS-S015', 'Orange Designer Bridal Lehenga Saree', 1, 9, 1, 1, 1, 9,
 'Grand orange bridal saree with heavy zardozi and stone work. Comes with matching embroidered blouse piece.',
 55000.00, 65000.00, 52999.00, 4, 'Low Stock', 1, 1, 5.0, 32),

('LS-S016', 'Black Georgette Printed Saree', 1, 13, 9, 1, 5, 8,
 'Sophisticated black georgette with digital floral print and contrast red border. Office to party ready.',
 6999.00, 9000.00, 6499.00, 45, 'In Stock', 0, 0, 4.1, 41),

-- BLOUSES
('LS-B001', 'Crimson Zari Embroidered Blouse', 2, 1, 2, 3, 1, NULL,
 'Premium crimson Kanjivaram silk blouse with intricate gold zari work. Pairs beautifully with silk sarees.',
 4500.00, 5500.00, 4199.00, 30, 'In Stock', 1, 1, 4.9, 57),

('LS-B002', 'Ivory Brocade Designer Blouse', 2, 10, 13, 3, 2, NULL,
 'Elegant ivory brocade blouse with a modern backless design and intricate woven patterns.',
 3800.00, 4800.00, 3499.00, 35, 'In Stock', 1, 0, 4.6, 43),

('LS-B003', 'Gold Sequin Party Blouse', 2, 3, 11, 3, 4, NULL,
 'Glamorous gold raw silk blouse with all-over sequin work. Perfect for evening events and parties.',
 5200.00, 6500.00, 4799.00, 25, 'In Stock', 0, 1, 4.7, 61),

('LS-B004', 'Navy Blue Mirror Work Blouse', 2, 8, 11, 4, 3, NULL,
 'Stunning navy blue blouse with traditional mirror work and thread embroidery. Pairs with cotton and silk sarees.',
 3200.00, 4000.00, 2999.00, 40, 'In Stock', 0, 0, 4.4, 35),

('LS-B005', 'Pink Organza Floral Blouse', 2, 5, 6, 3, 5, NULL,
 'Delicate pink organza blouse with 3D floral applique work. Light and elegant for daytime occasions.',
 2800.00, 3500.00, 2599.00, 50, 'In Stock', 1, 0, 4.5, 28),

('LS-B006', 'Maroon Silk Velvet Blouse', 2, 7, 1, 4, 1, NULL,
 'Rich maroon silk velvet blouse with zari border and pearl buttons. A classic choice for bridal wear.',
 4200.00, 5200.00, 3899.00, 20, 'In Stock', 0, 1, 4.8, 52),

-- SUIT SETS
('LS-SS001', 'Royal Blue Anarkali Suit Set', 3, 2, 8, 4, 3, NULL,
 'Elegant royal blue Chanderi Anarkali suit with gold embroidery. Includes matching churidar and dupatta.',
 8500.00, 11000.00, 7999.00, 25, 'In Stock', 1, 1, 4.7, 73),

('LS-SS002', 'Pink Palazzo Suit Set with Dupatta', 3, 5, 8, 4, 5, NULL,
 'Graceful pink Chanderi suit with palazzo pants and printed dupatta. Comfortable and stylish for all occasions.',
 6500.00, 8500.00, 5999.00, 30, 'In Stock', 0, 0, 4.4, 42),

('LS-SS003', 'Green Embroidered Straight Suit', 3, 4, 7, 5, 4, NULL,
 'Beautiful green linen straight suit with floral thread embroidery. Perfect for office and casual wear.',
 5800.00, 7500.00, 5399.00, 35, 'In Stock', 1, 0, 4.5, 38),

('LS-SS004', 'Maroon Bridal Lehenga Style Suit', 3, 7, 1, 5, 1, NULL,
 'Grand maroon pure silk suit in lehenga style with heavy zardozi work. Perfect for wedding functions.',
 18000.00, 22000.00, 16999.00, 10, 'Low Stock', 1, 1, 4.9, 55),

('LS-SS005', 'Peach Georgette Party Suit Set', 3, 15, 9, 4, 2, NULL,
 'Flowy peach georgette suit with shimmer dupatta and embellished neckline. Ideal for cocktail parties.',
 7200.00, 9500.00, 6799.00, 28, 'In Stock', 0, 1, 4.6, 47);

-- ============================================================
-- PRODUCT IMAGES (primary images using existing assets)
-- ============================================================
-- Sarees
INSERT INTO product_images (product_id, image_path, is_primary, sort_order) VALUES
(1,  'assets/product-1.jpg', 1, 1),
(2,  'assets/product-2.jpg', 1, 1),
(3,  'assets/product-3.jpg', 1, 1),
(4,  'assets/product-4.jpg', 1, 1),
(5,  'assets/product-5.jpg', 1, 1),
(6,  'assets/product-1.jpg', 1, 1),
(7,  'assets/product-2.jpg', 1, 1),
(8,  'assets/product-3.jpg', 1, 1),
(9,  'assets/product-4.jpg', 1, 1),
(10, 'assets/product-5.jpg', 1, 1),
(11, 'assets/product-1.jpg', 1, 1),
(12, 'assets/product-2.jpg', 1, 1),
(13, 'assets/product-3.jpg', 1, 1),
(14, 'assets/product-4.jpg', 1, 1),
(15, 'assets/product-5.jpg', 1, 1),
(16, 'assets/product-1.jpg', 1, 1),
-- Blouses
(17, 'assets/product-2.jpg', 1, 1),
(18, 'assets/product-3.jpg', 1, 1),
(19, 'assets/product-4.jpg', 1, 1),
(20, 'assets/product-5.jpg', 1, 1),
(21, 'assets/product-1.jpg', 1, 1),
(22, 'assets/product-2.jpg', 1, 1),
-- Suit Sets
(23, 'assets/product-3.jpg', 1, 1),
(24, 'assets/product-4.jpg', 1, 1),
(25, 'assets/product-5.jpg', 1, 1),
(26, 'assets/product-1.jpg', 1, 1),
(27, 'assets/product-2.jpg', 1, 1);

-- Additional images for top products
INSERT INTO product_images (product_id, image_path, is_primary, sort_order) VALUES
(1, 'assets/product-2.jpg', 0, 2),
(1, 'assets/product-3.jpg', 0, 3),
(2, 'assets/product-1.jpg', 0, 2),
(4, 'assets/product-5.jpg', 0, 2),
(9, 'assets/product-2.jpg', 0, 2),
(14,'assets/product-1.jpg', 0, 2),
(15,'assets/product-3.jpg', 0, 2);

-- ============================================================
-- SAMPLE REVIEWS (approved)
-- ============================================================
INSERT INTO reviews (name, email, rating, message, status) VALUES
('Priya Sharma',    'priya@example.com',    5, 'Absolutely stunning Kanjivaram saree! The quality is outstanding and delivery was prompt. Will definitely buy again.', 'approved'),
('Ananya Reddy',    'ananya@example.com',   5, 'The Banarasi silk saree I ordered exceeded my expectations. The zari work is impeccable. Perfect for my sister''s wedding!', 'approved'),
('Meena Patel',     'meena@example.com',    4, 'Beautiful saree, great packaging. The colour was exactly as shown. Very happy with my purchase.', 'approved'),
('Sunita Iyer',     'sunita@example.com',   5, 'I ordered the bridal Kanjivaram and it was breathtaking. My whole family loved it at the wedding!', 'approved'),
('Deepa Nair',      'deepa@example.com',    4, 'Lovely suit set, great stitching quality. The fabric is comfortable and the embroidery is beautiful.', 'approved'),
('Kavitha Kumar',   'kavitha@example.com',  5, 'Best saree store online! The organza saree is so elegant. I get compliments every time I wear it.', 'approved'),
('Lakshmi Devi',    'lakshmi@example.com',  5, 'The blouse work is amazing. Perfect fit and the zari is very high quality. Highly recommended!', 'approved'),
('Revathi Menon',   'revathi@example.com',  4, 'Good quality saree. Packaging was excellent, arrived safely. Slight delay in delivery but worth the wait.', 'approved');

-- ============================================================
-- SLIDE CARDS (ticker banner)
-- ============================================================
INSERT INTO slide_cards (content, icon, is_active, order_index) VALUES
('Free Shipping on Orders Above ₹999',            '🚚', 1, 1),
('Authentic Handwoven Sarees — Direct from Weavers', '✨', 1, 2),
('New Arrivals Every Week — Shop the Latest Collection', '🎁', 1, 3),
('Easy 7-Day Returns & Exchange Policy',           '🔄', 1, 4),
('Secure Payments — UPI, Cards, COD Available',    '🔒', 1, 5);

-- ============================================================
-- SERVICE CATEGORIES (homepage services grid)
-- ============================================================
INSERT INTO service_categories (title, image_url, link_url, tag, display_order, is_active) VALUES
('Kanjivaram Sarees',  'assets/category-sarees.jpg',  '/collections/kanjivaram',  'Trending',   1, 1),
('Designer Blouses',   'assets/category-blouses.png', '/collections/blouses',     'New',        2, 1),
('Suit Sets',          'assets/category-suits.jpg',   '/collections/suit-sets',   'Popular',    3, 1),
('Bridal Collection',  'assets/product-4.jpg',        '/collections/bridal',      'Exclusive',  4, 1),
('New Arrivals',       'assets/new-arrivals-hero.jpg', '/new-arrivals',            'Fresh',      5, 1),
('Sale',               'assets/festive_sale_banner.png', '/collections/sale',     'Up to 40% Off', 6, 1);

-- ============================================================
-- SETTINGS — update public notice
-- ============================================================
INSERT INTO settings (setting_key, setting_value) VALUES
('store_name',          'Luxe Haven Boutique'),
('support_email',       'support@luxehaven.com'),
('public_notice',       '🎉 Free Shipping on Orders Above ₹999 | New Kanjivaram Collection Now Live!'),
('tax_rate',            '12'),
('maintenance_mode',    '0'),
('low_stock_threshold', '10')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- ============================================================
-- Confirmation
-- ============================================================
SELECT CONCAT('Products: ', COUNT(*)) AS summary FROM products
UNION ALL SELECT CONCAT('Colours: ', COUNT(*)) FROM master_colours
UNION ALL SELECT CONCAT('Fabrics: ', COUNT(*)) FROM master_fabric_types
UNION ALL SELECT CONCAT('Blouse Styles: ', COUNT(*)) FROM blouse_styles
UNION ALL SELECT CONCAT('Sub Categories: ', COUNT(*)) FROM master_sub_categories
UNION ALL SELECT CONCAT('Product Images: ', COUNT(*)) FROM product_images
UNION ALL SELECT CONCAT('Reviews: ', COUNT(*)) FROM reviews
UNION ALL SELECT CONCAT('Slide Cards: ', COUNT(*)) FROM slide_cards
UNION ALL SELECT CONCAT('Service Categories: ', COUNT(*)) FROM service_categories;
