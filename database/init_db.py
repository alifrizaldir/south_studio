"""
South Hair Studio - Database Initializer & Seeder
Creates and seeds database/south_hair_studio.db (SQLite)
Run with: python database/init_db.py
"""

import os
import sqlite3
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "south_hair_studio.db")

def init_database():
    print(f"[*] Initializing database at: {DB_PATH}")

    # Remove existing DB if needed for clean re-seed
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
            print("[+] Removed old database file for clean rebuild.")
        except Exception as e:
            print(f"[!] Warning removing old db: {e}")

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    cursor = conn.cursor()

    # 1. STUDIOS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS studios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL DEFAULT 'South Hair Studio',
        tagline TEXT DEFAULT 'Fresh Cuts Only On The South Side',
        city TEXT NOT NULL DEFAULT 'Kota Palopo',
        address TEXT NOT NULL,
        phone TEXT NOT NULL DEFAULT '082259972253',
        whatsapp TEXT NOT NULL DEFAULT '6282259972253',
        instagram TEXT DEFAULT '@south.hairstudio',
        google_maps_url TEXT,
        open_time TEXT NOT NULL DEFAULT '10:00:00',
        close_time TEXT NOT NULL DEFAULT '22:00:00',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
    """)

    # 2. USERS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT CHECK(role IN ('superadmin', 'admin', 'cashier', 'barber')) NOT NULL DEFAULT 'cashier',
        is_active INTEGER NOT NULL DEFAULT 1,
        last_login_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
    """)

    # 3. CAPSTERS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS capsters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role_title TEXT NOT NULL,
        badge TEXT NOT NULL,
        bio TEXT,
        photo_url TEXT NOT NULL,
        booking_value TEXT NOT NULL UNIQUE,
        rating REAL NOT NULL DEFAULT 5.0,
        cuts_count INTEGER NOT NULL DEFAULT 0,
        status TEXT CHECK(status IN ('active', 'off_duty', 'inactive')) NOT NULL DEFAULT 'active',
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );
    """)

    # 4. CAPSTER_SCHEDULES
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS capster_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        capster_id INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
        start_time TEXT NOT NULL DEFAULT '10:00:00',
        end_time TEXT NOT NULL DEFAULT '22:00:00',
        is_day_off INTEGER NOT NULL DEFAULT 0,
        UNIQUE(capster_id, day_of_week),
        FOREIGN KEY (capster_id) REFERENCES capsters (id) ON DELETE CASCADE
    );
    """)

    # 5. SERVICE_CATEGORIES
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS service_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        display_order INTEGER NOT NULL DEFAULT 0
    );
    """)

    # 6. SERVICES
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image_url TEXT,
        is_featured INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (category_id) REFERENCES service_categories (id) ON DELETE CASCADE
    );
    """)

    # 7. CUSTOMERS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        email TEXT,
        total_bookings INTEGER NOT NULL DEFAULT 0,
        last_visit_at TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
    """)

    # 8. BOOKINGS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_code TEXT NOT NULL UNIQUE,
        customer_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        service_id INTEGER NOT NULL,
        capster_id INTEGER NOT NULL,
        booking_date TEXT NOT NULL,
        booking_time TEXT NOT NULL,
        service_price REAL NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT CHECK(status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) NOT NULL DEFAULT 'pending',
        notes TEXT,
        whatsapp_notified INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL,
        FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE RESTRICT,
        FOREIGN KEY (capster_id) REFERENCES capsters (id) ON DELETE RESTRICT
    );
    """)

    # 9. PRODUCT_CATEGORIES
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS product_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0
    );
    """)

    # 10. PRODUCTS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        badge TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        weight_volume TEXT,
        short_desc TEXT,
        full_desc TEXT,
        benefits TEXT,
        how_to_use TEXT,
        ingredients TEXT,
        image_url TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (category_id) REFERENCES product_categories (id) ON DELETE CASCADE
    );
    """)

    # 11. PRODUCT_ORDERS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS product_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_code TEXT NOT NULL UNIQUE,
        customer_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        delivery_type TEXT CHECK(delivery_type IN ('pickup_studio', 'delivery_palopo')) NOT NULL DEFAULT 'pickup_studio',
        delivery_address TEXT,
        subtotal REAL NOT NULL,
        delivery_fee REAL NOT NULL DEFAULT 0.0,
        total_amount REAL NOT NULL,
        status TEXT CHECK(status IN ('pending', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled')) NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL
    );
    """)

    # 12. PRODUCT_ORDER_ITEMS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS product_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        unit_price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        subtotal REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES product_orders (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
    );
    """)

    # 13. GALLERY
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT NOT NULL,
        capster_id INTEGER,
        description TEXT,
        likes_count INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (capster_id) REFERENCES capsters (id) ON DELETE SET NULL
    );
    """)

    # 14. REVIEWS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER,
        customer_name TEXT NOT NULL,
        rating INTEGER NOT NULL DEFAULT 5 CHECK(rating BETWEEN 1 AND 5),
        review_text TEXT NOT NULL,
        capster_id INTEGER,
        is_verified INTEGER NOT NULL DEFAULT 1,
        is_displayed INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE SET NULL,
        FOREIGN KEY (capster_id) REFERENCES capsters (id) ON DELETE SET NULL
    );
    """)

    print("[+] All 14 tables created successfully.")

    # --------------------------------------------------------------------------
    # SEEDING INITIAL DATA
    # --------------------------------------------------------------------------

    # 1. Studio
    cursor.execute("""
    INSERT INTO studios (id, name, tagline, city, address, phone, whatsapp, instagram, google_maps_url, open_time, close_time, is_active)
    VALUES (1, 'South Hair Studio', 'Fresh Cuts Only On The South Side', 'Kota Palopo', 
            'Jl. Andi Kambo, Surutanga, Wara Timur, Kota Palopo, Sulawesi Selatan 91921',
            '082259972253', '6282259972253', '@south.hairstudio', 'https://maps.app.goo.gl/94k2EaZfxvU1T9eT7',
            '10:00:00', '22:00:00', 1);
    """)

    # 2. Users (Admin & Kasir)
    cursor.execute("""
    INSERT INTO users (id, username, password_hash, full_name, role, is_active)
    VALUES 
    (1, 'superadmin', '$2y$10$wK10Rj7aX9uF2o1xWn8MWeZ9l7y7Ocb6u6yTqZ.6Jk8Uf.Q6rZJvO', 'Kak Ikmal (Owner)', 'superadmin', 1),
    (2, 'kasir', '$2y$10$eE0m7aX9uF2o1xWn8MWeZ9l7y7Ocb6u6yTqZ.6Jk8Uf.Q6rZJvO', 'Front Desk Kasir', 'cashier', 1);
    """)

    # 3. Capsters
    capsters = [
        (1, 1, 'ikmal', 'Ikmal', 'Muhammad Ikmal', 'Founder & Master Barber', 'FOUNDER & MASTER',
         'Pendiri South Hair Studio, spesialis konsultasi bentuk wajah, perming korea, dan pewarnaan rambut.',
         'assets/capster_south/ikmal.png', 'ikmal', 5.0, 1420, 'active', 1),
        (2, None, 'abi', 'Abi', 'Abi Pratama', 'Senior Barber', 'CLASSIC & MODERN',
         'Ahli potongan rambut klasik rapi, executive taper, dan fade presisi tinggi.',
         'assets/capster_south/abi.png', 'abi', 4.9, 980, 'active', 2),
        (3, None, 'rezky', 'Rezky', 'Rezky Kurniawan', 'Creative Barber', 'TEXTURE & FADE',
         'Spesialis French crop bertekstur, mullet modern, dan freestyle line.',
         'assets/capster_south/rezky.png', 'rezky', 4.9, 850, 'active', 3)
    ]
    cursor.executemany("""
    INSERT INTO capsters (id, user_id, slug, name, full_name, role_title, badge, bio, photo_url, booking_value, rating, cuts_count, status, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, capsters)

    # 4. Capster Schedules (Daily 10:00 - 22:00)
    for cap_id in [1, 2, 3]:
        for day in range(7):
            cursor.execute("""
            INSERT INTO capster_schedules (capster_id, day_of_week, start_time, end_time, is_day_off)
            VALUES (?, ?, '10:00:00', '22:00:00', 0);
            """, (cap_id, day))

    # 5. Service Categories
    categories = [
        (1, 'haircut', 'Hair Cut & Styling', 'Potongan rambut presisi, fade, dan konsultasi bentuk wajah', 1),
        (2, 'coloring', 'Hair Coloring', 'Pewarnaan rambut berkelas pria dari highlight hingga full tone', 2),
        (3, 'perming', 'Perming & Texture', 'Pengeritingan Korea (wavy texture) dan penjinak rambut kembang', 3)
    ]
    cursor.executemany("INSERT INTO service_categories VALUES (?, ?, ?, ?, ?);", categories)

    # 6. Services
    services = [
        (1, 1, 'hair-cut', 'Hair Cut', 'Potongan rambut presisi sesuai bentuk kepala dan karakter rambut.', 40000.0, 'assets/layanan_south/hair_cut.png', 1, 1, 1),
        (2, 2, 'highlight-color', 'Highlight Color', 'Aksen warna dimensi berkelas untuk mempertajam tekstur rambut pria.', 150000.0, 'assets/layanan_south/highlight_color.png', 0, 1, 2),
        (3, 2, 'full-color', 'Full Color', 'Pewarnaan rambut menyeluruh dengan pilihan tone natural hingga bold modern.', 130000.0, 'assets/layanan_south/full_color.png', 0, 1, 3),
        (4, 3, 'perming', 'Perming', 'Pengeritingan rambut gaya Korea / wavier look yang awet berbulan-bulan.', 180000.0, 'assets/layanan_south/perming.png', 1, 1, 4),
        (5, 3, 'down-perm', 'Down Perm', 'Penjinak rambut kaku mengembang di samping agar rapi dan mudah diatur.', 75000.0, 'assets/layanan_south/down_perm.png', 0, 1, 5)
    ]
    cursor.executemany("""
    INSERT INTO services (id, category_id, slug, name, description, price, image_url, is_featured, is_active, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, services)

    # 7. Product Categories
    prod_cats = [
        (1, 'pomade', 'Pomade & Clay', 1),
        (2, 'powder', 'Hair Powder', 2),
        (3, 'kurl-cream', 'Kurl Cream & Perm Care', 3)
    ]
    cursor.executemany("INSERT INTO product_categories VALUES (?, ?, ?, ?);", prod_cats)

    # 8. Products
    products = [
        (1, 1, 'matte-clay-pomade', 'Matte Clay Pomade', 'BEST SELLER', 85000.0, 24, '100 gr',
         'Formula waterbased dengan daya rekat super kuat dan aroma bubblegum segar yang digemari pelanggan South Hair Studio.',
         'Formula waterbased dengan daya rekat super kuat dan aroma bubblegum segar yang digemari pelanggan South Hair Studio. Memberikan kontrol penuh pada tatanan rambut formal maupun kasual, mudah dibilas hanya dengan sekali bilasan air tanpa sisa residu lengket.',
         'Daya rekat kuat (Heavy Hold 4/5)\nHasil akhir natural matte tanpa kilau berminyak (Zero Shine)\nMudah dibilas air (Water Soluble)\nAroma bubblegum segar maskulin tahan seharian\nCocok untuk gaya Pompadour, Side Part, dan Crop',
         'Ambil produk secukupnya seujung jari, ratakan di telapak tangan hingga hangat, lalu usapkan merata pada rambut setengah kering atau kering. Bentuk dengan sisir bergigi rapat untuk gaya klasik, atau sisir jari untuk tekstur alami.',
         'Water (Aqua), Beeswax, Bentonite Clay, Kaolin, Ceteareth-25, PEG-7 Glyceryl Cocoate, Fragrance (Bubblegum Essence), Phenoxyethanol.',
         'assets/produk_south/pomade_clay.jpeg', 1, 1),

        (2, 2, 'texture-hair-powder', 'Texture Hair Powder', 'TRENDING 2026', 65000.0, 35, '10 gr',
         'Serbuk penata rambut ultra-ringan dengan hasil matte alami instan. Mengangkat volume akar rambut tanpa rasa lengket atau berat.',
         'Serbuk penata rambut ultra-ringan dengan hasil matte alami instan. Mengangkat volume akar rambut tanpa rasa lengket atau berat, solusi sempurna bagi rambut tipis atau gaya crop dan messy fringe di iklim tropis Palopo.',
         'Instan volume & tebal alami seketika\nHasil 100% matte natural tanpa residu putih\nMenyerap minyak berlebih di kulit kepala\nDapat di-restyle berkali-kali sepanjang hari dengan jari tangan\nSangat ringan, tidak membuat rambut lepek saat berkeringat',
         'Pastikan rambut dalam kondisi 100% kering. Taburkan secukupnya di area akar rambut atau sela-sela rambut dari jarak 10-15 cm, kemudian acak dan bentuk menggunakan jari tangan sesuai volume yang diinginkan.',
         'Silica Silylate, Aqua, VP/VA Copolymer, Sodium Benzoate, Citric Acid.',
         'assets/produk_south/powder.jpeg', 1, 2),

        (3, 3, 'kurl-defining-cream', 'Kurl Defining Cream', 'NEW FORMULA', 95000.0, 18, '150 ml',
         'Krim perawatan dan styling khusus rambut ikal, keriting, maupun hasil perming / downperm di South Hair Studio.',
         'Krim perawatan dan styling khusus rambut ikal, keriting, maupun hasil perming / downperm di South Hair Studio. Diperkaya Hydrolyzed Collagen, Shea Butter, dan Olive Oil untuk mengunci kelembapan alami, mendefinisikan gelombang rambut agar elastis (bouncy), dan menghilangkan rambut kembang mengembang kusut.',
         'Mengunci bentuk ikal / curly tetap rapi dan tidak megar kembang\nMelembapkan batang rambut pasca proses kimia pengeritingan\nMemberikan kilau sehat (Natural Satin Finish) tanpa rasa kaku\nMelindungi rambut dari panas hairdryer dan paparan UV\nMengurangi frizzy / rambut bercabang hingga 48 jam',
         'Gunakan pada rambut lembap sehabis keramas. Pompa 1-2 tetes ke telapak tangan, ratakan dari tengah hingga ujung helai rambut dengan teknik meremas ke atas (scrunching), lalu biarkan kering alami atau blow-dry menggunakan diffuser.',
         'Aqua, Cetearyl Alcohol, Butyrospermum Parkii (Shea) Butter, Olea Europaea (Olive) Fruit Oil, Hydrolyzed Collagen, Argania Spinosa Kernel Oil, Panthenol, Tocopheryl Acetate (Vitamin E), Fragrance.',
         'assets/produk_south/curly.jpeg', 1, 3)
    ]
    cursor.executemany("""
    INSERT INTO products (id, category_id, slug, name, badge, price, stock, weight_volume, short_desc, full_desc, benefits, how_to_use, ingredients, image_url, is_active, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, products)

    # 9. Gallery
    gallery = [
        (1, 'WARRIORCUT', 'Signature Cut', 'assets/galeri_south/Image (Warriorcut).png', 1, 'Potongan presisi tegas bergaya warrior', 128, 1, 1),
        (2, 'FRINGE', 'Korean Style', 'assets/galeri_south/Image (fringe)-2.png', 2, 'Gaya poni modern dengan tekstur ikal lembut', 95, 1, 2),
        (3, 'TEXTURE', 'Textured Cut', 'assets/galeri_south/Image (Texture).png', 3, 'Tekstur acak dinamis bervolume tinggi', 142, 1, 3),
        (4, 'FADE', 'Classic Fade', 'assets/galeri_south/Image (Fade).png', 2, 'Gradasi kulit halus super bersih dan rapi', 110, 1, 4),
        (5, 'TAPER, TAPER FADE, TEMPLE TAPER', 'Taper Fade', 'assets/galeri_south/Image (Taper, Taper Fade, Temple Taper).png', 1, 'Transisi taper rapi di pelipis dan tengkuk leher', 88, 1, 5),
        (6, 'FRINGE 2', 'Modern Fringe', 'assets/galeri_south/Image (fringe)-1.png', 1, 'Spiky textured fringe dengan siluet tajam modern', 76, 1, 6),
        (7, 'FRINGE 3', 'Casual Fringe', 'assets/galeri_south/Image (fringe).png', 3, 'Forward crop fringe santai dengan gradasi samping rapi', 119, 1, 7),
        (8, 'MULLET', 'Modern Mullet', 'assets/galeri_south/Image (mullet).png', 3, 'Modern mullet berpadu clean taper stylish', 165, 1, 8)
    ]
    cursor.executemany("""
    INSERT INTO gallery (id, title, category, image_url, capster_id, description, likes_count, is_active, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, gallery)

    # 10. Reviews
    reviews = [
        (1, None, 'Andi Tenri', 5, 'Potongan Kak Ikmal selalu presisi dan rapi, barbershop terbaik di Palopo!', 1, 1, 1),
        (2, None, 'Rahmat Hidayat', 5, 'Fade sama Kak Abi bersih banget, kursinya nyaman dan tempatnya dingin.', 2, 1, 1),
        (3, None, 'Fajar Pratama', 5, 'Down perm-nya tahan lama dan rambut gak kaku lagi. Produk powdernya juga mantap!', 1, 1, 1),
        (4, None, 'Dimas Arya', 5, 'French crop sama Rezky hasilnya keren parah, rapi dan teliti banget.', 3, 1, 1)
    ]
    cursor.executemany("""
    INSERT INTO reviews (id, booking_id, customer_name, rating, review_text, capster_id, is_verified, is_displayed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, reviews)

    # 11. Sample Bookings & Customers (To test real relations)
    cursor.execute("""
    INSERT INTO customers (id, name, phone, email, total_bookings, last_visit_at, notes)
    VALUES (1, 'Andi Tenri', '081234567890', 'andi@gmail.com', 3, datetime('now', '-2 days'), 'Langganan Hair Cut & Perming Kak Ikmal');
    """)

    cursor.execute("""
    INSERT INTO bookings (id, booking_code, customer_id, customer_name, customer_phone, service_id, capster_id, booking_date, booking_time, service_price, total_amount, status, notes, whatsapp_notified)
    VALUES (1, 'SHS-20261025-001', 1, 'Andi Tenri', '081234567890', 1, 1, date('now'), '14:00', 40000.0, 40000.0, 'confirmed', 'Potongan rapi persiapan wisuda', 1);
    """)

    conn.commit()
    print("[+] Seeding complete! Verification test queries:")

    # Quick Verification Query
    cursor.execute("SELECT COUNT(*) FROM capsters WHERE status = 'active';")
    active_capsters = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM services WHERE is_active = 1;")
    active_services = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM products WHERE is_active = 1;")
    active_products = cursor.fetchone()[0]

    cursor.execute("""
    SELECT b.booking_code, b.customer_name, s.name as service, c.name as capster, b.booking_time, b.status
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN capsters c ON b.capster_id = c.id;
    """)
    sample_booking = cursor.fetchone()

    print(f"    - Active Capsters: {active_capsters}")
    print(f"    - Active Services: {active_services}")
    print(f"    - Active Products: {active_products}")
    print(f"    - Sample Booking Joined: {sample_booking}")

    conn.close()
    print("[v] SQLite database generated successfully at database/south_hair_studio.db")

if __name__ == "__main__":
    init_database()
