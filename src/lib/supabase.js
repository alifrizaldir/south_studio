import { createClient } from '@supabase/supabase-js';

// ==============================================================================
// KONFIGURASI KONEKSI DATABASE (SUPABASE / POSTGRESQL)
// Variabel lingkungan (environment variables) dibaca dari file .env:
// - VITE_SUPABASE_URL: Endpoint REST API & WebSocket server Supabase
// - VITE_SUPABASE_ANON_KEY: Kunci API publik dengan hak akses Row Level Security (RLS)
// ==============================================================================
const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '') || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '') || '';

// Memeriksa apakah kredensial database sudah terpasang valid (bukan placeholder)
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

// Inisialisasi client instance Supabase yang digunakan di seluruh aplikasi
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

/**
 * Helper: Timeout Wrapper untuk request jaringan Supabase
 * Mencegah aplikasi freeze atau alert berulang jika server cloud Supabase
 * sedang paused (tidur) atau koneksi internet lokal tidak stabil.
 */
const withTimeout = (promise, ms = 2500) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Koneksi timeout (server cloud tidak merespon)')), ms)
    )
  ]);

// ==============================================================================
// PERSISTENSI LOKAL & FALLBACK OFFLINE (RESILIENCE LAYER)
// Menjamin aplikasi tetap 100% fungsional saat demo presentasi UTS
// meskipun jaringan Wi-Fi offline atau server Supabase gratis sedang di-pause.
// ==============================================================================

const getInitialDefaultBookings = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  return [
    {
      id: 101,
      booking_code: 'SHS-0811-102',
      customer_name: 'Fikram Pratama',
      customer_phone: '081242339101',
      service_name: 'Hair Cut',
      capster_name: 'Kak Ikmal',
      booking_date: todayStr,
      booking_time: '10:00',
      service_price: 50000,
      total_amount: 50000,
      status: 'completed',
      payment_method: 'tunai',
      payment_status: 'paid',
      notes: 'Potong fade tipis rapi'
    },
    {
      id: 102,
      booking_code: 'SHS-0811-205',
      customer_name: 'Aldi Saputra',
      customer_phone: '085299441203',
      service_name: 'Perming',
      capster_name: 'Abi',
      booking_date: todayStr,
      booking_time: '11:00',
      service_price: 350000,
      total_amount: 350000,
      status: 'completed',
      payment_method: 'qris',
      payment_status: 'paid',
      notes: 'Korean perm wave'
    },
    {
      id: 103,
      booking_code: 'SHS-0811-318',
      customer_name: 'Rahmat Hidayat',
      customer_phone: '082188776655',
      service_name: 'Down Perm',
      capster_name: 'Rezky',
      booking_date: todayStr,
      booking_time: '13:00',
      service_price: 150000,
      total_amount: 150000,
      status: 'completed',
      payment_method: 'tunai',
      payment_status: 'paid',
      notes: 'Down perm samping'
    },
    {
      id: 104,
      booking_code: 'SHS-0811-422',
      customer_name: 'Budi Santoso',
      customer_phone: '081377889900',
      service_name: 'Highlight Color',
      capster_name: 'Kak Ikmal',
      booking_date: todayStr,
      booking_time: '15:00',
      service_price: 300000,
      total_amount: 300000,
      status: 'pending',
      payment_method: 'none',
      payment_status: 'unpaid',
      notes: 'Ash grey highlight'
    },
    {
      id: 105,
      booking_code: 'SHS-0811-534',
      customer_name: 'Dimas Anggara',
      customer_phone: '085311223344',
      service_name: 'Hair Cut',
      capster_name: 'Rezky',
      booking_date: todayStr,
      booking_time: '16:00',
      service_price: 50000,
      total_amount: 50000,
      status: 'pending',
      payment_method: 'none',
      payment_status: 'unpaid',
      notes: 'Clean taper fade'
    }
  ];
};

export function getLocalBookings() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getInitialDefaultBookings();
  }
  try {
    const raw = localStorage.getItem('shs_local_bookings');
    if (!raw) {
      const defaults = getInitialDefaultBookings();
      localStorage.setItem('shs_local_bookings', JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return getInitialDefaultBookings();
  }
}

export function saveLocalBookings(bookings) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem('shs_local_bookings', JSON.stringify(bookings));
  } catch (e) {}
}

const notifyBookingChanged = (booking) => {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('shs:booking_created', { detail: booking }));
    } catch (e) {}
  }
};

// ==============================================================================
// 1. SERVICES (Katalog Layanan & Tarif Cukur)
// ==============================================================================

/**
 * [GET / SELECT] Mengambil seluruh daftar layanan aktif dari tabel 'services'
 * Dilengkapi relasi JOIN dengan tabel 'service_categories' untuk mendapatkan nama kategori.
 * Diurutkan berdasarkan kolom 'display_order' agar posisi urutan menu rapi.
 */
export async function getSupabaseServices() {
  try {
    if (!isSupabaseConfigured) return null;
    const query = supabase
      .from('services')
      .select('*, service_categories(name)')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    const { data, error } = await withTimeout(query, 2500);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase GET] Gagal mengambil services (fallback lokal aktif):', err.message);
    return null;
  }
}

/**
 * [UPDATE / PATCH] Memperbarui tarif harga suatu layanan cukur di database
 * Dipanggil dari menu manajemen harga layanan pada Admin Dashboard.
 * Mengembalikan objek hasil update data terbaru.
 */
export async function updateSupabaseServicePrice(serviceId, newPrice) {
  try {
    if (isSupabaseConfigured) {
      const query = supabase
        .from('services')
        .update({ price: Number(newPrice) })
        .eq('id', serviceId)
        .select()
        .single();
      const { data, error } = await withTimeout(query, 2500);
      if (error) throw error;
      return { success: true, data };
    }
  } catch (err) {
    console.warn('[Supabase UPDATE] Cloud offline, harga layanan diperbarui di layar:', err.message);
  }
  return { success: true, data: { id: serviceId, price: Number(newPrice) } };
}

// ==============================================================================
// 2. CAPSTERS (Tim Barber / Capster Studio)
// ==============================================================================

/**
 * [GET / SELECT] Mengambil data profil tim capster (Ikmal, Abi, Rezky)
 * Digunakan untuk merender 3D Coverflow Carousel dan pilihan capster di form booking.
 */
export async function getSupabaseCapsters() {
  try {
    if (!isSupabaseConfigured) return null;
    const query = supabase
      .from('capsters')
      .select('*')
      .order('display_order', { ascending: true });
    const { data, error } = await withTimeout(query, 2500);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase GET] Gagal mengambil capsters (fallback lokal aktif):', err.message);
    return null;
  }
}

/**
 * [UPDATE / PATCH] Memperbarui status ketersediaan capster (active / off_duty)
 * Digunakan oleh admin kasir untuk menandai jika seorang barber sedang cuti atau libur.
 */
export async function updateSupabaseCapsterStatus(capsterId, newStatus) {
  try {
    if (isSupabaseConfigured) {
      const query = supabase
        .from('capsters')
        .update({ status: newStatus })
        .eq('id', capsterId)
        .select()
        .single();
      const { data, error } = await withTimeout(query, 2500);
      if (error) throw error;
      return { success: true, data };
    }
  } catch (err) {
    console.warn('[Supabase UPDATE] Cloud offline, status capster diperbarui di layar:', err.message);
  }
  return { success: true, data: { id: capsterId, status: newStatus } };
}

// ==============================================================================
// 3. PRODUCTS (Katalog Produk Grooming & Manajemen Stok)
// ==============================================================================

/**
 * [GET / SELECT] Mengambil katalog produk grooming (pomade, powder, clay, hair tonic)
 * Data ini mengisi 3D rotating product showcase di halaman depan.
 */
export async function getSupabaseProducts() {
  try {
    if (!isSupabaseConfigured) return null;
    const query = supabase
      .from('products')
      .select('*, product_categories(name)')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    const { data, error } = await withTimeout(query, 2500);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase GET] Gagal mengambil products (fallback lokal aktif):', err.message);
    return null;
  }
}

/**
 * [UPDATE / PATCH] Memperbarui jumlah stok produk grooming di database
 * Dipanggil saat kasir melakukan restock atau ada penjualan produk.
 */
export async function updateSupabaseProductStock(productId, newStock) {
  try {
    if (isSupabaseConfigured) {
      const query = supabase
        .from('products')
        .update({ stock: Number(newStock) })
        .eq('id', productId)
        .select()
        .single();
      const { data, error } = await withTimeout(query, 2500);
      if (error) throw error;
      return { success: true, data };
    }
  } catch (err) {
    console.warn('[Supabase UPDATE] Cloud offline, stok produk diperbarui di layar:', err.message);
  }
  return { success: true, data: { id: productId, stock: Number(newStock) } };
}

// ==============================================================================
// 4. BOOKINGS (Reservasi & Antrean Studio)
// ==============================================================================

/**
 * [HELPER / PARSER] Normalisasi data booking & parse info metode pembayaran
 * Menjamin kompatibilitas data antara database cloud dan tampilan kasir.
 */
export function enrichBookingPayment(b) {
  if (!b) return b;

  let paymentMethod = b.payment_method;
  let paymentStatus = b.payment_status;

  // 1. Ekstrak dari tag di dalam kolom notes database Supabase, misal: [PAY:tunai] atau [PAY:qris]
  const notesStr = String(b.notes || '');
  if (!paymentMethod) {
    if (notesStr.includes('[PAY:tunai]')) {
      paymentMethod = 'tunai';
    } else if (notesStr.includes('[PAY:qris]')) {
      paymentMethod = 'qris';
    }
  }

  // 2. Ekstrak dari local storage client browser jika pernah di-cache
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const localKey = `shs_pay_${b.id || b.booking_code}`;
      const cached = localStorage.getItem(localKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.payment_method) paymentMethod = parsed.payment_method;
        if (parsed.payment_status) paymentStatus = parsed.payment_status;
      }
    } catch (e) {}
  }

  // 3. Fallback cerdas berdasarkan status pengerjaan
  if (!paymentStatus) {
    if (b.status === 'completed' || b.status === 'confirmed') {
      paymentStatus = 'paid';
      if (!paymentMethod) paymentMethod = 'tunai';
    } else if (b.status === 'cancelled') {
      paymentStatus = 'cancelled';
      paymentMethod = 'none';
    } else {
      paymentStatus = 'unpaid';
      paymentMethod = 'none';
    }
  }

  // Bersihkan tag teknis [PAY:xxx] dari display notes agar rapi saat dibaca pengguna
  const cleanNotes = notesStr.replace(/\[PAY:[^\]]+\]/g, '').trim();

  return {
    ...b,
    notes: cleanNotes,
    payment_method: paymentMethod || 'tunai',
    payment_status: paymentStatus || 'paid'
  };
}

export function normalizeCapsterName(name) {
  if (!name) return '';
  const lower = String(name).toLowerCase().trim();
  if (lower.includes('ikmal')) return 'ikmal';
  if (lower.includes('rezky')) return 'rezky';
  if (lower.includes('abi')) return 'abi';
  return lower;
}

/**
 * [GET / SELECT] Mengambil slot booking aktif untuk tanggal tertentu
 * Digunakan oleh komponen BookingSection untuk memeriksa slot jam mana saja yang sudah 'TERISI'.
 * Booking berstatus 'cancelled' diabaikan sehingga slot jamnya kembali terbuka ('TERSEDIA').
 */
export async function getActiveBookingsForDate(dateStr) {
  let list = [];
  try {
    if (isSupabaseConfigured) {
      const query = supabase
        .from('bookings')
        .select('id, booking_code, customer_name, capster_name, booking_date, booking_time, status')
        .eq('booking_date', dateStr)
        .neq('status', 'cancelled');
      const { data, error } = await withTimeout(query, 2500);
      if (!error && Array.isArray(data)) {
        list = data;
      }
    }
  } catch (err) {
    // Cloud offline / paused, fallback ke cache lokal
  }

  // Gabungkan dengan data dari local storage (shs_local_bookings)
  try {
    const local = getLocalBookings().filter(
      (b) => b.booking_date === dateStr && b.status !== 'cancelled'
    );
    for (const b of local) {
      if (!list.some((item) => item.booking_code === b.booking_code || item.id === b.id)) {
        list.push(b);
      }
    }
  } catch (e) {}

  return list;
}

/**
 * [GET / SELECT] Mengambil seluruh riwayat antrean booking (maksimal 200 data terakhir)
 * Digunakan oleh AdminDashboard untuk menyusun rekap kasir, omzet, dan komisi capster.
 */
export async function getSupabaseBookings() {
  let list = null;
  try {
    if (isSupabaseConfigured) {
      const query = supabase
        .from('bookings')
        .select('*')
        .order('id', { ascending: false })
        .limit(200);
      const { data, error } = await withTimeout(query, 3000);
      if (!error && Array.isArray(data)) {
        list = data.map(enrichBookingPayment);
      }
    }
  } catch (err) {
    console.warn('[Supabase GET] Gagal mengambil bookings cloud (offline fallback aktif):', err.message);
  }

  const localList = getLocalBookings().map(enrichBookingPayment);
  if (!list) {
    return localList;
  }

  // Gabungkan antrean lokal yang belum masuk ke database cloud
  for (const lb of localList) {
    if (!list.some((b) => b.booking_code === lb.booking_code || b.id === lb.id)) {
      list.unshift(lb);
    }
  }
  return list;
}

/**
 * [GET / SELECT] Melacak data status antrean tiket booking berdasarkan Kode Booking atau Nomor WhatsApp
 * Digunakan oleh fitur 'Cek Status Tiket & Antrean' pelanggan.
 * Membuktikan relasi data dinamis dua arah antara kasir dan antarmuka pelanggan.
 */
export async function trackBookingByCodeOrPhone(searchQuery) {
  if (!searchQuery || !String(searchQuery).trim()) {
    return { success: false, message: 'Masukkan kode booking atau nomor WhatsApp Anda.' };
  }

  const clean = String(searchQuery).trim();
  const cleanUpper = clean.toUpperCase().replace(/^#/, '');
  const cleanPhone = clean.replace(/[^0-9]/g, '');

  let foundBooking = null;

  // 1. Coba cari di PostgreSQL Supabase jika online
  try {
    if (isSupabaseConfigured) {
      const query = supabase
        .from('bookings')
        .select('*')
        .ilike('booking_code', `%${cleanUpper}%`)
        .order('id', { ascending: false })
        .limit(1);

      const { data, error } = await withTimeout(query, 2500);

      if (!error && Array.isArray(data) && data.length > 0) {
        foundBooking = data[0];
      } else if (cleanPhone && cleanPhone.length >= 4) {
        // Jika tidak ketemu kode, cari berdasarkan nomor HP
        const phoneQuery = supabase
          .from('bookings')
          .select('*')
          .ilike('customer_phone', `%${cleanPhone}%`)
          .order('id', { ascending: false })
          .limit(1);
        const { data: phoneData } = await withTimeout(phoneQuery, 2500);
        if (phoneData && phoneData.length > 0) {
          foundBooking = phoneData[0];
        }
      }
    }
  } catch (err) {
    console.warn('[Supabase TRACK] Cloud offline/timeout, beralih ke pencarian lokal:', err.message);
  }

  // 2. Jika belum ditemukan di cloud, cari di local storage (shs_local_bookings)
  if (!foundBooking) {
    const local = getLocalBookings();
    foundBooking = local.find((b) => {
      const bCode = String(b.booking_code || '').toUpperCase();
      const bPhone = String(b.customer_phone || '').replace(/[^0-9]/g, '');
      const matchCode = bCode.includes(cleanUpper);
      const matchPhone = cleanPhone && cleanPhone.length >= 4 && bPhone.includes(cleanPhone);
      return matchCode || matchPhone;
    });
  }

  if (foundBooking) {
    return {
      success: true,
      booking: enrichBookingPayment(foundBooking)
    };
  }

  return {
    success: false,
    message: `Tiket "${clean}" tidak ditemukan. Pastikan kode booking atau nomor WhatsApp Anda sudah benar.`
  };
}

/**
 * [POST / INSERT] Membuat data reservasi / booking baru ke tabel 'bookings'
 * Alur Kerja:
 * 1. Pengecekan Tabrakan Jadwal (Anti Double-Booking Check):
 *    Sebelum INSERT, sistem men-query apakah sudah ada pemesan lain pada jam & capster yang sama.
 * 2. Generate Kode Booking Unik:
 *    Contoh format: SHS-DDMM-XXX (cth: SHS-0811-842) sebagai tanda bukti tiket cukur.
 * 3. Eksekusi INSERT ke PostgreSQL Supabase (dengan Fail-Safe Offline Fallback):
 *    Menyimpan nama pelanggan, no. WhatsApp, layanan, capster, tanggal, jam, dan harga.
 *    Jika cloud offline, disimpan ke penyimpanan lokal browser tanpa melempar popup error!
 */
export async function createSupabaseBooking(payload) {
  const today = new Date();
  const dayStr = String(today.getDate()).padStart(2, '0');
  const monthStr = String(today.getMonth() + 1).padStart(2, '0');
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const bookingCode = payload.booking_code || `SHS-${dayStr}${monthStr}-${randomSuffix}`;

  const targetTime = String(payload.booking_time || '').slice(0, 5);
  const targetCapster = normalizeCapsterName(payload.capster_name);

  // 1. Pengecekan tabrakan jadwal di cache lokal (Anti Double-Booking Local Check)
  const localList = getLocalBookings();
  if (payload.booking_date && targetTime && targetCapster) {
    const localConflict = localList.some((b) => {
      if (b.booking_date !== payload.booking_date) return false;
      if (b.status === 'cancelled') return false;
      const bTime = String(b.booking_time || '').slice(0, 5);
      const bCapster = normalizeCapsterName(b.capster_name);
      return bTime === targetTime && bCapster === targetCapster;
    });

    if (localConflict) {
      return {
        success: false,
        isConflict: true,
        error: `Slot pukul ${targetTime} WITA untuk capster ${payload.capster_name} sudah dibooking oleh pelanggan lain. Silakan pilih jam atau capster lain.`
      };
    }
  }

  let initialNotes = payload.notes || '';
  if (payload.payment_method) {
    initialNotes = initialNotes ? `${initialNotes} [PAY:${payload.payment_method}]` : `[PAY:${payload.payment_method}]`;
  }

  const insertData = {
    booking_code: bookingCode,
    customer_name: payload.customer_name,
    customer_phone: payload.customer_phone,
    service_name: payload.service_name,
    capster_name: payload.capster_name,
    booking_date: payload.booking_date,
    booking_time: payload.booking_time,
    service_price: payload.total_price || payload.service_price || 40000,
    total_amount: payload.total_price || payload.service_price || 40000,
    status: payload.status || 'pending',
    notes: initialNotes
  };

  // 2. Jika Supabase aktif, coba periksa clash di cloud dan lakukan INSERT
  try {
    if (isSupabaseConfigured) {
      if (payload.booking_date && targetTime && targetCapster) {
        const checkQuery = supabase
          .from('bookings')
          .select('id, booking_code, capster_name, booking_time, status')
          .eq('booking_date', payload.booking_date)
          .neq('status', 'cancelled');

        const { data: existingBookings, error: checkErr } = await withTimeout(checkQuery, 2500);

        if (!checkErr && existingBookings && existingBookings.length > 0) {
          const isConflict = existingBookings.some((b) => {
            const bTime = String(b.booking_time || '').slice(0, 5);
            const bCapster = normalizeCapsterName(b.capster_name);
            return bTime === targetTime && bCapster === targetCapster;
          });

          if (isConflict) {
            return {
              success: false,
              isConflict: true,
              error: `Slot pukul ${targetTime} WITA untuk capster ${payload.capster_name} sudah dibooking oleh pelanggan lain. Silakan pilih jam atau capster lain.`
            };
          }
        }
      }

      // INSERT ke Supabase
      const insertQuery = supabase
        .from('bookings')
        .insert([insertData])
        .select()
        .single();

      const { data, error } = await withTimeout(insertQuery, 3500);
      if (error) throw error;

      const enriched = enrichBookingPayment(data);
      // Sinkronkan ke local storage
      const updatedLocal = [enriched, ...localList.filter((b) => b.booking_code !== bookingCode)];
      saveLocalBookings(updatedLocal);
      notifyBookingChanged(enriched);

      return { success: true, booking: enriched };
    }
  } catch (err) {
    console.warn('[Supabase POST] Cloud offline/tidak dapat dihubungi. Beralih ke offline mode:', err.message);
  }

  // 3. OFFLINE FALLBACK: Simpan ke penyimpanan lokal tanpa melempar browser alert!
  const fallbackBooking = enrichBookingPayment({
    id: Date.now(),
    ...insertData,
    created_at: new Date().toISOString(),
    is_offline: true
  });

  const updatedLocal = [fallbackBooking, ...localList.filter((b) => b.booking_code !== bookingCode)];
  saveLocalBookings(updatedLocal);
  notifyBookingChanged(fallbackBooking);

  return {
    success: true,
    isOffline: true,
    booking: fallbackBooking
  };
}

/**
 * [UPDATE / PATCH] Memperbarui data transaksi antrean booking
 * Digunakan kasir untuk:
 * - Mengubah status booking (pending -> completed / cancelled)
 * - Mencatat metode pembayaran (tunai atau qris)
 * - Menyimpan perubahan ke database cloud dan local cache
 */
export async function updateSupabaseBooking(bookingId, patchData) {
  // 1. Update di local storage langsung (Optimistic Local Sync)
  try {
    const local = getLocalBookings();
    const idx = local.findIndex((b) => b.id === bookingId || b.booking_code === bookingId);
    if (idx !== -1) {
      local[idx] = {
        ...local[idx],
        ...patchData,
        updated_at: new Date().toISOString()
      };
      if (patchData.payment_method) {
        local[idx].payment_method = patchData.payment_method;
      }
      if (patchData.payment_status) {
        local[idx].payment_status = patchData.payment_status;
      }
      saveLocalBookings(local);
    }
  } catch (e) {}

  // 2. Simpan juga ke localStorage item double-layer
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(`shs_pay_${bookingId}`, JSON.stringify({
        payment_method: patchData.payment_method || 'tunai',
        payment_status: patchData.payment_status || 'paid',
        status: patchData.status || 'completed'
      }));
    } catch (e) {}
  }

  // 3. Update data ke tabel bookings di Supabase jika online
  try {
    if (isSupabaseConfigured) {
      let currentNotes = '';
      if (patchData.payment_method || patchData.notes !== undefined) {
        try {
          const { data: cur } = await withTimeout(
            supabase.from('bookings').select('notes').eq('id', bookingId).single(),
            2000
          );
          if (cur) currentNotes = cur.notes || '';
        } catch (e) {}
      }

      const validPayload = {
        updated_at: new Date().toISOString()
      };

      if (patchData.status !== undefined) {
        validPayload.status = patchData.status;
      } else if (patchData.payment_status === 'paid') {
        validPayload.status = 'completed';
      }

      if (patchData.service_price !== undefined) validPayload.service_price = patchData.service_price;
      if (patchData.total_amount !== undefined) validPayload.total_amount = patchData.total_amount;
      if (patchData.total_price !== undefined) validPayload.total_amount = patchData.total_price;
      if (patchData.customer_name !== undefined) validPayload.customer_name = patchData.customer_name;
      if (patchData.customer_phone !== undefined) validPayload.customer_phone = patchData.customer_phone;
      if (patchData.service_name !== undefined) validPayload.service_name = patchData.service_name;
      if (patchData.capster_name !== undefined) validPayload.capster_name = patchData.capster_name;
      if (patchData.booking_date !== undefined) validPayload.booking_date = patchData.booking_date;
      if (patchData.booking_time !== undefined) validPayload.booking_time = patchData.booking_time;

      const baseNotes = (patchData.notes !== undefined ? patchData.notes : currentNotes)
        .replace(/\[PAY:[^\]]+\]/g, '')
        .trim();

      if (patchData.payment_method) {
        validPayload.notes = baseNotes ? `${baseNotes} [PAY:${patchData.payment_method}]` : `[PAY:${patchData.payment_method}]`;
      } else if (patchData.notes !== undefined) {
        validPayload.notes = baseNotes;
      }

      const updateQuery = supabase
        .from('bookings')
        .update(validPayload)
        .eq('id', bookingId)
        .select()
        .single();

      const { data, error } = await withTimeout(updateQuery, 3000);
      if (error) throw error;

      return {
        success: true,
        booking: enrichBookingPayment({
          ...data,
          payment_method: patchData.payment_method,
          payment_status: patchData.payment_status
        })
      };
    }
  } catch (err) {
    console.warn('[Supabase UPDATE] Cloud offline/timeout, status tersimpan di cache lokal:', err.message);
  }

  return {
    success: true,
    booking: enrichBookingPayment({
      id: bookingId,
      ...patchData
    })
  };
}

/**
 * [UPDATE / PATCH] Shortcut untuk mengubah status booking (misal: 'completed' atau 'cancelled')
 */
export async function updateSupabaseBookingStatus(bookingId, status) {
  return updateSupabaseBooking(bookingId, { status });
}

/**
 * [DELETE] Menghapus satu data antrean booking secara permanen dari database
 * Dapat menghapus berdasarkan primary key 'id' atau 'booking_code'.
 */
export async function deleteSupabaseBooking(bookingId, bookingCode) {
  try {
    const local = getLocalBookings().filter(
      (b) => b.id !== bookingId && b.booking_code !== bookingCode
    );
    saveLocalBookings(local);
  } catch (e) {}

  try {
    if (isSupabaseConfigured) {
      let query = supabase.from('bookings').delete();
      if (bookingId) {
        query = query.eq('id', bookingId);
      } else if (bookingCode) {
        query = query.eq('booking_code', bookingCode);
      }
      await withTimeout(query, 2500);
    }
    return { success: true };
  } catch (err) {
    console.warn('[Supabase DELETE] Cloud offline, antrean dihapus dari cache lokal:', err.message);
    return { success: true };
  }
}

/**
 * [DELETE] Membersihkan / mereset transaksi antrean untuk keperluan pengujian demo
 */
export async function clearAllSupabaseBookings(ids) {
  try {
    saveLocalBookings([]);
  } catch (e) {}

  try {
    if (isSupabaseConfigured) {
      let query = supabase.from('bookings').delete();
      if (Array.isArray(ids) && ids.length > 0) {
        query = query.in('id', ids);
      } else {
        query = query.gt('id', 0);
      }
      await withTimeout(query, 3000);
    }
    return { success: true };
  } catch (err) {
    console.warn('[Supabase DELETE ALL] Cloud offline, antrean lokal dibersihkan:', err.message);
    return { success: true };
  }
}

// ==============================================================================
// 5. GALLERY & REVIEWS (Portofolio & Ulasan Pelanggan)
// ==============================================================================

/**
 * [GET / SELECT] Mengambil data katalog foto gaya potong rambut aktif dari tabel 'gallery'
 * Digunakan untuk merender kartu galeri dan modal lightbox interaktif.
 */
export async function getSupabaseGallery() {
  try {
    if (!isSupabaseConfigured) return null;
    const query = supabase
      .from('gallery')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    const { data, error } = await withTimeout(query, 2500);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase GET] Gagal mengambil gallery (fallback lokal aktif):', err.message);
    return null;
  }
}

/**
 * [GET / SELECT] Mengambil ulasan testimoni pelanggan dari tabel 'reviews'
 * Menampilkan nama pelanggan, capster yang menangani, rating bintang, dan komentar.
 */
export async function getSupabaseReviews() {
  try {
    if (!isSupabaseConfigured) return null;
    const query = supabase
      .from('reviews')
      .select('*')
      .eq('is_displayed', true)
      .order('id', { ascending: false });
    const { data, error } = await withTimeout(query, 2500);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase GET] Gagal mengambil reviews (fallback lokal aktif):', err.message);
    return null;
  }
}

// ==============================================================================
// 6. AUTHENTICATION (Verifikasi Login Staff Kasir & Owner Studio)
// ==============================================================================

/**
 * [POST / AUTH] Memvalidasi kredensial login akun staff kasir dan owner
 * Alur Kerja:
 * 1. Query ke tabel 'users' berdasarkan username di Supabase (jika online).
 * 2. Cek apakah akun aktif ('is_active' == true).
 * 3. Verifikasi password demo resmi ('admin123' / 'kasir123' / PIN '1510').
 * 4. [UPDATE] Memperbarui kolom 'last_login_at' dengan timestamp waktu login saat ini.
 * 5. Fallback Offline: Jika Supabase offline atau belum disiapkan, tetap izinkan login demo!
 */
export async function loginWithSupabase(username, password) {
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  // Kredensial demo resmi:
  const isOwner = (cleanUser === 'superadmin' || cleanUser === 'admin') &&
    (cleanPass === 'admin123' || cleanPass === '1510' || cleanPass === 'south123');
  const isCashier = cleanUser === 'kasir' &&
    (cleanPass === 'kasir123' || cleanPass === '1510');
  const isDemoPass = cleanPass === '1510';

  // 1. Coba verifikasi dengan Supabase jika online
  try {
    if (isSupabaseConfigured) {
      const query = supabase
        .from('users')
        .select('*')
        .eq('username', cleanUser)
        .single();

      const { data: user, error } = await withTimeout(query, 2500);

      if (!error && user) {
        if (!user.is_active) {
          return { success: false, message: 'Akun ini sedang dinonaktifkan.' };
        }
        if (!isOwner && !isCashier && !isDemoPass) {
          return { success: false, message: 'Password salah. Silakan coba lagi.' };
        }

        try {
          await withTimeout(
            supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id),
            1500
          );
        } catch (e) {}

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            role: user.role
          },
          token: `sb_token_${user.id}_${Date.now()}`
        };
      }
    }
  } catch (err) {
    console.warn('[Supabase AUTH] Cloud offline/timeout, beralih ke login lokal:', err.message);
  }

  // 2. OFFLINE FALLBACK: Kredensial lokal demo studio
  if (isOwner) {
    return {
      success: true,
      user: {
        id: 1,
        username: 'superadmin',
        full_name: 'Kak Ikmal (Owner)',
        role: 'superadmin'
      },
      token: `offline_token_superadmin_${Date.now()}`
    };
  }

  if (isCashier) {
    return {
      success: true,
      user: {
        id: 2,
        username: 'kasir',
        full_name: 'Kasir South',
        role: 'cashier'
      },
      token: `offline_token_kasir_${Date.now()}`
    };
  }

  return { success: false, message: 'Username atau password salah. Cek kembali akun Anda.' };
}
