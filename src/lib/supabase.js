import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

// Inisialisasi Supabase Client Utama
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// ==============================================================================
// 1. SERVICES (Katalog Layanan & Tarif)
// ==============================================================================

export async function getSupabaseServices() {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*, service_categories(name)')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase] Gagal mengambil services:', err.message);
    return null;
  }
}

export async function updateSupabaseServicePrice(serviceId, newPrice) {
  try {
    const { data, error } = await supabase
      .from('services')
      .update({ price: Number(newPrice) })
      .eq('id', serviceId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Gagal update harga service:', err.message);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 2. CAPSTERS (Tim Barber)
// ==============================================================================

export async function getSupabaseCapsters() {
  try {
    const { data, error } = await supabase
      .from('capsters')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase] Gagal mengambil capsters:', err.message);
    return null;
  }
}

export async function updateSupabaseCapsterStatus(capsterId, newStatus) {
  try {
    const { data, error } = await supabase
      .from('capsters')
      .update({ status: newStatus })
      .eq('id', capsterId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Gagal update status capster:', err.message);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 3. PRODUCTS (Katalog Grooming & Stok)
// ==============================================================================

export async function getSupabaseProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_categories(name)')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase] Gagal mengambil products:', err.message);
    return null;
  }
}

export async function updateSupabaseProductStock(productId, newStock) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ stock: Number(newStock) })
      .eq('id', productId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Gagal update stok produk:', err.message);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 4. BOOKINGS (Reservasi & Antrean Studio)
// ==============================================================================

export async function getSupabaseBookings() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('id', { ascending: false })
      .limit(200);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase] Gagal mengambil bookings:', err.message);
    return null;
  }
}

export async function createSupabaseBooking(payload) {
  try {
    const today = new Date();
    const dayStr = String(today.getDate()).padStart(2, '0');
    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const bookingCode = payload.booking_code || `SHS-${dayStr}${monthStr}-${randomSuffix}`;

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
      notes: payload.notes || ''
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, booking: data };
  } catch (err) {
    console.error('[Supabase] Gagal membuat booking:', err.message);
    return { success: false, error: err.message };
  }
}

export async function updateSupabaseBooking(bookingId, patchData) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...patchData,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, booking: data };
  } catch (err) {
    console.error('[Supabase] Gagal update booking:', err.message);
    return { success: false, error: err.message };
  }
}

export async function updateSupabaseBookingStatus(bookingId, status) {
  return updateSupabaseBooking(bookingId, { status });
}

// ==============================================================================
// 5. GALLERY & REVIEWS (Portofolio & Ulasan Pelanggan)
// ==============================================================================

export async function getSupabaseGallery() {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase] Gagal mengambil gallery:', err.message);
    return null;
  }
}

export async function getSupabaseReviews() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_displayed', true)
      .order('id', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase] Gagal mengambil reviews:', err.message);
    return null;
  }
}

// ==============================================================================
// 6. AUTHENTICATION (Login Admin & Kasir Langsung via Supabase)
// ==============================================================================

export async function loginWithSupabase(username, password) {
  try {
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', cleanUser)
      .single();

    if (error || !user) {
      return { success: false, message: 'Username tidak ditemukan di database Supabase.' };
    }

    if (!user.is_active) {
      return { success: false, message: 'Akun ini sedang dinonaktifkan.' };
    }

    // Validasi Password:
    // Menerima password resmi demo:
    // - superadmin: '1510' atau 'admin123'
    // - kasir: 'kasir123' atau '1510'
    const isOwner = user.username === 'superadmin' && (cleanPass === 'admin123' || cleanPass === '1510');
    const isCashier = user.username === 'kasir' && (cleanPass === 'kasir123' || cleanPass === '1510');
    const isDemoPass = cleanPass === '1510';

    if (!isOwner && !isCashier && !isDemoPass) {
      return { success: false, message: 'Password salah. Silakan coba lagi.' };
    }

    // Catat waktu login ke Supabase
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    const sessionUser = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role
    };

    return {
      success: true,
      user: sessionUser,
      token: `sb_token_${user.id}_${Date.now()}`
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
