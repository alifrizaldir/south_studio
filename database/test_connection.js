const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.join(__dirname, '..', '.env');
let supabaseUrl = '';
let supabaseAnonKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1].trim();
    }
    if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = trimmed.split('=')[1].trim();
    }
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum diisi di .env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log(`📡 Menghubungi Supabase di: ${supabaseUrl}...`);
  
  const results = {};
  const tables = ['studios', 'capsters', 'services', 'products', 'gallery', 'reviews', 'bookings'];

  for (const tbl of tables) {
    const { data, error, count } = await supabase.from(tbl).select('*', { count: 'exact' }).limit(1);
    if (error) {
      results[tbl] = { ok: false, error: error.message };
    } else {
      results[tbl] = { ok: true, count: count };
    }
  }

  const allSuccess = Object.values(results).every(r => r.ok);

  console.log('\n--- HASIL PEMERIKSAAN TABEL SUPABASE ---');
  for (const [tbl, res] of Object.entries(results)) {
    if (res.ok) {
      console.log(`✅ Tabel '${tbl}': Siap & Terhubung! (Baris data: ${res.count})`);
    } else {
      console.log(`❌ Tabel '${tbl}': Belum siap (${res.error})`);
    }
  }

  if (allSuccess) {
    console.log('\n🎉 SEMUA TABEL SUPABASE BERHASIL DIVERIFIKASI DAN SIAP DIGUNAKAN!');
  } else {
    console.log('\n⚠️ Tabel belum dibuat di database Supabase Anda.');
    console.log('👉 Silakan salin isi file "database/schema_supabase.sql" ke Supabase SQL Editor dan klik "Run".');
  }
}

testConnection();
