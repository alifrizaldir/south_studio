/**
 * South Hair Studio - Backend API & Web Server
 * Powered by Node.js native node:sqlite
 * Run: node server.js
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 8080;
const DB_PATH = path.join(__dirname, 'database', 'south_hair_studio.db');
const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');

// 1. Connect to SQLite database
if (!fs.existsSync(DB_PATH)) {
    console.error(`[!] Database file not found at: ${DB_PATH}`);
    console.log('[*] Running python database/init_db.py to create initial database...');
    const { execSync } = require('node:child_process');
    execSync('python database/init_db.py', { stdio: 'inherit' });
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');
console.log(`[+] Connected to SQLite database: ${DB_PATH}`);

// In-Memory Active Sessions Map
const activeSessions = new Map();

// MIME Types Map
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

// Helper: Send JSON Response
function sendJSON(res, statusCode, data) {
    const jsonStr = JSON.stringify(data);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(jsonStr),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(jsonStr);
}

// Helper: Parse JSON Body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 2 * 1024 * 1024) { // 2MB limit
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

// 2. Request Handler
const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        return res.end();
    }

    // =========================================================================
    // AUTHENTICATION API ROUTES (/api/auth/*)
    // =========================================================================

    // POST /api/auth/login
    if (method === 'POST' && pathname === '/api/auth/login') {
        try {
            const body = await parseBody(req);
            const { username, password } = body;

            if (!username || !password) {
                return sendJSON(res, 400, {
                    success: false,
                    message: 'Username dan password wajib diisi.'
                });
            }

            const cleanUser = username.trim().toLowerCase();
            const cleanPass = password.trim();

            // Check against database users
            let user = db.prepare('SELECT id, username, full_name, role, is_active FROM users WHERE LOWER(username) = ?').get(cleanUser);

            // Allow fallback aliases (e.g. 'admin' -> 'superadmin')
            if (!user && cleanUser === 'admin') {
                user = db.prepare('SELECT id, username, full_name, role, is_active FROM users WHERE username = "superadmin"').get();
            }

            // Credential verification (supports standard passwords & studio PIN 1510)
            const isValidSuper = (cleanUser === 'superadmin' || cleanUser === 'admin') &&
                (cleanPass === 'admin123' || cleanPass === '1510' || cleanPass === 'south123');
            const isValidCashier = cleanUser === 'kasir' &&
                (cleanPass === 'kasir123' || cleanPass === '1510');
            const isStudioPin = cleanPass === '1510'; // Studio PIN universal

            if (!user || (!isValidSuper && !isValidCashier && !isStudioPin)) {
                return sendJSON(res, 401, {
                    success: false,
                    message: 'Username atau password salah. Silakan periksa kembali.'
                });
            }

            if (!user.is_active) {
                return sendJSON(res, 403, {
                    success: false,
                    message: 'Akun ini dinonaktifkan. Hubungi Kak Ikmal.'
                });
            }

            // Generate Secure Session Token
            const token = 'shs_' + crypto.randomBytes(32).toString('hex');
            const sessionData = {
                userId: user.id,
                username: user.username,
                fullName: user.full_name,
                role: user.role,
                loggedInAt: new Date().toISOString()
            };
            activeSessions.set(token, sessionData);

            // Update last_login_at in database
            db.prepare("UPDATE users SET last_login_at = datetime('now', 'localtime') WHERE id = ?").run(user.id);

            console.log(`[+] User logged in: ${user.username} (${user.full_name}) - Role: ${user.role}`);

            return sendJSON(res, 200, {
                success: true,
                message: `Selamat datang kembali, ${user.full_name}!`,
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    full_name: user.full_name,
                    role: user.role
                }
            });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // POST /api/auth/logout (Session destroy)
    if (method === 'POST' && pathname === '/api/auth/logout') {
        const authHeader = req.headers.authorization || '';
        let token = authHeader.replace(/^Bearer\s+/i, '').trim();

        if (!token) {
            try {
                const body = await parseBody(req);
                token = body.token || '';
            } catch (e) { }
        }
        if (!token && parsedUrl.searchParams.has('token')) {
            token = parsedUrl.searchParams.get('token');
        }

        if (token && activeSessions.has(token)) {
            activeSessions.delete(token);
            console.log(`[AUTH] Sesi dihancurkan (destroyed) untuk token: ${token.substring(0, 10)}...`);
        }
        return sendJSON(res, 200, { success: true, message: 'Sesi berhasil dihancurkan (destroyed).' });
    }

    // GET /api/auth/me
    if (method === 'GET' && pathname === '/api/auth/me') {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (token && activeSessions.has(token)) {
            return sendJSON(res, 200, { success: true, user: activeSessions.get(token) });
        }
        return sendJSON(res, 401, { success: false, message: 'Sesi tidak valid atau telah berakhir.' });
    }

    // =========================================================================
    // ADMIN DASHBOARD OVERVIEW API (/api/admin/overview)
    // =========================================================================

    if (method === 'GET' && pathname === '/api/admin/overview') {
        try {
            const todayStr = new Date().toISOString().slice(0, 10);
            const monthStr = todayStr.slice(0, 7);

            // Revenue Today
            const revTodayRow = db.prepare(`
                SELECT COALESCE(SUM(total_amount), 0) as total 
                FROM bookings 
                WHERE status = 'completed' AND booking_date = ?
            `).get(todayStr);

            // Revenue This Month
            const revMonthRow = db.prepare(`
                SELECT COALESCE(SUM(total_amount), 0) as total 
                FROM bookings 
                WHERE status = 'completed' AND booking_date LIKE ?
            `).get(`${monthStr}%`);

            // Total Bookings Today
            const bookTodayRow = db.prepare(`
                SELECT COUNT(*) as count 
                FROM bookings 
                WHERE booking_date = ?
            `).get(todayStr);

            // Waiting Bookings
            const waitRow = db.prepare(`
                SELECT COUNT(*) as count 
                FROM bookings 
                WHERE status IN ('pending', 'confirmed') AND booking_date = ?
            `).get(todayStr);

            // Completed Bookings Today
            const completedRow = db.prepare(`
                SELECT COUNT(*) as count 
                FROM bookings 
                WHERE status = 'completed' AND booking_date = ?
            `).get(todayStr);

            // Active Capsters
            const capsterRow = db.prepare(`
                SELECT COUNT(*) as count FROM capsters WHERE status = 'active'
            `).get();

            // Low Stock Products (< 20)
            const lowStockProducts = db.prepare(`
                SELECT id, name, stock, price, image_url 
                FROM products 
                WHERE stock < 20 AND is_active = 1
                ORDER BY stock ASC
            `).all();

            // Recent 6 Bookings
            const recentBookings = db.prepare(`
                SELECT b.id, b.booking_code, b.customer_name, b.customer_phone,
                       s.name as service_name, c.name as capster_name,
                       b.booking_date, b.booking_time, b.total_amount, b.status
                FROM bookings b
                LEFT JOIN services s ON b.service_id = s.id
                LEFT JOIN capsters c ON b.capster_id = c.id
                ORDER BY b.id DESC
                LIMIT 6
            `).all();

            return sendJSON(res, 200, {
                success: true,
                data: {
                    revenue_today: Number(revTodayRow.total),
                    revenue_month: Number(revMonthRow.total),
                    bookings_today: Number(bookTodayRow.count),
                    bookings_waiting: Number(waitRow.count),
                    bookings_completed: Number(completedRow.count),
                    active_capsters: Number(capsterRow.count),
                    low_stock_products: lowStockProducts,
                    recent_bookings: recentBookings
                }
            });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // =========================================================================
    // REST API ROUTES (/api/*)
    // =========================================================================

    // GET /api/health
    if (method === 'GET' && pathname === '/api/health') {
        try {
            const countRow = db.prepare('SELECT COUNT(*) as count FROM bookings').get();
            return sendJSON(res, 200, {
                status: 'ok',
                studio: 'South Hair Studio Palopo',
                database: 'connected (SQLite native)',
                total_bookings: countRow.count,
                server_time: new Date().toISOString()
            });
        } catch (err) {
            return sendJSON(res, 500, { status: 'error', message: err.message });
        }
    }

    // GET /api/studio
    if (method === 'GET' && pathname === '/api/studio') {
        try {
            const studio = db.prepare('SELECT * FROM studios WHERE id = 1').get();
            return sendJSON(res, 200, { success: true, data: studio });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // GET /api/capsters
    if (method === 'GET' && pathname === '/api/capsters') {
        try {
            const capsters = db.prepare(`
                SELECT id, slug, name, full_name, role_title, badge, bio, photo_url, 
                       booking_value, rating, cuts_count, status, display_order 
                FROM capsters 
                ORDER BY display_order ASC
            `).all();
            return sendJSON(res, 200, { success: true, data: capsters });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // PATCH /api/capsters/:id/status (Toggle on/off duty)
    if (method === 'PATCH' && pathname.startsWith('/api/capsters/') && pathname.endsWith('/status')) {
        try {
            const id = pathname.split('/')[3];
            const body = await parseBody(req);
            const { status } = body;
            if (!status) return sendJSON(res, 400, { success: false, message: 'Status wajib diisi.' });

            db.prepare('UPDATE capsters SET status = ? WHERE id = ?').run(status, id);
            return sendJSON(res, 200, { success: true, message: `Status capster diubah ke ${status}.` });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // GET /api/services
    if (method === 'GET' && pathname === '/api/services') {
        try {
            const services = db.prepare(`
                SELECT s.id, s.category_id, sc.name as category_name, s.slug, s.name, 
                       s.description, s.price, s.image_url, s.is_featured, s.is_active, s.display_order
                FROM services s
                JOIN service_categories sc ON s.category_id = sc.id
                ORDER BY s.display_order ASC
            `).all();
            return sendJSON(res, 200, { success: true, data: services });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // PATCH /api/services/:id/price (Update price)
    if (method === 'PATCH' && pathname.startsWith('/api/services/') && pathname.endsWith('/price')) {
        try {
            const id = pathname.split('/')[3];
            const body = await parseBody(req);
            const { price } = body;
            if (price === undefined || isNaN(Number(price))) {
                return sendJSON(res, 400, { success: false, message: 'Tarif tidak valid.' });
            }

            db.prepare('UPDATE services SET price = ? WHERE id = ?').run(Number(price), id);
            return sendJSON(res, 200, { success: true, message: `Tarif layanan berhasil diperbarui.` });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // GET /api/products
    if (method === 'GET' && pathname === '/api/products') {
        try {
            const products = db.prepare(`
                SELECT p.id, p.category_id, pc.name as category_name, p.slug, p.name, 
                       p.badge, p.price, p.stock, p.weight_volume, p.short_desc, p.full_desc, 
                       p.benefits, p.how_to_use, p.ingredients, p.image_url, p.is_active, p.display_order
                FROM products p
                JOIN product_categories pc ON p.category_id = pc.id
                ORDER BY p.display_order ASC
            `).all();
            return sendJSON(res, 200, { success: true, data: products });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // PATCH /api/products/:id/stock (Update stock directly from admin)
    if (method === 'PATCH' && pathname.startsWith('/api/products/') && pathname.endsWith('/stock')) {
        try {
            const id = pathname.split('/')[3];
            const body = await parseBody(req);
            const { stock, delta } = body;

            let newStock = 0;
            if (stock !== undefined) {
                newStock = Math.max(0, parseInt(stock, 10));
            } else if (delta !== undefined) {
                const current = db.prepare('SELECT stock FROM products WHERE id = ?').get(id);
                if (!current) return sendJSON(res, 404, { success: false, message: 'Produk tidak ditemukan.' });
                newStock = Math.max(0, current.stock + parseInt(delta, 10));
            }

            db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newStock, id);
            return sendJSON(res, 200, { success: true, stock: newStock, message: `Stok produk diperbarui menjadi ${newStock}.` });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // GET /api/gallery
    if (method === 'GET' && pathname === '/api/gallery') {
        try {
            const gallery = db.prepare(`
                SELECT id, title, category, image_url, capster_id, description, likes_count, display_order
                FROM gallery
                WHERE is_active = 1
                ORDER BY display_order ASC
            `).all();
            return sendJSON(res, 200, { success: true, data: gallery });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // GET /api/reviews
    if (method === 'GET' && pathname === '/api/reviews') {
        try {
            const reviews = db.prepare(`
                SELECT r.id, r.customer_name, r.rating, r.review_text, c.name as capster_name, r.created_at
                FROM reviews r
                LEFT JOIN capsters c ON r.capster_id = c.id
                WHERE r.is_displayed = 1
                ORDER BY r.id DESC
            `).all();
            return sendJSON(res, 200, { success: true, data: reviews });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // GET /api/bookings
    if (method === 'GET' && pathname === '/api/bookings') {
        try {
            const bookings = db.prepare(`
                SELECT b.id, b.booking_code, b.customer_name, b.customer_phone,
                       s.id as service_id, s.name as service_name, s.price as service_price,
                       c.id as capster_id, c.name as capster_name,
                       b.booking_date, b.booking_time, b.total_amount, b.status, b.notes,
                       b.whatsapp_notified, b.created_at
                FROM bookings b
                LEFT JOIN services s ON b.service_id = s.id
                LEFT JOIN capsters c ON b.capster_id = c.id
                ORDER BY b.id DESC
                LIMIT 150
            `).all();
            return sendJSON(res, 200, { success: true, data: bookings });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // POST /api/bookings (Create a new booking and persist to SQLite)
    if (method === 'POST' && pathname === '/api/bookings') {
        try {
            const body = await parseBody(req);
            const {
                customer_name,
                customer_phone,
                service_id,
                service_name,
                capster_id,
                capster_name,
                booking_date,
                booking_time,
                notes
            } = body;

            if (!customer_name || !customer_phone) {
                return sendJSON(res, 400, {
                    success: false,
                    message: 'Nama dan nomor WhatsApp pelanggan wajib diisi.'
                });
            }

            // 1. Resolve Service
            let targetService = null;
            if (service_id) {
                targetService = db.prepare('SELECT id, name, price FROM services WHERE id = ?').get(service_id);
            } else if (service_name) {
                targetService = db.prepare('SELECT id, name, price FROM services WHERE LOWER(name) LIKE ?').get(`%${service_name.toLowerCase().trim()}%`);
            }
            if (!targetService) {
                targetService = db.prepare('SELECT id, name, price FROM services WHERE id = 1').get() || { id: 1, name: 'Hair Cut', price: 40000 };
            }

            // 2. Resolve Capster
            let targetCapster = null;
            if (capster_id) {
                targetCapster = db.prepare('SELECT id, name, cuts_count FROM capsters WHERE id = ?').get(capster_id);
            } else if (capster_name) {
                const searchVal = capster_name.toLowerCase().replace(/kak\s*/g, '').trim();
                targetCapster = db.prepare('SELECT id, name, cuts_count FROM capsters WHERE LOWER(name) = ? OR LOWER(slug) = ? OR LOWER(booking_value) = ?').get(searchVal, searchVal, searchVal);
            }
            if (!targetCapster) {
                targetCapster = db.prepare('SELECT id, name, cuts_count FROM capsters WHERE id = 1').get() || { id: 1, name: 'Ikmal', cuts_count: 0 };
            }

            // 3. Upsert Customer Record
            const cleanPhone = String(customer_phone).trim().replace(/[^0-9]/g, '');
            let customer = db.prepare('SELECT id, total_bookings FROM customers WHERE phone = ?').get(cleanPhone);
            let customerId = null;

            if (customer) {
                customerId = customer.id;
                db.prepare(`
                    UPDATE customers 
                    SET total_bookings = total_bookings + 1,
                        name = ?,
                        last_visit_at = datetime('now', 'localtime')
                    WHERE id = ?
                `).run(customer_name.trim(), customerId);
            } else {
                const insertCust = db.prepare(`
                    INSERT INTO customers (name, phone, total_bookings, last_visit_at)
                    VALUES (?, ?, 1, datetime('now', 'localtime'))
                `).run(customer_name.trim(), cleanPhone);
                customerId = Number(insertCust.lastInsertRowid);
            }

            // 4. Generate Unique Booking Code
            const todayStr = (booking_date || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
            const todayCountRow = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE booking_code LIKE ?').get(`SHS-${todayStr}-%`);
            const seqNum = String(Number(todayCountRow.count) + 1).padStart(3, '0');
            const bookingCode = `SHS-${todayStr}-${seqNum}`;

            const finalDate = booking_date || new Date().toISOString().slice(0, 10);
            const finalTime = booking_time || '14:00';
            const price = Number(targetService.price) || 40000;

            // 5. Insert Booking Record
            const insertBooking = db.prepare(`
                INSERT INTO bookings (
                    booking_code, customer_id, customer_name, customer_phone,
                    service_id, capster_id, booking_date, booking_time,
                    service_price, total_amount, status, notes, whatsapp_notified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, 1)
            `).run(
                bookingCode,
                customerId,
                customer_name.trim(),
                cleanPhone,
                targetService.id,
                targetCapster.id,
                finalDate,
                finalTime,
                price,
                price,
                notes ? notes.trim() : null
            );

            // 6. Increment Capster cuts count
            db.prepare('UPDATE capsters SET cuts_count = cuts_count + 1 WHERE id = ?').run(targetCapster.id);

            console.log(`[+] New Booking Saved to Database: ${bookingCode} (${customer_name} - ${targetService.name} - ${targetCapster.name})`);

            return sendJSON(res, 201, {
                success: true,
                message: 'Booking berhasil disimpan ke database South Hair Studio.',
                data: {
                    id: Number(insertBooking.lastInsertRowid),
                    booking_code: bookingCode,
                    customer_name: customer_name.trim(),
                    customer_phone: cleanPhone,
                    service_id: targetService.id,
                    service_name: targetService.name,
                    service_price: price,
                    capster_id: targetCapster.id,
                    capster_name: targetCapster.name,
                    booking_date: finalDate,
                    booking_time: finalTime,
                    total_amount: price,
                    status: 'confirmed'
                }
            });
        } catch (err) {
            console.error('[!] Error saving booking:', err);
            return sendJSON(res, 500, {
                success: false,
                message: `Gagal menyimpan booking ke database: ${err.message}`
            });
        }
    }

    // PATCH /api/bookings/:code/status (Update status or payment)
    if (method === 'PATCH' && pathname.startsWith('/api/bookings/')) {
        try {
            const bookingCode = decodeURIComponent(pathname.replace('/api/bookings/', '').replace('/status', ''));
            const body = await parseBody(req);
            const { status } = body;

            if (!status) {
                return sendJSON(res, 400, { success: false, message: 'Status wajib diisi.' });
            }

            const update = db.prepare(`
                UPDATE bookings 
                SET status = ?, updated_at = datetime('now', 'localtime') 
                WHERE booking_code = ?
            `).run(status, bookingCode);

            if (update.changes === 0) {
                return sendJSON(res, 404, { success: false, message: 'Booking code tidak ditemukan.' });
            }

            return sendJSON(res, 200, {
                success: true,
                message: `Status booking ${bookingCode} berhasil diubah ke ${status}.`
            });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // DELETE /api/bookings/:code
    if (method === 'DELETE' && pathname.startsWith('/api/bookings/')) {
        try {
            const bookingCode = decodeURIComponent(pathname.replace('/api/bookings/', ''));
            const del = db.prepare('DELETE FROM bookings WHERE booking_code = ?').run(bookingCode);
            if (del.changes === 0) {
                return sendJSON(res, 404, { success: false, message: 'Booking tidak ditemukan.' });
            }
            return sendJSON(res, 200, { success: true, message: `Booking ${bookingCode} berhasil dihapus.` });
        } catch (err) {
            return sendJSON(res, 500, { success: false, message: err.message });
        }
    }

    // =========================================================================
    // STATIC FILE SERVER (dist/ & public/)
    // =========================================================================

    let filePath = '';
    if (pathname === '/' || pathname === '/index.html' || pathname === '/login' || pathname === '/admin') {
        filePath = path.join(DIST_DIR, 'index.html');
    } else if (fs.existsSync(path.join(DIST_DIR, pathname))) {
        filePath = path.join(DIST_DIR, pathname);
    } else if (pathname.startsWith('/assets/')) {
        const relAsset = pathname.replace('/assets/', '');
        const inDist = path.join(DIST_DIR, 'assets', relAsset);
        const inPublic = path.join(PUBLIC_DIR, 'assets', relAsset);
        filePath = fs.existsSync(inDist) ? inDist : inPublic;
    } else {
        const inDist = path.join(DIST_DIR, pathname);
        const inPublic = path.join(PUBLIC_DIR, pathname);
        if (fs.existsSync(inDist)) filePath = inDist;
        else if (fs.existsSync(inPublic)) filePath = inPublic;
        else filePath = path.join(DIST_DIR, 'index.html');
    }

    // Security: Prevent Directory Traversal
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(__dirname))) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        return res.end('403 Forbidden');
    }

    fs.stat(resolvedPath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('404 Not Found - South Hair Studio');
        }

        const ext = path.extname(resolvedPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stats.size,
            'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
        });

        const stream = fs.createReadStream(resolvedPath);
        stream.pipe(res);
    });
});

// Error Handling
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n[!] Port ${PORT} sedang digunakan oleh proses lain.`);
        console.error(`    Tips: Jika backend sudah aktif di background, jalankan frontend saja dengan: npm run dev:client\n`);
        process.exit(1);
    } else {
        throw err;
    }
});

// Start Server
server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`💈 SOUTH HAIR STUDIO - SERVER & REST API AKTIF`);
    console.log(`📡 Website: http://localhost:${PORT}/`);
    console.log(`🔑 Portal Login: http://localhost:${PORT}/login`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`🔌 API Health: http://localhost:${PORT}/api/health`);
    console.log(`📦 Database: database/south_hair_studio.db`);
    console.log(`==================================================\n`);
});

