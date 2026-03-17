CREATE TABLE IF NOT EXISTS `blouse_styles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `image` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `blouse_styles` (`name`, `description`, `image`, `price`, `category`, `status`) VALUES
('V-Neck Floral Embroidered Blouse', 'Exquisite hand-embroidered floral patterns on premium raw silk. Features a deep V-neckline.', 'uploads/blouse/b1.jpg', 2499.00, 'Handmade', 1),
('Gold Zari Brocade Blouse', 'Traditional festive blouse with heavy gold zari work and designer back tassel.', 'uploads/blouse/b2.jpg', 3200.00, 'Festive', 1),
('Mirror Work Sleeveless Blouse', 'Contemporary chic sleeveless blouse adorned with authentic mirrors and thread work.', 'uploads/blouse/b3.jpg', 1850.00, 'Contemporary', 1),
('High Neck Velvet Blouse', 'Luxurious velvet blouse with high neck and intricate sleeve detailing for a regal look.', 'uploads/blouse/b4.jpg', 4500.00, 'Luxury', 1),
('Cotton Hand Block Print Blouse', 'Breathable cotton blouse with traditional hand block prints, perfect for casual ethnic wear.', 'uploads/blouse/b5.jpg', 950.00, 'Basic', 1);
