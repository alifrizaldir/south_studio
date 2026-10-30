-- ==============================================================================
-- SOUTH HAIR STUDIO - DATABASE SCHEMA (MYSQL / MARIADB)
-- Barbershop Presisi & Gaya Matang • Kota Palopo
-- Generated for Production & Local Development (cPanel, phpMyAdmin, Laragon, XAMPP)
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. STUDIOS (Profil & Pengaturan Toko)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `studios`;
CREATE TABLE `studios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL DEFAULT 'South Hair Studio',
  `tagline` VARCHAR(255) DEFAULT 'Fresh Cuts Only On The South Side',
  `city` VARCHAR(100) NOT NULL DEFAULT 'Kota Palopo',
  `address` TEXT NOT NULL,
  `phone` VARCHAR(20) NOT NULL DEFAULT '082259972253',
  `whatsapp` VARCHAR(20) NOT NULL DEFAULT '6282259972253',
  `instagram` VARCHAR(50) DEFAULT '@south.hairstudio',
  `google_maps_url` TEXT,
  `open_time` TIME NOT NULL DEFAULT '10:00:00',
  `close_time` TIME NOT NULL DEFAULT '22:00:00',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. USERS (Autentikasi Admin, Kasir, & Capster)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('superadmin', 'admin', 'cashier', 'barber') NOT NULL DEFAULT 'cashier',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. CAPSTERS (Tim Barber South Hair Studio)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `capsters`;
CREATE TABLE `capsters` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `slug` VARCHAR(50) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role_title` VARCHAR(100) NOT NULL,
  `badge` VARCHAR(50) NOT NULL,
  `bio` TEXT,
  `photo_url` VARCHAR(255) NOT NULL,
  `booking_value` VARCHAR(50) NOT NULL,
  `rating` DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  `cuts_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('active', 'off_duty', 'inactive') NOT NULL DEFAULT 'active',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_capsters_slug` (`slug`),
  UNIQUE KEY `idx_capsters_booking_value` (`booking_value`),
  CONSTRAINT `fk_capsters_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. CAPSTER_SCHEDULES (Jadwal Shift Mingguan Capster)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `capster_schedules`;
CREATE TABLE `capster_schedules` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `capster_id` INT UNSIGNED NOT NULL,
  `day_of_week` TINYINT UNSIGNED NOT NULL COMMENT '0=Minggu, 1=Senin, ..., 6=Sabtu',
  `start_time` TIME NOT NULL DEFAULT '10:00:00',
  `end_time` TIME NOT NULL DEFAULT '22:00:00',
  `is_day_off` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_capster_day` (`capster_id`, `day_of_week`),
  CONSTRAINT `fk_schedule_capster` FOREIGN KEY (`capster_id`) REFERENCES `capsters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. SERVICE_CATEGORIES (Kategori Layanan)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `service_categories`;
CREATE TABLE `service_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_service_cat_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. SERVICES (Katalog Layanan & Tarif Barbershop)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_services_slug` (`slug`),
  KEY `idx_services_category` (`category_id`),
  CONSTRAINT `fk_services_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. CUSTOMERS (Data Master Pelanggan)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `total_bookings` INT UNSIGNED NOT NULL DEFAULT 0,
  `last_visit_at` DATETIME DEFAULT NULL,
  `notes` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_customers_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. BOOKINGS (Transaksi Reservasi Kursi / Antrian)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_code` VARCHAR(30) NOT NULL,
  `customer_id` INT UNSIGNED DEFAULT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(20) NOT NULL,
  `service_id` INT UNSIGNED NOT NULL,
  `capster_id` INT UNSIGNED NOT NULL,
  `booking_date` DATE NOT NULL,
  `booking_time` TIME NOT NULL,
  `service_price` DECIMAL(10,2) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `notes` TEXT,
  `whatsapp_notified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_bookings_code` (`booking_code`),
  KEY `idx_bookings_date_capster` (`booking_date`, `capster_id`),
  KEY `idx_bookings_customer` (`customer_id`),
  CONSTRAINT `fk_bookings_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bookings_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_bookings_capster` FOREIGN KEY (`capster_id`) REFERENCES `capsters` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. PRODUCT_CATEGORIES (Kategori Produk Grooming)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `product_categories`;
CREATE TABLE `product_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_prod_cat_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. PRODUCTS (Katalog Produk Retail Grooming)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `badge` VARCHAR(50) DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `weight_volume` VARCHAR(50) DEFAULT NULL,
  `short_desc` TEXT,
  `full_desc` TEXT,
  `benefits` TEXT COMMENT 'JSON or newline-separated points',
  `how_to_use` TEXT,
  `ingredients` TEXT,
  `image_url` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_products_slug` (`slug`),
  KEY `idx_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. PRODUCT_ORDERS (Pesanan Produk)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `product_orders`;
CREATE TABLE `product_orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_code` VARCHAR(30) NOT NULL,
  `customer_id` INT UNSIGNED DEFAULT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(20) NOT NULL,
  `delivery_type` ENUM('pickup_studio', 'delivery_palopo') NOT NULL DEFAULT 'pickup_studio',
  `delivery_address` TEXT,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `notes` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_product_orders_code` (`order_code`),
  KEY `idx_orders_customer` (`customer_id`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. PRODUCT_ORDER_ITEMS (Rincian Produk dalam Pesanan)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `product_order_items`;
CREATE TABLE `product_order_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `product_name` VARCHAR(100) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`) REFERENCES `product_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 13. GALLERY (Portofolio Model Potongan Rambut)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `gallery`;
CREATE TABLE `gallery` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `capster_id` INT UNSIGNED DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `likes_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gallery_capster` (`capster_id`),
  CONSTRAINT `fk_gallery_capster` FOREIGN KEY (`capster_id`) REFERENCES `capsters` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 14. REVIEWS (Ulasan & Rating dari Pelanggan)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `booking_id` INT UNSIGNED DEFAULT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `review_text` TEXT NOT NULL,
  `capster_id` INT UNSIGNED DEFAULT NULL,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `is_displayed` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_capster` (`capster_id`),
  CONSTRAINT `fk_reviews_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reviews_capster` FOREIGN KEY (`capster_id`) REFERENCES `capsters` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- INITIAL SEED DATA (DATA AWAL LENGKAP SOUTH HAIR STUDIO)
-- ==============================================================================

-- 1. STUDIOS
INSERT INTO `studios` (`id`, `name`, `tagline`, `city`, `address`, `phone`, `whatsapp`, `instagram`, `google_maps_url`, `open_time`, `close_time`, `is_active`)
VALUES (1, 'South Hair Studio', 'Fresh Cuts Only On The South Side', 'Kota Palopo', 'Jl. Andi Kambo, Surutanga, Wara Timur, Kota Palopo, Sulawesi Selatan 91921', '082259972253', '6282259972253', '@south.hairstudio', 'https://maps.app.goo.gl/94k2EaZfxvU1T9eT7', '10:00:00', '22:00:00', 1);

-- 2. USERS
-- Default admin & kasir (password: 'admin123' / 'kasir123')
INSERT INTO `users` (`id`, `username`, `password_hash`, `full_name`, `role`, `is_active`)
VALUES 
(1, 'superadmin', '$2y$10$wK10Rj7aX9uF2o1xWn8MWeZ9l7y7Ocb6u6yTqZ.6Jk8Uf.Q6rZJvO', 'Kak Ikmal (Owner)', 'superadmin', 1),
(2, 'kasir', '$2y$10$eE0m7aX9uF2o1xWn8MWeZ9l7y7Ocb6u6yTqZ.6Jk8Uf.Q6rZJvO', 'Front Desk Kasir', 'cashier', 1);

-- 3. CAPSTERS
INSERT INTO `capsters` (`id`, `user_id`, `slug`, `name`, `full_name`, `role_title`, `badge`, `bio`, `photo_url`, `booking_value`, `rating`, `cuts_count`, `status`, `display_order`)
VALUES 
(1, 1, 'ikmal', 'Ikmal', 'Muhammad Ikmal', 'Founder & Master Barber', 'FOUNDER & MASTER', 'Pendiri South Hair Studio, spesialis konsultasi bentuk wajah, perming korea, dan pewarnaan rambut.', 'assets/capster_south/ikmal.png', 'ikmal', 5.0, 1420, 'active', 1),
(2, NULL, 'abi', 'Abi', 'Abi Pratama', 'Senior Barber', 'CLASSIC & MODERN', 'Ahli potongan rambut klasik rapi, executive taper, dan fade presisi tinggi.', 'assets/capster_south/abi.png', 'abi', 4.9, 980, 'active', 2),
(3, NULL, 'rezky', 'Rezky', 'Rezky Kurniawan', 'Creative Barber', 'TEXTURE & FADE', 'Spesialis French crop bertekstur, mullet modern, dan freestyle line.', 'assets/capster_south/rezky.png', 'rezky', 4.9, 850, 'active', 3);

-- 4. CAPSTER_SCHEDULES (Setiap hari buka 10:00 - 22:00 WITA)
INSERT INTO `capster_schedules` (`capster_id`, `day_of_week`, `start_time`, `end_time`, `is_day_off`)
VALUES
(1, 0, '10:00:00', '22:00:00', 0), (1, 1, '10:00:00', '22:00:00', 0), (1, 2, '10:00:00', '22:00:00', 0),
(1, 3, '10:00:00', '22:00:00', 0), (1, 4, '10:00:00', '22:00:00', 0), (1, 5, '10:00:00', '22:00:00', 0), (1, 6, '10:00:00', '22:00:00', 0),
(2, 0, '10:00:00', '22:00:00', 0), (2, 1, '10:00:00', '22:00:00', 0), (2, 2, '10:00:00', '22:00:00', 0),
(2, 3, '10:00:00', '22:00:00', 0), (2, 4, '10:00:00', '22:00:00', 0), (2, 5, '10:00:00', '22:00:00', 0), (2, 6, '10:00:00', '22:00:00', 0),
(3, 0, '10:00:00', '22:00:00', 0), (3, 1, '10:00:00', '22:00:00', 0), (3, 2, '10:00:00', '22:00:00', 0),
(3, 3, '10:00:00', '22:00:00', 0), (3, 4, '10:00:00', '22:00:00', 0), (3, 5, '10:00:00', '22:00:00', 0), (3, 6, '10:00:00', '22:00:00', 0);

-- 5. SERVICE_CATEGORIES
INSERT INTO `service_categories` (`id`, `slug`, `name`, `description`, `display_order`)
VALUES
(1, 'haircut', 'Hair Cut & Styling', 'Potongan rambut presisi, fade, dan konsultasi bentuk wajah', 1),
(2, 'coloring', 'Hair Coloring', 'Pewarnaan rambut berkelas pria dari highlight hingga full tone', 2),
(3, 'perming', 'Perming & Texture', 'Pengeritingan Korea (wavy texture) dan penjinak rambut kembang', 3);

-- 6. SERVICES
INSERT INTO `services` (`id`, `category_id`, `slug`, `name`, `description`, `price`, `image_url`, `is_featured`, `is_active`, `display_order`)
VALUES
(1, 1, 'hair-cut', 'Hair Cut', 'Potongan rambut presisi sesuai bentuk kepala dan karakter rambut.', 40000.00, 'assets/layanan_south/hair_cut.png', 1, 1, 1),
(2, 2, 'highlight-color', 'Highlight Color', 'Aksen warna dimensi berkelas untuk mempertajam tekstur rambut pria.', 150000.00, 'assets/layanan_south/highlight_color.png', 0, 1, 2),
(3, 2, 'full-color', 'Full Color', 'Pewarnaan rambut menyeluruh dengan pilihan tone natural hingga bold modern.', 130000.00, 'assets/layanan_south/full_color.png', 0, 1, 3),
(4, 3, 'perming', 'Perming', 'Pengeritingan rambut gaya Korea / wavier look yang awet berbulan-bulan.', 180000.00, 'assets/layanan_south/perming.png', 1, 1, 4),
(5, 3, 'down-perm', 'Down Perm', 'Penjinak rambut kaku mengembang di samping agar rapi dan mudah diatur.', 75000.00, 'assets/layanan_south/down_perm.png', 0, 1, 5);

-- 7. PRODUCT_CATEGORIES
INSERT INTO `product_categories` (`id`, `slug`, `name`, `display_order`)
VALUES
(1, 'pomade', 'Pomade & Clay', 1),
(2, 'powder', 'Hair Powder', 2),
(3, 'kurl-cream', 'Kurl Cream & Perm Care', 3);

-- 8. PRODUCTS
INSERT INTO `products` (`id`, `category_id`, `slug`, `name`, `badge`, `price`, `stock`, `weight_volume`, `short_desc`, `full_desc`, `benefits`, `how_to_use`, `ingredients`, `image_url`, `is_active`, `display_order`)
VALUES
(1, 1, 'matte-clay-pomade', 'Matte Clay Pomade', 'BEST SELLER', 85000.00, 24, '100 gr', 
 'Formula waterbased dengan daya rekat super kuat dan aroma bubblegum segar yang digemari pelanggan South Hair Studio.',
 'Formula waterbased dengan daya rekat super kuat dan aroma bubblegum segar yang digemari pelanggan South Hair Studio. Memberikan kontrol penuh pada tatanan rambut formal maupun kasual, mudah dibilas hanya dengan sekali bilasan air tanpa sisa residu lengket.',
 'Daya rekat kuat (Heavy Hold 4/5)\nHasil akhir natural matte tanpa kilau berminyak (Zero Shine)\nMudah dibilas air (Water Soluble)\nAroma bubblegum segar maskulin tahan seharian\nCocok untuk gaya Pompadour, Side Part, dan Crop',
 'Ambil produk secukupnya seujung jari, ratakan di telapak tangan hingga hangat, lalu usapkan merata pada rambut setengah kering atau kering. Bentuk dengan sisir bergigi rapat untuk gaya klasik, atau sisir jari untuk tekstur alami.',
 'Water (Aqua), Beeswax, Bentonite Clay, Kaolin, Ceteareth-25, PEG-7 Glyceryl Cocoate, Fragrance (Bubblegum Essence), Phenoxyethanol.',
 'assets/produk_south/pomade_clay.jpeg', 1, 1),

(2, 2, 'texture-hair-powder', 'Texture Hair Powder', 'TRENDING 2026', 65000.00, 35, '10 gr',
 'Serbuk penata rambut ultra-ringan dengan hasil matte alami instan. Mengangkat volume akar rambut tanpa rasa lengket atau berat.',
 'Serbuk penata rambut ultra-ringan dengan hasil matte alami instan. Mengangkat volume akar rambut tanpa rasa lengket atau berat, solusi sempurna bagi rambut tipis atau gaya crop dan messy fringe di iklim tropis Palopo.',
 'Instan volume & tebal alami seketika\nHasil 100% matte natural tanpa residu putih\nMenyerap minyak berlebih di kulit kepala\nDapat di-restyle berkali-kali sepanjang hari dengan jari tangan\nSangat ringan, tidak membuat rambut lepek saat berkeringat',
 'Pastikan rambut dalam kondisi 100% kering. Taburkan secukupnya di area akar rambut atau sela-sela rambut dari jarak 10-15 cm, kemudian acak dan bentuk menggunakan jari tangan sesuai volume yang diinginkan.',
 'Silica Silylate, Aqua, VP/VA Copolymer, Sodium Benzoate, Citric Acid.',
 'assets/produk_south/powder.jpeg', 1, 2),

(3, 3, 'kurl-defining-cream', 'Kurl Defining Cream', 'NEW FORMULA', 95000.00, 18, '150 ml',
 'Krim perawatan dan styling khusus rambut ikal, keriting, maupun hasil perming / downperm di South Hair Studio.',
 'Krim perawatan dan styling khusus rambut ikal, keriting, maupun hasil perming / downperm di South Hair Studio. Diperkaya Hydrolyzed Collagen, Shea Butter, dan Olive Oil untuk mengunci kelembapan alami, mendefinisikan gelombang rambut agar elastis (bouncy), dan menghilangkan rambut kembang mengembang kusut.',
 'Mengunci bentuk ikal / curly tetap rapi dan tidak megar kembang\nMelembapkan batang rambut pasca proses kimia pengeritingan\nMemberikan kilau sehat (Natural Satin Finish) tanpa rasa kaku\nMelindungi rambut dari panas hairdryer dan paparan UV\nMengurangi frizzy / rambut bercabang hingga 48 jam',
 'Gunakan pada rambut lembap sehabis keramas. Pompa 1-2 tetes ke telapak tangan, ratakan dari tengah hingga ujung helai rambut dengan teknik meremas ke atas (scrunching), lalu biarkan kering alami atau blow-dry menggunakan diffuser.',
 'Aqua, Cetearyl Alcohol, Butyrospermum Parkii (Shea) Butter, Olea Europaea (Olive) Fruit Oil, Hydrolyzed Collagen, Argania Spinosa Kernel Oil, Panthenol, Tocopheryl Acetate (Vitamin E), Fragrance.',
 'assets/produk_south/curly.jpeg', 1, 3);

-- 9. GALLERY
INSERT INTO `gallery` (`id`, `title`, `category`, `image_url`, `capster_id`, `description`, `likes_count`, `is_active`, `display_order`)
VALUES
(1, 'WARRIORCUT', 'Signature Cut', 'assets/galeri_south/Image (Warriorcut).png', 1, 'Potongan presisi tegas bergaya warrior', 128, 1, 1),
(2, 'FRINGE', 'Korean Style', 'assets/galeri_south/Image (fringe)-2.png', 2, 'Gaya poni modern dengan tekstur ikal lembut', 95, 1, 2),
(3, 'TEXTURE', 'Textured Cut', 'assets/galeri_south/Image (Texture).png', 3, 'Tekstur acak dinamis bervolume tinggi', 142, 1, 3),
(4, 'FADE', 'Classic Fade', 'assets/galeri_south/Image (Fade).png', 2, 'Gradasi kulit halus super bersih dan rapi', 110, 1, 4),
(5, 'TAPER, TAPER FADE, TEMPLE TAPER', 'Taper Fade', 'assets/galeri_south/Image (Taper, Taper Fade, Temple Taper).png', 1, 'Transisi taper rapi di pelipis dan tengkuk leher', 88, 1, 5),
(6, 'FRINGE 2', 'Modern Fringe', 'assets/galeri_south/Image (fringe)-1.png', 1, 'Spiky textured fringe dengan siluet tajam modern', 76, 1, 6),
(7, 'FRINGE 3', 'Casual Fringe', 'assets/galeri_south/Image (fringe).png', 3, 'Forward crop fringe santai dengan gradasi samping rapi', 119, 1, 7),
(8, 'MULLET', 'Modern Mullet', 'assets/galeri_south/Image (mullet).png', 3, 'Modern mullet berpadu clean taper stylish', 165, 1, 8);

-- 10. REVIEWS (Ulasan Pelanggan Palopo)
INSERT INTO `reviews` (`id`, `customer_name`, `rating`, `review_text`, `capster_id`, `is_verified`, `is_displayed`)
VALUES
(1, 'Andi Tenri', 5, 'Potongan Kak Ikmal selalu presisi dan rapi, barbershop terbaik di Palopo!', 1, 1, 1),
(2, 'Rahmat Hidayat', 5, 'Fade sama Kak Abi bersih banget, kursinya nyaman dan tempatnya dingin.', 2, 1, 1),
(3, 'Fajar Pratama', 5, 'Down perm-nya tahan lama dan rambut gak kaku lagi. Produk powdernya juga mantap!', 1, 1, 1),
(4, 'Dimas Arya', 5, 'French crop sama Rezky hasilnya keren parah, rapi dan teliti banget.', 3, 1, 1);
