import React, { useState, useEffect } from 'react';
import '../admin.css';
import {
  getSupabaseBookings,
  getSupabaseServices,
  getSupabaseCapsters,
  getSupabaseProducts,
  updateSupabaseBooking,
  updateSupabaseBookingStatus,
  createSupabaseBooking,
  updateSupabaseServicePrice,
  updateSupabaseCapsterStatus,
  updateSupabaseProductStock,
  supabase,
  isSupabaseConfigured
} from '../lib/supabase';

export default function AdminDashboard({ onLogout, onBackToHome, onShowToast }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('shs_sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('shs_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Capster Commission Calculation System State
  const [commissionRate, setCommissionRate] = useState(50); // 50% Capster : 50% Studio
  const [commPeriodFilter, setCommPeriodFilter] = useState('all'); // 'today' | '7days' | 'month' | 'all' | 'custom'
  const [commCustomDate, setCommCustomDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [commCapsterFilter, setCommCapsterFilter] = useState('all');
  const [commStatusScope, setCommStatusScope] = useState('completed_only'); // 'completed_only' | 'all_active'
  const [commSearchQuery, setCommSearchQuery] = useState('');
  const [thermalReceiptData, setThermalReceiptData] = useState(null);
  const [copiedWaId, setCopiedWaId] = useState(null);

  // Walk-in booking modal
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinService, setWalkinService] = useState('Hair Cut|Rp 50.000|50000');
  const [walkinCapster, setWalkinCapster] = useState('Rezky');

  // Services State
  const [services, setServices] = useState([
    {
      id: 1,
      category_id: 1,
      category_name: 'Potong & Styling',
      name: 'Hair Cut',
      price: 50000,
      duration: '45 Menit',
      image_url: 'assets/layanan_south/hair_cut.png',
      description: 'Potongan rambut presisi sesuai bentuk kepala dan karakter rambut. Fade, cuci rambut, dan styling pomade.'
    },
    {
      id: 2,
      category_id: 2,
      category_name: 'Coloring & Highlight',
      name: 'Highlight Color',
      price: 300000,
      duration: '90 Menit',
      image_url: 'assets/layanan_south/highlight_color.png',
      description: 'Aksen warna dimensi berkelas untuk mempertajam tekstur rambut pria dengan proteksi keratin.'
    },
    {
      id: 3,
      category_id: 2,
      category_name: 'Coloring & Highlight',
      name: 'Full Color',
      price: 400000,
      duration: '120 Menit',
      image_url: 'assets/layanan_south/full_color.png',
      description: 'Pewarnaan rambut menyeluruh dengan pilihan tone natural hingga bold modern tanpa merusak akar.'
    },
    {
      id: 4,
      category_id: 3,
      category_name: 'Chemical Treatment',
      name: 'Perming',
      price: 350000,
      duration: '120 Menit',
      image_url: 'assets/layanan_south/perming.png',
      description: 'Pengeritingan rambut gaya Korea / wavier look yang awet natural hingga 3-5 bulan pemakaian.'
    },
    {
      id: 5,
      category_id: 3,
      category_name: 'Chemical Treatment',
      name: 'Down Perm',
      price: 150000,
      duration: '60 Menit',
      image_url: 'assets/layanan_south/down_perm.png',
      description: 'Penjinak rambut kaku mengembang di samping agar rapi rapat dan mudah diatur setiap hari.'
    }
  ]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCatFilter, setServiceCatFilter] = useState('all');
  const [editingService, setEditingService] = useState(null);
  const [editPriceInput, setEditPriceInput] = useState('');

  // Capsters State
  const [capsters, setCapsters] = useState([
    {
      id: 1,
      name: 'Kak Ikmal',
      full_name: 'Muhammad Ikmal',
      role_title: 'Founder & Master Barber',
      badge: 'FOUNDER & MASTER',
      status: 'active',
      cuts_count: 1422,
      rating: '4.95',
      photo_url: 'assets/capster_south/ikmal.png',
      bio: 'Pendiri South Hair Studio, spesialis konsultasi bentuk wajah, perming korea, dan pewarnaan rambut pria.'
    },
    {
      id: 2,
      name: 'Abi',
      full_name: 'Abi Pratama',
      role_title: 'Senior Barber',
      badge: 'HOMIES BARBER',
      status: 'active',
      cuts_count: 981,
      rating: '4.90',
      photo_url: 'assets/capster_south/abi.png',
      bio: 'Ahli dalam taper fade, side part klasik, quiff, serta perawatan brewok dan kumis rapi.'
    },
    {
      id: 3,
      name: 'Rezky',
      full_name: 'Rezky Kurniawan',
      role_title: 'Senior Capster',
      badge: 'SENIOR CAPSTER',
      status: 'active',
      cuts_count: 851,
      rating: '4.92',
      photo_url: 'assets/capster_south/rezky.png',
      bio: 'Spesialis potongan clean fade, buzz cut, textured crop, dan styling rapi presisi.'
    }
  ]);
  const [capsterStatusFilter, setCapsterStatusFilter] = useState('all');

  // Products State
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'South Waterbased Pomade',
      category_name: 'Pomade & Clay',
      badge: 'BEST SELLER',
      price: 95000,
      stock: 24,
      weight_volume: '100 gram',
      image_url: 'assets/produk_south/pomade_clay.jpeg',
      short_desc: 'Formula waterbased dengan daya rekat super kuat dan aroma bubblegum segar yang digemari pelanggan South Hair Studio.'
    },
    {
      id: 2,
      name: 'South Dust It Hair Powder',
      category_name: 'Texture Powder',
      badge: 'TRENDING #1',
      price: 75000,
      stock: 35,
      weight_volume: '8 gram',
      image_url: 'assets/produk_south/powder.jpeg',
      short_desc: 'Hair powder penambah volume seketika yang memberikan tekstur matte natural tanpa efek berminyak atau lepek.'
    },
    {
      id: 3,
      name: 'South Kurl Cream Pro',
      category_name: 'Curly & Care',
      badge: 'STUDIO ESSENTIAL',
      price: 120000,
      stock: 18,
      weight_volume: '150 ml',
      image_url: 'assets/produk_south/curly.jpeg',
      short_desc: 'Krim perawatan dan styling khusus rambut ikal, keriting, maupun hasil perming / downperm di South Hair Studio.'
    }
  ]);
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editStockInput, setEditStockInput] = useState('');

  // Load user & studio data on mount
  useEffect(() => {
    // Validasi sesi aktif admin
    const token = sessionStorage.getItem('shs_auth_token');
    const isUnlocked = sessionStorage.getItem('shs_admin_unlocked') === 'true';

    if (!token || !isUnlocked) {
      handleLogout();
      return;
    }

    try {
      const stored = sessionStorage.getItem('shs_auth_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      } else {
        setCurrentUser({ username: 'superadmin', full_name: 'Kak Ikmal (Owner)', role: 'superadmin' });
      }
    } catch (e) {
      setCurrentUser({ username: 'superadmin', full_name: 'Kak Ikmal (Owner)', role: 'superadmin' });
    }
    loadBookings();
    loadStudioResources();

    // Supabase Realtime Listener untuk Booking baru
    let channel = null;
    if (isSupabaseConfigured) {
      try {
        channel = supabase
          .channel('realtime:bookings')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'bookings' },
            (payload) => {
              if (payload.new) {
                setBookings((prev) => {
                  if (prev.some((b) => b.id === payload.new.id || b.booking_code === payload.new.booking_code)) {
                    return prev;
                  }
                  return [payload.new, ...prev];
                });
                if (onShowToast) onShowToast(`Booking baru masuk: ${payload.new.customer_name} (${payload.new.booking_code})`);
              }
            }
          )
          .subscribe();
      } catch (subErr) {
        console.warn('Realtime subscription not active:', subErr);
      }
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const loadStudioResources = async () => {
    try {
      // Ambil langsung dari database Supabase
      const [sbSvc, sbCap, sbProd] = await Promise.all([
        getSupabaseServices(),
        getSupabaseCapsters(),
        getSupabaseProducts()
      ]);

      if (sbSvc && sbSvc.length > 0) {
        setServices(sbSvc.map((s) => ({
          ...s,
          duration: s.name.includes('Cut') ? '45 Menit' : s.name.includes('Down') ? '60 Menit' : s.name.includes('Perm') || s.name.includes('Color') ? '90-120 Menit' : '60 Menit'
        })));
      }

      if (sbCap && sbCap.length > 0) {
        setCapsters(sbCap);
      }

      if (sbProd && sbProd.length > 0) {
        setProducts(sbProd);
      }
    } catch (err) {
      console.error('Gagal memuat resource studio dari Supabase:', err);
    }
  };

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      // Ambil seluruh data booking dari Supabase
      const sbBookings = await getSupabaseBookings();
      if (sbBookings) {
        setBookings(sbBookings);
      }
    } catch (err) {
      console.error('Gagal memuat booking dari Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, patchData) => {
    // 1. Optimistic UI update
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...patchData } : b))
    );

    try {
      // 2. Langsung update ke database Supabase & sync data
      const res = await updateSupabaseBooking(bookingId, patchData);
      if (res && res.success && res.booking) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, ...res.booking } : b))
        );
      }
    } catch (e) {
      console.error('Gagal update booking di Supabase:', e);
    }

    if (onShowToast) onShowToast('Status booking & metode bayar tersimpan permanen!');
  };

  const handlePay = (booking, method) => {
    updateBookingStatus(booking.id, {
      payment_method: method,
      payment_status: 'paid',
      status: 'completed'
    });
  };

  const handleComplete = (booking) => {
    updateBookingStatus(booking.id, {
      status: 'completed',
      payment_status: 'paid',
      payment_method: booking.payment_method || 'tunai'
    });
  };

  const handleCancel = (booking) => {
    if (confirm(`Yakin ingin membatalkan antrean ${booking.booking_code}?`)) {
      updateBookingStatus(booking.id, {
        status: 'cancelled',
        payment_status: 'cancelled'
      });
    }
  };

  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    if (!walkinName.trim()) return;

    const [svcName, , price] = walkinService.split('|');
    const newBooking = {
      customer_name: walkinName.trim(),
      customer_phone: walkinPhone.trim() || '0821-WALKIN',
      service_name: svcName,
      capster_name: walkinCapster,
      booking_date: new Date().toISOString().split('T')[0],
      booking_time: `${new Date().getHours()}:00`,
      total_price: Number(price),
      notes: 'Walk-in Kasir'
    };

    try {
      // Simpan langsung ke database Supabase
      const sbResult = await createSupabaseBooking(newBooking);
      if (sbResult && sbResult.success && sbResult.booking) {
        setBookings((prev) => [sbResult.booking, ...prev]);
      }
    } catch (e) {
      console.error('Gagal tambah walk-in ke Supabase:', e);
    }

    setShowWalkinModal(false);
    setWalkinName('');
    setWalkinPhone('');
    if (onShowToast) onShowToast('Antrean walk-in berhasil dicatat di Supabase!');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('shs_auth_token');
    sessionStorage.removeItem('shs_auth_user');
    sessionStorage.removeItem('shs_admin_unlocked');

    if (onLogout) {
      onLogout();
    } else {
      window.location.hash = '#login';
    }
  };

  // Service Actions
  const handleOpenEditPrice = (svc) => {
    setEditingService(svc);
    setEditPriceInput(String(svc.price));
  };

  const handleSavePrice = async (e) => {
    e.preventDefault();
    if (!editingService) return;
    const newPrice = Number(editPriceInput);
    if (isNaN(newPrice) || newPrice < 0) return;

    try {
      // Simpan langsung perubahan tarif ke tabel services di Supabase
      await updateSupabaseServicePrice(editingService.id, newPrice);
    } catch (err) {
      console.error('Gagal update tarif di Supabase:', err);
    }

    setServices((prev) =>
      prev.map((s) => (s.id === editingService.id ? { ...s, price: newPrice } : s))
    );
    if (onShowToast) {
      onShowToast(`Tarif ${editingService.name} diubah menjadi Rp ${newPrice.toLocaleString('id-ID')} (Tersimpan di Supabase)`);
    }
    setEditingService(null);
  };

  // Capster Actions
  const handleToggleCapsterDuty = async (capster) => {
    const nextStatus = capster.status === 'active' ? 'off_duty' : 'active';
    try {
      // Simpan langsung status kerja barber ke tabel capsters di Supabase
      await updateSupabaseCapsterStatus(capster.id, nextStatus);
    } catch (err) {
      console.error('Gagal update status capster di Supabase:', err);
    }

    setCapsters((prev) =>
      prev.map((c) => (c.id === capster.id ? { ...c, status: nextStatus } : c))
    );
    if (onShowToast) {
      onShowToast(
        `Status ${capster.name} sekarang: ${
          nextStatus === 'active' ? 'Sedang Bertugas' : 'Libur / Istirahat'
        } (Supabase synced)`
      );
    }
  };

  const handleViewCapsterBookings = (capsterName) => {
    setActiveTab('bookings');
    setFilterStatus('all');
    setSearchQuery(capsterName);
  };

  // Product Actions
  const handleAdjustStockDelta = async (prod, delta) => {
    const nextStock = Math.max(0, (prod.stock || 0) + delta);
    try {
      // Simpan langsung ke tabel products di Supabase
      await updateSupabaseProductStock(prod.id, nextStock);
    } catch (err) {
      console.error('Gagal update stok di Supabase:', err);
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, stock: nextStock } : p))
    );
    if (onShowToast) {
      onShowToast(`Stok ${prod.name} disesuaikan: ${nextStock} pcs (Supabase synced)`);
    }
  };

  const handleOpenEditStock = (prod) => {
    setEditingProduct(prod);
    setEditStockInput(String(prod.stock || 0));
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    const newStock = Math.max(0, parseInt(editStockInput, 10) || 0);

    try {
      // Simpan langsung stok ke Supabase
      await updateSupabaseProductStock(editingProduct.id, newStock);
    } catch (err) {
      console.error('Gagal simpan stok di Supabase:', err);
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? { ...p, stock: newStock } : p))
    );
    if (onShowToast) {
      onShowToast(`Stok ${editingProduct.name} diperbarui: ${newStock} pcs (Tersimpan di Supabase)`);
    }
    setEditingProduct(null);
  };

  // Filtered Services
  const filteredServices = services.filter((s) => {
    if (serviceCatFilter === 'potong' && !s.name.toLowerCase().includes('cut')) return false;
    if (serviceCatFilter === 'coloring' && !s.name.toLowerCase().includes('color')) return false;
    if (serviceCatFilter === 'chemical' && !s.name.toLowerCase().includes('perm')) return false;

    if (serviceSearch.trim()) {
      const q = serviceSearch.toLowerCase();
      const n = (s.name || '').toLowerCase();
      const d = (s.description || '').toLowerCase();
      return n.includes(q) || d.includes(q);
    }
    return true;
  });

  // Filtered Capsters
  const filteredCapsters = capsters.filter((c) => {
    if (capsterStatusFilter === 'active' && c.status !== 'active') return false;
    if (capsterStatusFilter === 'off_duty' && c.status === 'active') return false;
    return true;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const cat = (p.category_name || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    if (productCatFilter === 'pomade' && !cat.includes('pomade') && !name.includes('pomade')) return false;
    if (productCatFilter === 'powder' && !cat.includes('powder') && !name.includes('powder')) return false;
    if (productCatFilter === 'curly' && !cat.includes('curly') && !cat.includes('care') && !name.includes('kurl')) return false;

    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return name.includes(q) || (p.short_desc || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Helpers for Commissions & Bookings Price Normalization
  const normalizeCapsterName = (name) => {
    if (!name) return 'Lainnya';
    const clean = String(name).trim();
    const lower = clean.toLowerCase();
    if (lower.includes('ikmal')) return 'Kak Ikmal';
    if (lower.includes('abi')) return 'Abi';
    if (lower.includes('rezky') || lower.includes('resky')) return 'Rezky';
    return clean;
  };

  const getBookingPrice = (b) => {
    const p = Number(b.total_amount || b.service_price || b.total_price || 0);
    return isNaN(p) ? 0 : p;
  };

  // Calculations
  const totalSessions = bookings.length;
  const cashTotal = bookings
    .filter((b) => b.payment_method === 'tunai' && (b.payment_status === 'paid' || b.status === 'completed'))
    .reduce((acc, curr) => acc + getBookingPrice(curr), 0);
  const qrisTotal = bookings
    .filter((b) => b.payment_method === 'qris' && (b.payment_status === 'paid' || b.status === 'completed'))
    .reduce((acc, curr) => acc + getBookingPrice(curr), 0);
  const revenueTotal = cashTotal + qrisTotal;

  const countWait = bookings.filter((b) => b.status === 'pending' || b.payment_status === 'unpaid').length;
  const countDone = bookings.filter((b) => b.status === 'completed' || b.payment_status === 'paid').length;
  const countCancel = bookings.filter((b) => b.status === 'cancelled').length;

  const filteredBookings = bookings.filter((b) => {
    // Tab filter
    if (filterStatus === 'wait' && b.status !== 'pending' && b.payment_status !== 'unpaid') return false;
    if (filterStatus === 'done' && b.status !== 'completed' && b.payment_status !== 'paid') return false;
    if (filterStatus === 'cancel' && b.status !== 'cancelled') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const code = (b.booking_code || '').toLowerCase();
      const name = (b.customer_name || '').toLowerCase();
      const cap = (b.capster_name || '').toLowerCase();
      const svc = (b.service_name || '').toLowerCase();
      return code.includes(q) || name.includes(q) || cap.includes(q) || svc.includes(q);
    }
    return true;
  });

  // ============================================================================
  // COMMISSION SYSTEM COMPUTATION
  // ============================================================================
  const todayDateStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const currentMonthPrefix = todayDateStr.substring(0, 7); // 'YYYY-MM'

  // Filter bookings for Commission calculation
  const commEligibleBookings = bookings.filter((b) => {
    // 1. Status scope
    const isDone = b.status === 'completed' || b.payment_status === 'paid';
    if (commStatusScope === 'completed_only' && !isDone) return false;
    if (commStatusScope === 'all_active' && b.status === 'cancelled') return false;

    // 2. Capster filter
    if (commCapsterFilter !== 'all') {
      if (normalizeCapsterName(b.capster_name) !== commCapsterFilter) return false;
    }

    // 3. Date / Period filter
    const bDate = b.booking_date ? String(b.booking_date).split('T')[0] : '';
    if (commPeriodFilter === 'today') {
      if (bDate !== todayDateStr) return false;
    } else if (commPeriodFilter === '7days') {
      if (!bDate) return false;
      const d = new Date(bDate);
      if (d < sevenDaysAgo || d > now) return false;
    } else if (commPeriodFilter === 'month') {
      if (!bDate || !bDate.startsWith(currentMonthPrefix)) return false;
    } else if (commPeriodFilter === 'custom') {
      if (bDate !== commCustomDate) return false;
    }

    // 4. Search query within commission tab
    if (commSearchQuery.trim()) {
      const q = commSearchQuery.toLowerCase();
      const code = (b.booking_code || '').toLowerCase();
      const name = (b.customer_name || '').toLowerCase();
      const cap = (b.capster_name || '').toLowerCase();
      const svc = (b.service_name || '').toLowerCase();
      return code.includes(q) || name.includes(q) || cap.includes(q) || svc.includes(q);
    }

    return true;
  });

  // Commission Totals
  const commTotalGross = commEligibleBookings.reduce((sum, b) => sum + getBookingPrice(b), 0);
  const commCapsterShareTotal = Math.round(commTotalGross * (commissionRate / 100));
  const commStudioShareTotal = commTotalGross - commCapsterShareTotal;
  const commTotalHeads = commEligibleBookings.length;
  const commAvgPerHead = commTotalHeads > 0 ? Math.round(commTotalGross / commTotalHeads) : 0;

  // Aggregate by Capster
  const capsterCommissionsList = capsters.map((cap) => {
    const normalizedName = normalizeCapsterName(cap.name);
    const capBookings = commEligibleBookings.filter(
      (b) => normalizeCapsterName(b.capster_name) === normalizedName
    );
    const heads = capBookings.length;
    const gross = capBookings.reduce((sum, b) => sum + getBookingPrice(b), 0);
    const capsterCommission = Math.round(gross * (commissionRate / 100));
    const studioShare = gross - capsterCommission;

    const serviceCounts = {};
    capBookings.forEach((b) => {
      const sName = b.service_name || 'Hair Cut';
      serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
    });

    const cashShare = capBookings
      .filter((b) => b.payment_method === 'tunai')
      .reduce((s, b) => s + getBookingPrice(b), 0);
    const qrisShare = capBookings
      .filter((b) => b.payment_method === 'qris')
      .reduce((s, b) => s + getBookingPrice(b), 0);

    return {
      ...cap,
      heads,
      gross,
      capsterCommission,
      studioShare,
      serviceCounts,
      cashShare,
      qrisShare,
      bookings: capBookings
    };
  });

  // WhatsApp Slip Generator
  const generateWhatsAppMessage = (capItem) => {
    let periodText = 'Semua Riwayat Transaksi';
    if (commPeriodFilter === 'today') periodText = `Hari Ini (${todayDateStr})`;
    else if (commPeriodFilter === '7days') periodText = '7 Hari Terakhir';
    else if (commPeriodFilter === 'month') periodText = `Bulan Ini (${currentMonthPrefix})`;
    else if (commPeriodFilter === 'custom') periodText = `Tanggal ${commCustomDate}`;

    const serviceLines = Object.entries(capItem.serviceCounts)
      .map(([svc, count]) => `• ${svc}: ${count} Kepala`)
      .join('\n');

    return (
`💈 *SLIP KOMISI CAPSTER - SOUTH HAIR STUDIO* 💈
Jl. Andi Djemma No. 45, Kota Palopo, Sulawesi Selatan
------------------------------------------------
📅 *Periode:* ${periodText}
✂️ *Nama Capster:* ${capItem.name} (${capItem.role_title || capItem.badge || 'Barber'})
⚖️ *Skema Komisi:* ${commissionRate}% Capster : ${100 - commissionRate}% Kas Studio
------------------------------------------------
💇‍♂️ *TOTAL KEPALA / SESI:* ${capItem.heads} Kepala
📋 *RINCIAN PENGERJAAN:*
${serviceLines || '• Belum ada layanan tercatat'}
------------------------------------------------
💵 *Total Omset Jasa:* Rp ${capItem.gross.toLocaleString('id-ID')}
🏢 *Bagian Kas Studio (${100 - commissionRate}%):* Rp ${capItem.studioShare.toLocaleString('id-ID')}
------------------------------------------------
🔥 *HAK KOMISI DITERIMA (${commissionRate}%):*
👉 *Rp ${capItem.capsterCommission.toLocaleString('id-ID')}*
------------------------------------------------
Terima kasih atas dedikasi dan kerapian hasil cukurmu hari ini! Tetap solid & presisi bersama South Hair Studio Kota Palopo. 💈🔥`
    );
  };

  const handleSendWhatsAppSlip = (capItem) => {
    const text = generateWhatsAppMessage(capItem);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopySlipText = (capItem) => {
    const text = generateWhatsAppMessage(capItem);
    navigator.clipboard.writeText(text);
    setCopiedWaId(capItem.name);
    setTimeout(() => setCopiedWaId(null), 2500);
    if (onShowToast) onShowToast(`Slip komisi ${capItem.name} disalin ke clipboard!`);
  };

  const handleOpenThermalSlip = (capItem) => {
    let periodText = 'Semua Riwayat Transaksi';
    if (commPeriodFilter === 'today') periodText = `Hari Ini (${todayDateStr})`;
    else if (commPeriodFilter === '7days') periodText = '7 Hari Terakhir';
    else if (commPeriodFilter === 'month') periodText = `Bulan Ini (${currentMonthPrefix})`;
    else if (commPeriodFilter === 'custom') periodText = `Tanggal ${commCustomDate}`;

    setThermalReceiptData({
      capster: capItem,
      period: periodText,
      rate: commissionRate,
      generatedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    });
  };

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', background: '#f4f4f6', color: '#09090b', width: '100%', minWidth: '100%', boxSizing: 'border-box' }}>
      {/* SIDEBAR (MODERN OBSIDIAN DESIGN - IMAGE 4 MATCH) */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`} id="sidebar">
        <div className="sidebar-main-group">
          {/* Top Brand Bar */}
          <div className="sidebar-top-bar">
            <a
              href="#"
              className="sidebar-brand-pill"
              title="South Hair Studio • Buka Website Publik"
              onClick={(e) => {
                e.preventDefault();
                if (onBackToHome) onBackToHome();
                else window.location.hash = '';
              }}
            >
              <img src="assets/logo_south.png" alt="Logo South Hair Studio" className="sidebar-brand-icon" />
              <span className="sidebar-brand-text">South Studio</span>
            </a>
            <button
              type="button"
              className="sidebar-collapse-btn"
              title={isSidebarCollapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
              onClick={toggleSidebarCollapse}
              aria-label={isSidebarCollapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
            >
              {isSidebarCollapsed ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="15" y1="3" x2="15" y2="21"/><polyline points="9 9 12 12 9 15"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              )}
            </button>
          </div>

          {/* Sidebar Quick Search Box matching Image 4 */}
          <div
            className="sidebar-search-wrap"
            title={isSidebarCollapsed ? "Pencarian Cepat" : undefined}
            onClick={() => {
              if (isSidebarCollapsed) toggleSidebarCollapse();
            }}
          >
            <div className="sidebar-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                className="sidebar-search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'bookings') setActiveTab('bookings');
                }}
              />
              <kbd className="sidebar-search-kbd">&#8984; K</kbd>
            </div>
          </div>

          {/* Section 1: Platform */}
          <div className="sidebar-section-title">Platform</div>
          <div className="sidebar-nav" role="navigation">
            <a
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
              title="Dashboard"
            >
              <div className="nav-item-left">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                <span>Dashboard</span>
              </div>
            </a>
            <a
              className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
              title="Antrian & Kasir"
            >
              <div className="nav-item-left">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>Antrian &amp; Kasir</span>
              </div>
            </a>
            <a
              className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
              title="Layanan & Tarif"
            >
              <div className="nav-item-left">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
                <span>Layanan &amp; Tarif</span>
              </div>
            </a>
          </div>

          {/* Section 2: Studio Management */}
          <div className="sidebar-section-title" style={{ marginTop: '10px' }}>Studio</div>
          <div className="sidebar-nav" role="navigation">
            <a
              className={`nav-item ${activeTab === 'commissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('commissions')}
              title="Komisi Capster"
            >
              <div className="nav-item-left">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>Komisi Capster</span>
              </div>
              <span className="sidebar-badge-auto">AUTO</span>
            </a>
            <a
              className={`nav-item ${activeTab === 'capsters' ? 'active' : ''}`}
              onClick={() => setActiveTab('capsters')}
              title="Tim Capster"
            >
              <div className="nav-item-left">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>Tim Capster</span>
              </div>
            </a>
            <a
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
              title="Katalog & Stok"
            >
              <div className="nav-item-left">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                <span>Katalog &amp; Stok</span>
              </div>
            </a>
          </div>

          {/* Studio status widget card matching Image 4 */}
          <div className="sidebar-widget-card" title="Studio Operasional: 10:00 - 22:00 WITA, Kota Palopo">
            <div className="sidebar-widget-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>Studio Operasional</span>
            </div>
            <ul className="sidebar-widget-list">
              <li>10:00 - 22:00 WITA</li>
              <li>Kota Palopo, Sul-Sel</li>
              <li>Kasir &amp; Booking Live</li>
            </ul>
          </div>
        </div>

        {/* Sidebar User Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-pill" title={`${currentUser ? currentUser.full_name : 'Kak Ikmal'} (${currentUser ? currentUser.role : 'Superadmin'})`}>
            <div className="sidebar-user-avatar">
              {currentUser?.full_name ? currentUser.full_name.substring(0, 2).toUpperCase() : 'KI'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {currentUser ? currentUser.full_name : 'Kak Ikmal'}
              </span>
              <span className="sidebar-user-role">
                {currentUser ? currentUser.role : 'Superadmin'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
            title="Keluar dari Admin Dashboard"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`admin-main-viewport ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar Header matching Image 4 */}
        <div className="admin-top-header">
          <div className="admin-header-title-wrap">
            <h1>
              {activeTab === 'overview' && 'Ringkasan Studio'}
              {activeTab === 'bookings' && 'Antrian & Kasir'}
              {activeTab === 'commissions' && 'Sistem Perhitungan Komisi Capster'}
              {activeTab === 'services' && 'Katalog Layanan & Tarif'}
              {activeTab === 'capsters' && 'Manajemen Tim Capster'}
              {activeTab === 'products' && 'Inventori & Stok Produk'}
            </h1>
            <p>
              {activeTab === 'commissions'
                ? 'South Hair Studio Kota Palopo • Bagi Hasil Layanan Otomatis, Rekap Harian & Cetak Slip WhatsApp'
                : 'South Hair Studio Kota Palopo • Sistem Kasir & Booking Realtime'}
            </p>
          </div>

          <div className="admin-top-actions">
            <button
              className="btn-walkin-main"
              onClick={() => setShowWalkinModal(true)}
            >
              + Walk-In Booking
            </button>
            <button
              className="btn-public-pill"
              onClick={() => {
                if (onBackToHome) onBackToHome();
                else window.location.hash = '';
              }}
            >
              Buka Web Publik &rarr;
            </button>
          </div>
        </div>

        {/* PILIHAN MENU STUDIO BERJEJER (SEMUA TAMPIL TERBUKA) */}
        <div className="admin-nav-tabs-bar">
          <button
            type="button"
            className={`admin-nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Ringkasan Studio</span>
          </button>
          <button
            type="button"
            className={`admin-nav-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Antrian &amp; Kasir</span>
          </button>
          <button
            type="button"
            className={`admin-nav-tab-btn ${activeTab === 'commissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('commissions')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>Komisi Capster</span>
          </button>
          <button
            type="button"
            className={`admin-nav-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
            <span>Layanan &amp; Tarif</span>
          </button>
          <button
            type="button"
            className={`admin-nav-tab-btn ${activeTab === 'capsters' ? 'active' : ''}`}
            onClick={() => setActiveTab('capsters')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Tim Capster</span>
          </button>
          <button
            type="button"
            className={`admin-nav-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <span>Katalog &amp; Stok</span>
          </button>
        </div>

        {/* STATS PANEL CARDS (IMAGE 4 METRIC STYLE) */}
        {activeTab === 'overview' && (
          <div className="stat-grid" style={{ marginBottom: '28px' }}>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Total Sesi Masuk</span>
                <span className="stat-pill-badge blue">&#8599; Live</span>
              </div>
              <div className="stat-value">{totalSessions}</div>
              <div className="stat-sub">Semua sesi jadwal hari ini</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Rekap Tunai (Kasir)</span>
                <span className="stat-pill-badge amber">&#9679; Tunai</span>
              </div>
              <div className="stat-value">Rp {cashTotal.toLocaleString('id-ID')}</div>
              <div className="stat-sub">Tercatat di laci kasir studio</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Rekap QRIS (Mutasi)</span>
                <span className="stat-pill-badge purple">&#9679; QRIS</span>
              </div>
              <div className="stat-value">Rp {qrisTotal.toLocaleString('id-ID')}</div>
              <div className="stat-sub">Tercatat di akun bank QRIS</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Total Omzet Lunas</span>
                <span className="stat-pill-badge green">&#8599; Lunas</span>
              </div>
              <div className="stat-value" style={{ color: '#059669' }}>
                Rp {revenueTotal.toLocaleString('id-ID')}
              </div>
              <div className="stat-sub">Gabungan Tunai &amp; QRIS lunas</div>
            </div>
          </div>
        )}

        {/* BOOKINGS TABLE SECTION (TABS: OVERVIEW & BOOKINGS) */}
        {(activeTab === 'overview' || activeTab === 'bookings') && (
          <div className="panel-box" style={{ background: 'var(--surface-card)', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div className="filter-tabs">
                <button
                  className={`filter-tab-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  Semua ({totalSessions})
                </button>
                <button
                  className={`filter-tab-btn ${filterStatus === 'wait' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('wait')}
                >
                  Menunggu ({countWait})
                </button>
                <button
                  className={`filter-tab-btn ${filterStatus === 'done' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('done')}
                >
                  Selesai ({countDone})
                </button>
                <button
                  className={`filter-tab-btn ${filterStatus === 'cancel' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('cancel')}
                >
                  Dibatalkan ({countCancel})
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="custom-input"
                  style={{ padding: '8px 12px 8px 32px', width: '220px', fontSize: '13px' }}
                  placeholder="Cari kode / nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                  &#128269;
                </span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kode Tiket</th>
                    <th>Jadwal Sesi</th>
                    <th>Nama Pelanggan</th>
                    <th>Capster</th>
                    <th>Layanan &amp; Tarif</th>
                    <th>Status Antrean</th>
                    <th>Metode Bayar</th>
                    <th>Aksi Kasir</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                        Tidak ada data antrean yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const isPaid = b.payment_status === 'paid' || b.status === 'completed';
                      const isWait = b.status === 'pending' && !isPaid;
                      const isCancel = b.status === 'cancelled';

                      return (
                        <tr key={b.id || b.booking_code}>
                          <td><b>{b.booking_code}</b></td>
                          <td>
                            {b.booking_date}
                            <br />
                            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                              {b.booking_time} WITA
                            </span>
                          </td>
                          <td>
                            <b>{b.customer_name}</b>
                            <br />
                            <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                              {b.customer_phone}
                            </span>
                          </td>
                          <td>
                            {b.capster_name}
                            <br />
                            <span style={{ color: 'var(--muted-dark)', fontSize: '11px' }}>Barber</span>
                          </td>
                          <td>
                            {b.service_name}
                            <br />
                            <b style={{ color: 'var(--accent)' }}>
                              Rp {Number(b.total_price || 50000).toLocaleString('id-ID')}
                            </b>
                          </td>
                          <td>
                            {isCancel ? (
                              <span className="badge-status cancel">Dibatalkan</span>
                            ) : isPaid ? (
                              <span className="badge-status done">Selesai Lunas</span>
                            ) : (
                              <span className="badge-status wait">Menunggu Cukur</span>
                            )}
                          </td>
                          <td>
                            {b.payment_method === 'tunai' && <span className="badge-pay cash">Tunai (Kasir)</span>}
                            {b.payment_method === 'qris' && <span className="badge-pay qris">QRIS Berhasil</span>}
                            {(!b.payment_method || b.payment_method === 'none') && (
                              <span className="badge-pay none">Belum Bayar</span>
                            )}
                          </td>
                          <td>
                            <div className="cashier-actions">
                              {!isPaid && !isCancel && (
                                <>
                                  <button
                                    className="btn-act pay-cash"
                                    onClick={() => handlePay(b, 'tunai')}
                                    title="Bayar Tunai di Kasir"
                                  >
                                    Tunai
                                  </button>
                                  <button
                                    className="btn-act pay-qris"
                                    onClick={() => handlePay(b, 'qris')}
                                    title="Bayar via QRIS"
                                  >
                                    QRIS
                                  </button>
                                </>
                              )}
                              {isPaid && b.status !== 'completed' && (
                                <button
                                  className="btn-act pay-cash"
                                  onClick={() => handleComplete(b)}
                                  title="Tandai Selesai Cukur"
                                >
                                  Selesai
                                </button>
                              )}
                              {!isCancel && (
                                <button
                                  className="btn-act cancel-btn"
                                  onClick={() => handleCancel(b)}
                                  title="Batalkan Booking"
                                >
                                  Batal
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="panel-box" style={{ background: 'var(--surface-card)', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', width: '100%', boxSizing: 'border-box' }}>
            <div className="admin-module-header">
              <div className="admin-module-title-group">
                <h3>Katalog Layanan &amp; Tarif Studio</h3>
                <p>Kelola tarif pengerjaan, estimasi durasi potong rambut, dan deskripsi treatment</p>
              </div>
              <div className="admin-module-actions">
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="custom-input"
                    style={{ padding: '8px 12px 8px 32px', width: '220px', fontSize: '13px' }}
                    placeholder="Cari nama layanan..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                  />
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                    &#128269;
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Categories */}
            <div className="module-filter-bar">
              <button
                type="button"
                className={`filter-chip-btn ${serviceCatFilter === 'all' ? 'active' : ''}`}
                onClick={() => setServiceCatFilter('all')}
              >
                Semua Layanan ({services.length})
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${serviceCatFilter === 'potong' ? 'active' : ''}`}
                onClick={() => setServiceCatFilter('potong')}
              >
                Potong &amp; Styling
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${serviceCatFilter === 'coloring' ? 'active' : ''}`}
                onClick={() => setServiceCatFilter('coloring')}
              >
                Coloring &amp; Highlight
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${serviceCatFilter === 'chemical' ? 'active' : ''}`}
                onClick={() => setServiceCatFilter('chemical')}
              >
                Chemical Perming
              </button>
            </div>

            <div className="admin-services-grid">
              {filteredServices.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--muted)', gridColumn: '1 / -1' }}>
                  Tidak ada layanan yang sesuai kriteria pencarian.
                </div>
              ) : (
                filteredServices.map((svc) => (
                  <div key={svc.id || svc.name} className="admin-service-card-modern">
                    <div className="service-banner-wrap">
                      <img
                        src={svc.image_url || 'assets/layanan_south/hair_cut.png'}
                        alt={svc.name}
                        className="service-banner-img"
                      />
                      <div className="service-banner-overlay">
                        <div className="service-banner-top-row">
                          <span className="service-badge-pill">
                            {svc.category_name || (svc.name.includes('Cut') ? 'POTONG & STYLING' : svc.name.includes('Color') ? 'COLORING' : 'PERM')}
                          </span>
                          <span className="service-duration-pill">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {svc.duration || '45 Menit'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                          <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: 600 }}>Aktif di Website</span>
                        </div>
                      </div>
                    </div>

                    <div className="service-card-body">
                      <div>
                        <h4 className="service-title-text" title={svc.name}>{svc.name}</h4>
                        <p className="service-desc-text">{svc.description}</p>
                      </div>

                      <div className="service-footer-row">
                        <div>
                          <div className="service-price-lbl">Tarif Layanan</div>
                          <div className="service-price-val">Rp {Number(svc.price).toLocaleString('id-ID')}</div>
                        </div>
                        <button
                          type="button"
                          className="service-edit-btn"
                          onClick={() => handleOpenEditPrice(svc)}
                          title="Ubah tarif layanan"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"/>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                          </svg>
                          <span>Ubah Tarif</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CAPSTERS TAB */}
        {activeTab === 'capsters' && (
          <div className="panel-box" style={{ background: 'var(--surface-card)', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', width: '100%', boxSizing: 'border-box' }}>
            <div className="admin-module-header">
              <div className="admin-module-title-group">
                <h3>Tim Capster South Hair Studio</h3>
                <p>Status kehadiran kursi cukur, spesialisasi barber, dan pencatatan sesi pengerjaan</p>
              </div>
              <div className="module-filter-bar" style={{ marginBottom: 0 }}>
                <button
                  type="button"
                  className={`filter-chip-btn ${capsterStatusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCapsterStatusFilter('all')}
                >
                  Semua ({capsters.length})
                </button>
                <button
                  type="button"
                  className={`filter-chip-btn ${capsterStatusFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setCapsterStatusFilter('active')}
                >
                  Sedang Bertugas ({capsters.filter((c) => c.status === 'active').length})
                </button>
                <button
                  type="button"
                  className={`filter-chip-btn ${capsterStatusFilter === 'off_duty' ? 'active' : ''}`}
                  onClick={() => setCapsterStatusFilter('off_duty')}
                >
                  Libur ({capsters.filter((c) => c.status !== 'active').length})
                </button>
              </div>
            </div>

            <div className="admin-capsters-grid">
              {filteredCapsters.map((c) => {
                const isOnline = c.status === 'active';
                return (
                  <div key={c.id || c.name} className="admin-capster-card-modern">
                    <div className="capster-banner-wrap">
                      <img
                        src={c.photo_url || `assets/capster_south/${c.name.toLowerCase().includes('ikmal') ? 'ikmal' : c.name.toLowerCase()}.png`}
                        alt={c.name}
                        className="capster-banner-img"
                      />
                      <div className="capster-banner-overlay">
                        <div className="capster-banner-top-row">
                          <span className={`capster-duty-pill ${isOnline ? 'online' : 'offline'}`}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOnline ? '#22c55e' : '#71717a' }} />
                            {isOnline ? 'Standby di Kursi' : 'Sedang Libur'}
                          </span>
                          <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: '6px', backdropFilter: 'blur(6px)' }}>
                            &#9733; {c.rating || '4.95'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="capster-card-body">
                      <div>
                        <h3 className="capster-name-h3">{c.name}</h3>
                        <div className="capster-subname">{c.full_name || c.role_title}</div>
                        <span className="capster-role-tag">{c.badge || c.role_title}</span>

                        <div className="capster-stats-grid">
                          <div className="capster-stat-col">
                            <span className="capster-stat-val">{c.cuts_count || 850}+</span>
                            <span className="capster-stat-lbl">Sesi Cukur</span>
                          </div>
                          <div className="capster-stat-col">
                            <span className="capster-stat-val" style={{ color: '#f59e0b' }}>&#9733; {c.rating || '4.95'}</span>
                            <span className="capster-stat-lbl">Rating Tamu</span>
                          </div>
                        </div>

                        <p className="capster-bio-text">{c.bio || c.spec}</p>
                      </div>

                      <div className="capster-actions-row">
                        <button
                          type="button"
                          className={`capster-duty-btn ${isOnline ? 'duty-on' : 'duty-off'}`}
                          onClick={() => handleToggleCapsterDuty(c)}
                          title="Klik untuk mengubah status bertugas"
                        >
                          {isOnline ? 'Bertugas (Aktif)' : 'Libur / Istirahat'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '12px', padding: '9px 14px', borderRadius: '8px' }}
                          onClick={() => handleViewCapsterBookings(c.name)}
                        >
                          Antrean &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="panel-box" style={{ background: 'var(--surface-card)', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', width: '100%', boxSizing: 'border-box' }}>
            <div className="admin-module-header">
              <div className="admin-module-title-group">
                <h3>Katalog &amp; Inventori Stok Grooming</h3>
                <p>Pantau jumlah stok pomade, hair powder, dan kurl cream dengan kontrol cepat +1 / -1</p>
              </div>
              <div className="admin-module-actions">
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="custom-input"
                    style={{ padding: '8px 12px 8px 32px', width: '220px', fontSize: '13px' }}
                    placeholder="Cari produk grooming..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                    &#128269;
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Categories */}
            <div className="module-filter-bar">
              <button
                type="button"
                className={`filter-chip-btn ${productCatFilter === 'all' ? 'active' : ''}`}
                onClick={() => setProductCatFilter('all')}
              >
                Semua Produk ({products.length})
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${productCatFilter === 'pomade' ? 'active' : ''}`}
                onClick={() => setProductCatFilter('pomade')}
              >
                Pomade &amp; Clay
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${productCatFilter === 'powder' ? 'active' : ''}`}
                onClick={() => setProductCatFilter('powder')}
              >
                Texture Powder
              </button>
              <button
                type="button"
                className={`filter-chip-btn ${productCatFilter === 'curly' ? 'active' : ''}`}
                onClick={() => setProductCatFilter('curly')}
              >
                Curly &amp; Care
              </button>
            </div>

            <div className="admin-products-grid">
              {filteredProducts.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--muted)', gridColumn: '1 / -1' }}>
                  Tidak ada produk yang sesuai kriteria pencarian.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const stockNum = Number(p.stock) || 0;
                  const isSafe = stockNum > 20;
                  const isLow = stockNum > 0 && stockNum <= 20;
                  const isOut = stockNum === 0;

                  return (
                    <div key={p.id || p.name} className="admin-product-card-modern">
                      <div className="product-banner-wrap">
                        <img
                          src={p.image_url || 'assets/produk_south/pomade_clay.jpeg'}
                          alt={p.name}
                          className="product-banner-img"
                        />
                        <span className="product-badge-float">{p.badge || 'ORIGINAL'}</span>
                        <span className="product-weight-float">{p.weight_volume || '100 gr'}</span>
                      </div>

                      <div className="product-card-body">
                        <div>
                          <h3 className="product-name-h3">{p.name}</h3>
                          <div className="product-price-h4">Rp {Number(p.price).toLocaleString('id-ID')}</div>
                          <p className="product-desc-text">{p.short_desc || p.desc}</p>
                        </div>

                        <div>
                          <div className="product-stock-row">
                            <span className={`stock-badge-tag ${isSafe ? 'safe' : isLow ? 'low' : 'out'}`}>
                              {isSafe && 'Stok Aman'}
                              {isLow && 'Stok Terbatas'}
                              {isOut && 'Stok Habis'}
                            </span>

                            <div className="stock-stepper-wrap">
                              <button
                                type="button"
                                className="stepper-btn-act"
                                onClick={() => handleAdjustStockDelta(p, -1)}
                                disabled={stockNum <= 0}
                                title="Kurangi stok (-1)"
                              >
                                -
                              </button>
                              <span className="stock-num-val">{stockNum} pcs</span>
                              <button
                                type="button"
                                className="stepper-btn-act"
                                onClick={() => handleAdjustStockDelta(p, 1)}
                                title="Tambah stok (+1)"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="product-manage-stock-btn"
                            onClick={() => handleOpenEditStock(p)}
                          >
                            Atur Jumlah Stok &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* COMMISSIONS TAB (SISTEM PERHITUNGAN KOMISI CAPSTER OTOMATIS) */}
        {activeTab === 'commissions' && (
          <div className="comm-view-container">
            {/* Top Config & Filter Panel */}
            <div className="comm-controls-card">
              <div className="comm-controls-header">
                <div className="comm-controls-title-group">
                  <div className="comm-icon-tag">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <div>
                    <h2 className="comm-controls-h2">Sistem Skema Bagi Hasil &amp; Filter Periode</h2>
                    <p className="comm-controls-sub">Sesuaikan rasio bagi hasil layanan dan filter transaksi untuk rekap komisi otomatis.</p>
                  </div>
                </div>

                {/* Print whole report trigger */}
                <button
                  type="button"
                  className="comm-btn-export"
                  onClick={() => window.print()}
                  title="Cetak Laporan Rekap Komisi"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  <span>Cetak Rekap Kas</span>
                </button>
              </div>

              <div className="comm-controls-grid">
                {/* 1. Commission Split Config */}
                <div className="comm-control-box">
                  <label className="comm-control-label">
                    <span>Skema Bagi Hasil Jasa:</span>
                    <span className="comm-split-highlight">
                      Capster <b>{commissionRate}%</b> &bull; Kas Studio <b>{100 - commissionRate}%</b>
                    </span>
                  </label>
                  <div className="comm-presets-row">
                    <button
                      type="button"
                      className={`comm-preset-btn ${commissionRate === 40 ? 'active' : ''}`}
                      onClick={() => setCommissionRate(40)}
                    >
                      40% : 60%
                    </button>
                    <button
                      type="button"
                      className={`comm-preset-btn ${commissionRate === 50 ? 'active' : ''}`}
                      onClick={() => setCommissionRate(50)}
                    >
                      50% : 50% (Standar)
                    </button>
                    <button
                      type="button"
                      className={`comm-preset-btn ${commissionRate === 60 ? 'active' : ''}`}
                      onClick={() => setCommissionRate(60)}
                    >
                      60% : 40%
                    </button>
                  </div>
                  <div className="comm-slider-wrap">
                    <input
                      type="range"
                      min="30"
                      max="75"
                      step="5"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="comm-range-slider"
                      title="Geser untuk menyesuaikan persentase hak capster"
                    />
                    <div className="comm-slider-scale">
                      <span>30% Capster</span>
                      <span>50% Standar</span>
                      <span>75% Capster</span>
                    </div>
                  </div>
                </div>

                {/* 2. Date Filter */}
                <div className="comm-control-box">
                  <label className="comm-control-label">
                    <span>Filter Periode Transaksi:</span>
                  </label>
                  <div className="comm-period-row">
                    <button
                      type="button"
                      className={`comm-period-btn ${commPeriodFilter === 'today' ? 'active' : ''}`}
                      onClick={() => setCommPeriodFilter('today')}
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      className={`comm-period-btn ${commPeriodFilter === '7days' ? 'active' : ''}`}
                      onClick={() => setCommPeriodFilter('7days')}
                    >
                      7 Hari
                    </button>
                    <button
                      type="button"
                      className={`comm-period-btn ${commPeriodFilter === 'month' ? 'active' : ''}`}
                      onClick={() => setCommPeriodFilter('month')}
                    >
                      Bulan Ini
                    </button>
                    <button
                      type="button"
                      className={`comm-period-btn ${commPeriodFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setCommPeriodFilter('all')}
                    >
                      Semua Waktu
                    </button>
                  </div>
                  <div className="comm-date-picker-row">
                    <span className="comm-picker-lbl">Pilih Tanggal:</span>
                    <input
                      type="date"
                      className="custom-input comm-date-input"
                      value={commCustomDate}
                      onChange={(e) => {
                        setCommCustomDate(e.target.value);
                        setCommPeriodFilter('custom');
                      }}
                    />
                  </div>
                </div>

                {/* 3. Scope & Capster Filter */}
                <div className="comm-control-box">
                  <label className="comm-control-label">
                    <span>Lingkup Transaksi &amp; Barber:</span>
                  </label>
                  <div className="comm-scope-row">
                    <button
                      type="button"
                      className={`comm-scope-btn ${commStatusScope === 'completed_only' ? 'active' : ''}`}
                      onClick={() => setCommStatusScope('completed_only')}
                    >
                      Hanya Lunas / Selesai
                    </button>
                    <button
                      type="button"
                      className={`comm-scope-btn ${commStatusScope === 'all_active' ? 'active' : ''}`}
                      onClick={() => setCommStatusScope('all_active')}
                    >
                      Semua Status Sesi
                    </button>
                  </div>
                  <div className="comm-capster-select-row">
                    <span className="comm-picker-lbl">Filter Barber:</span>
                    <select
                      className="custom-select comm-capster-select"
                      value={commCapsterFilter}
                      onChange={(e) => setCommCapsterFilter(e.target.value)}
                    >
                      <option value="all">Semua Tim Capster</option>
                      {capsters.map((c) => (
                        <option key={c.id || c.name} value={c.name}>{c.name} ({c.badge || c.role_title})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 KPI Summary Cards */}
            <div className="stat-grid" style={{ marginBottom: '28px' }}>
              {/* Card 1: Total Omset */}
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">Total Omset Jasa</span>
                  <span className="stat-pill-badge amber">Gross</span>
                </div>
                <div className="stat-value" style={{ color: '#d97706' }}>
                  Rp {commTotalGross.toLocaleString('id-ID')}
                </div>
                <div className="stat-sub">
                  Dari total <b>{commTotalHeads} sesi</b> cukur terhitung
                </div>
              </div>

              {/* Card 2: Hak Komisi Capster */}
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">Hak Komisi Capster</span>
                  <span className="stat-pill-badge green">{commissionRate}% Payout</span>
                </div>
                <div className="stat-value" style={{ color: '#059669' }}>
                  Rp {commCapsterShareTotal.toLocaleString('id-ID')}
                </div>
                <div className="stat-sub">
                  Alokasi bagi hasil ke tim barber
                </div>
              </div>

              {/* Card 3: Kas Bersih Studio */}
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">Kas Bersih Studio</span>
                  <span className="stat-pill-badge blue">{100 - commissionRate}% Kas South</span>
                </div>
                <div className="stat-value" style={{ color: '#2563eb' }}>
                  Rp {commStudioShareTotal.toLocaleString('id-ID')}
                </div>
                <div className="stat-sub">
                  Hak operasional &amp; kas South Hair Studio
                </div>
              </div>

              {/* Card 4: Total Kepala / Produktivitas */}
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">Produktivitas Sesi</span>
                  <span className="stat-pill-badge">{commTotalHeads} Kepala</span>
                </div>
                <div className="stat-value">
                  {commTotalHeads} <span style={{ fontSize: '16px', color: 'var(--muted)', fontWeight: 500 }}>Sesi Cukur</span>
                </div>
                <div className="stat-sub">
                  Rata-rata <b>Rp {commAvgPerHead.toLocaleString('id-ID')}</b> / kepala
                </div>
              </div>
            </div>

            {/* Per-Capster Performance Cards Section */}
            <div className="comm-section-heading">
              <div>
                <h3 className="comm-section-title">Rekap Bagi Hasil Per Capster</h3>
                <p className="comm-section-desc">Hak komisi individual berdasarkan layanan yang dikerjakan. Siap kirim slip via WhatsApp atau cetak thermal kasir.</p>
              </div>
              <span className="comm-badge-count">{capsterCommissionsList.length} Capster Terdaftar</span>
            </div>

            <div className="comm-capster-grid">
              {capsterCommissionsList.map((c) => {
                const isActive = c.status === 'active';
                const hasSessions = c.heads > 0;

                return (
                  <div key={c.id || c.name} className={`comm-capster-card ${!isActive ? 'off-duty' : ''}`}>
                    {/* Header */}
                    <div className="comm-card-header">
                      <div className="comm-capster-info">
                        <img
                          src={c.photo_url || 'assets/capster_south/ikmal.png'}
                          alt={c.name}
                          className="comm-capster-avatar"
                          onError={(e) => {
                            e.currentTarget.src = 'assets/logo_south.png';
                          }}
                        />
                        <div>
                          <div className="comm-capster-name-row">
                            <h4 className="comm-capster-name">{c.name}</h4>
                            <span className={`comm-status-dot ${isActive ? 'online' : 'offline'}`} title={isActive ? 'Sedang Bertugas' : 'Libur'}></span>
                          </div>
                          <span className="comm-capster-badge">{c.badge || c.role_title}</span>
                        </div>
                      </div>
                      <span className={`comm-card-heads-tag ${hasSessions ? 'active' : ''}`}>
                        {c.heads} Kepala
                      </span>
                    </div>

                    {/* Stats metrics */}
                    <div className="comm-card-stats-row">
                      <div className="comm-stat-mini">
                        <span className="comm-stat-mini-label">Omset Jasa</span>
                        <span className="comm-stat-mini-val">Rp {c.gross.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="comm-stat-mini">
                        <span className="comm-stat-mini-label">Kas Studio ({100 - commissionRate}%)</span>
                        <span className="comm-stat-mini-val studio">Rp {c.studioShare.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Prominent Gold Payout Box */}
                    <div className="comm-payout-banner">
                      <div className="comm-payout-label">
                        <span>HAK KOMISI BERSIH ({commissionRate}%)</span>
                        <span className="comm-payout-pill">SIAP DITERIMA</span>
                      </div>
                      <div className="comm-payout-value">
                        Rp {c.capsterCommission.toLocaleString('id-ID')}
                      </div>
                      <div className="comm-payout-sub">
                        {c.cashShare > 0 && <span>Tunai: Rp {c.cashShare.toLocaleString('id-ID')}</span>}
                        {c.cashShare > 0 && c.qrisShare > 0 && <span> &bull; </span>}
                        {c.qrisShare > 0 && <span>QRIS: Rp {c.qrisShare.toLocaleString('id-ID')}</span>}
                        {c.cashShare === 0 && c.qrisShare === 0 && <span>Belum ada transaksi lunas di periode ini</span>}
                      </div>
                    </div>

                    {/* Service Breakdown Tags */}
                    <div className="comm-services-breakdown">
                      <span className="comm-services-lbl">Rincian Layanan:</span>
                      <div className="comm-services-tags">
                        {Object.keys(c.serviceCounts).length === 0 ? (
                          <span className="comm-no-svc">0 sesi pada periode ini</span>
                        ) : (
                          Object.entries(c.serviceCounts).map(([svcName, count]) => (
                            <span key={svcName} className="comm-svc-pill">
                              {svcName}: <b>{count}x</b>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="comm-actions-row">
                      <button
                        type="button"
                        className="btn-comm-wa"
                        onClick={() => handleSendWhatsAppSlip(c)}
                        disabled={!hasSessions}
                        title="Buka WhatsApp untuk kirim slip komisi ke capster"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                        <span>Kirim Slip WA</span>
                      </button>

                      <button
                        type="button"
                        className="btn-comm-copy"
                        onClick={() => handleCopySlipText(c)}
                        disabled={!hasSessions}
                        title="Salin teks slip ke clipboard"
                      >
                        {copiedWaId === c.name ? (
                          <span style={{ color: 'var(--green)', fontSize: '11px', fontWeight: 700 }}>Tersalin!</span>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn-comm-print"
                        onClick={() => handleOpenThermalSlip(c)}
                        disabled={!hasSessions}
                        title="Buka preview cetak slip kasir thermal 58mm/80mm"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        <span>Cetak Slip</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Audit Ledger Table of Transactions */}
            <div className="table-card" style={{ marginTop: '36px' }}>
              <div className="table-header">
                <div>
                  <h3 className="table-title">Audit Transaksi Layanan &amp; Pembagian Hak Komisi</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '12.5px', marginTop: '4px' }}>
                    Daftar terperinci setiap transaksi cukur yang menghasilkan bagi hasil komisi pada periode aktif.
                  </p>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="custom-input"
                    style={{ padding: '8px 12px 8px 32px', width: '230px', fontSize: '13px' }}
                    placeholder="Cari transaksi / barber..."
                    value={commSearchQuery}
                    onChange={(e) => setCommSearchQuery(e.target.value)}
                  />
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                    &#128269;
                  </span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tiket / Kode</th>
                      <th>Jadwal Sesi</th>
                      <th>Pelanggan</th>
                      <th>Capster Bertugas</th>
                      <th>Layanan Cukur</th>
                      <th>Tarif Jasa</th>
                      <th>Hak Capster ({commissionRate}%)</th>
                      <th>Kas Studio ({100 - commissionRate}%)</th>
                      <th>Metode Bayar</th>
                      <th>Status Sesi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commEligibleBookings.length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                          Tidak ada transaksi yang sesuai kriteria filter komisi.
                        </td>
                      </tr>
                    ) : (
                      commEligibleBookings.map((b) => {
                        const price = getBookingPrice(b);
                        const capShare = Math.round(price * (commissionRate / 100));
                        const stuShare = price - capShare;
                        const isDone = b.status === 'completed' || b.payment_status === 'paid';

                        return (
                          <tr key={b.id || b.booking_code}>
                            <td>
                              <b>{b.booking_code}</b>
                            </td>
                            <td>
                              {b.booking_date}
                              <br />
                              <span style={{ color: 'var(--muted)', fontSize: '11.5px' }}>
                                {b.booking_time ? `${b.booking_time} WITA` : '-'}
                              </span>
                            </td>
                            <td>
                              <b>{b.customer_name}</b>
                              <br />
                              <span style={{ color: 'var(--muted)', fontSize: '11.5px' }}>
                                {b.customer_phone || '-'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#09090b' }}>
                                {normalizeCapsterName(b.capster_name)}
                              </span>
                            </td>
                            <td>
                              <b>{b.service_name}</b>
                            </td>
                            <td>
                              <b style={{ color: '#09090b' }}>
                                Rp {price.toLocaleString('id-ID')}
                              </b>
                            </td>
                            <td>
                              <b style={{ color: '#059669' }}>
                                Rp {capShare.toLocaleString('id-ID')}
                              </b>
                            </td>
                            <td>
                              <b style={{ color: '#2563eb' }}>
                                Rp {stuShare.toLocaleString('id-ID')}
                              </b>
                            </td>
                            <td>
                              {b.payment_method === 'tunai' && <span className="badge-pay cash">Tunai</span>}
                              {b.payment_method === 'qris' && <span className="badge-pay qris">QRIS</span>}
                              {(!b.payment_method || b.payment_method === 'none') && <span className="badge-pay none">Belum Bayar</span>}
                            </td>
                            <td>
                              {isDone ? (
                                <span className="badge-status done">Selesai Lunas</span>
                              ) : (
                                <span className="badge-status wait">{b.status || 'Menunggu'}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* WALK-IN BOOKING MODAL */}
      {showWalkinModal && (
        <div className="modal-backdrop open" onClick={() => setShowWalkinModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">+ Tambah Walk-In Booking</span>
              <button className="modal-close-btn" onClick={() => setShowWalkinModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleWalkinSubmit}>
              <div className="modal-body">
                <div className="field-group" style={{ marginBottom: '14px' }}>
                  <label>Nama Pelanggan Walk-In *</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Contoh: Rian"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    required
                  />
                </div>
                <div className="field-group" style={{ marginBottom: '14px' }}>
                  <label>Nomor WhatsApp (Opsional)</label>
                  <input
                    type="tel"
                    className="custom-input"
                    placeholder="08..."
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                  />
                </div>
                <div className="field-group" style={{ marginBottom: '14px' }}>
                  <label>Pilih Layanan</label>
                  <select
                    className="custom-select"
                    value={walkinService}
                    onChange={(e) => setWalkinService(e.target.value)}
                  >
                    {services.map((s) => (
                      <option key={s.id || s.name} value={`${s.name}|Rp ${Number(s.price).toLocaleString('id-ID')}|${s.price}`}>
                        {s.name} - Rp {Number(s.price).toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field-group">
                  <label>Pilih Capster</label>
                  <select
                    className="custom-select"
                    value={walkinCapster}
                    onChange={(e) => setWalkinCapster(e.target.value)}
                  >
                    {capsters.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name} ({c.role_title || c.badge})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowWalkinModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-accent btn-sm">
                  Simpan Antrean
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SERVICE PRICE MODAL */}
      {editingService && (
        <div className="modal-backdrop open" onClick={() => setEditingService(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <span className="modal-title">Ubah Tarif Layanan</span>
              <button className="modal-close-btn" onClick={() => setEditingService(null)}>&times;</button>
            </div>
            <form onSubmit={handleSavePrice}>
              <div className="modal-body">
                <div style={{ marginBottom: '14px' }}>
                  <b style={{ color: 'var(--text)', fontSize: '15px' }}>{editingService.name}</b>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>
                    {editingService.category_name} &bull; Durasi {editingService.duration || '45 Menit'}
                  </p>
                </div>
                <div className="field-group">
                  <label>Tarif Baru (Rupiah) *</label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    className="custom-input"
                    value={editPriceInput}
                    onChange={(e) => setEditPriceInput(e.target.value)}
                    required
                    autoFocus
                  />
                  <div style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '6px' }}>
                    Preview: Rp {Number(editPriceInput || 0).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingService(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-accent btn-sm">
                  Simpan Tarif Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT STOCK MODAL */}
      {editingProduct && (
        <div className="modal-backdrop open" onClick={() => setEditingProduct(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <span className="modal-title">Atur Jumlah Stok Produk</span>
              <button className="modal-close-btn" onClick={() => setEditingProduct(null)}>&times;</button>
            </div>
            <form onSubmit={handleSaveStock}>
              <div className="modal-body">
                <div style={{ marginBottom: '14px' }}>
                  <b style={{ color: 'var(--text)', fontSize: '15px' }}>{editingProduct.name}</b>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>
                    {editingProduct.category_name} &bull; {editingProduct.weight_volume}
                  </p>
                </div>
                <div className="field-group">
                  <label>Total Stok Fisik Tersedia (pcs) *</label>
                  <input
                    type="number"
                    min="0"
                    className="custom-input"
                    value={editStockInput}
                    onChange={(e) => setEditStockInput(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingProduct(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-accent btn-sm">
                  Simpan Jumlah Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THERMAL PRINT MODAL (58mm / 80mm RECEIPT LAYOUT) */}
      {thermalReceiptData && (
        <div className="modal-backdrop open" onClick={() => setThermalReceiptData(null)}>
          <div className="modal-window comm-thermal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <div className="modal-header">
              <span className="modal-title">Pratinjau Slip Komisi Thermal</span>
              <button className="modal-close-btn" onClick={() => setThermalReceiptData(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '16px' }}>
              <div className="thermal-paper" id="thermal-slip-print-area">
                <div className="thermal-header">
                  <div className="thermal-brand">SOUTH HAIR STUDIO</div>
                  <div className="thermal-sub">PRECISE CUT &amp; GENTLEMEN GROOMING</div>
                  <div className="thermal-address">Jl. Andi Djemma No. 45 Kota Palopo</div>
                  <div className="thermal-divider">--------------------------------</div>
                  <div className="thermal-meta-row">
                    <span>SLIP KOMISI CAPSTER</span>
                  </div>
                  <div className="thermal-divider">--------------------------------</div>
                </div>

                <div className="thermal-details">
                  <div className="thermal-line">
                    <span>Capster:</span>
                    <b>{thermalReceiptData.capster.name}</b>
                  </div>
                  <div className="thermal-line">
                    <span>Role:</span>
                    <span>{thermalReceiptData.capster.role_title || thermalReceiptData.capster.badge}</span>
                  </div>
                  <div className="thermal-line">
                    <span>Periode:</span>
                    <span>{thermalReceiptData.period}</span>
                  </div>
                  <div className="thermal-line">
                    <span>Skema Komisi:</span>
                    <b>{thermalReceiptData.rate}% : {100 - thermalReceiptData.rate}%</b>
                  </div>
                  <div className="thermal-line">
                    <span>Waktu Cetak:</span>
                    <span>{thermalReceiptData.generatedAt} WITA</span>
                  </div>
                </div>

                <div className="thermal-divider">--------------------------------</div>
                <div className="thermal-section-title">RINCIAN LAYANAN DIKERJAKAN</div>
                <div className="thermal-services-list">
                  {Object.entries(thermalReceiptData.capster.serviceCounts).map(([svc, count]) => (
                    <div key={svc} className="thermal-line">
                      <span>{svc}</span>
                      <b>{count} Sesi</b>
                    </div>
                  ))}
                  {Object.keys(thermalReceiptData.capster.serviceCounts).length === 0 && (
                    <div style={{ textAlign: 'center', fontSize: '11px', color: '#666' }}>Tidak ada layanan</div>
                  )}
                </div>

                <div className="thermal-divider">--------------------------------</div>
                <div className="thermal-totals">
                  <div className="thermal-line">
                    <span>Total Kepala:</span>
                    <b>{thermalReceiptData.capster.heads} Sesi Cukur</b>
                  </div>
                  <div className="thermal-line">
                    <span>Total Omset Jasa:</span>
                    <span>Rp {thermalReceiptData.capster.gross.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="thermal-line">
                    <span>Bagian Kas Studio ({100 - thermalReceiptData.rate}%):</span>
                    <span>Rp {thermalReceiptData.capster.studioShare.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="thermal-divider">================================</div>
                  <div className="thermal-line payout-highlight">
                    <span>HAK KOMISI ({thermalReceiptData.rate}%):</span>
                    <span className="thermal-big-val">Rp {thermalReceiptData.capster.capsterCommission.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="thermal-divider">================================</div>
                </div>

                <div className="thermal-footer">
                  <div>Terima kasih atas dedikasi terbaikmu!</div>
                  <div style={{ fontWeight: 700, marginTop: '4px' }}>SOUTH HAIR STUDIO PALOPO</div>
                  <div style={{ fontSize: '10px', marginTop: '6px' }}>&bull; Tetap Presisi, Tetap Solid &bull;</div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setThermalReceiptData(null)}
              >
                Tutup
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: '#22c55e', color: '#fff', border: 'none' }}
                  onClick={() => handleSendWhatsAppSlip(thermalReceiptData.capster)}
                >
                  Kirim WA &rarr;
                </button>
                <button
                  type="button"
                  className="btn btn-accent btn-sm"
                  onClick={() => window.print()}
                >
                  Cetak Slip (Print)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
