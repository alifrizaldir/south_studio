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
    try {
      // Langsung update ke tabel bookings di Supabase
      await updateSupabaseBooking(bookingId, patchData);
    } catch (e) {
      console.error('Gagal update booking di Supabase:', e);
    }

    // Optimistic UI update
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...patchData } : b))
    );
    if (onShowToast) onShowToast('Status booking berhasil diperbarui di Supabase!');
  };

  const handlePay = (booking, method) => {
    updateBookingStatus(booking.id, {
      payment_method: method,
      payment_status: 'paid',
      status: 'confirmed'
    });
  };

  const handleComplete = (booking) => {
    updateBookingStatus(booking.id, {
      status: 'completed',
      payment_status: 'paid'
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
      window.location.hash = '';
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

  // Calculations
  const totalSessions = bookings.length;
  const cashTotal = bookings
    .filter((b) => b.payment_method === 'tunai' && b.payment_status === 'paid')
    .reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);
  const qrisTotal = bookings
    .filter((b) => b.payment_method === 'qris' && b.payment_status === 'paid')
    .reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);
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

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', width: '100%', minWidth: '100%', boxSizing: 'border-box' }}>
      {/* SIDEBAR (MODERN OBSIDIAN DESIGN - IMAGE 4 MATCH) */}
      <aside className="sidebar" id="sidebar">
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
              title="Kecilkan Sidebar"
              onClick={() => {
                const sb = document.getElementById('sidebar');
                if (sb) sb.classList.toggle('collapsed');
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            </button>
          </div>

          {/* Sidebar Quick Search Box matching Image 4 */}
          <div className="sidebar-search-wrap">
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
            >
              <div className="nav-item-left">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                <span>Dashboard</span>
              </div>
            </a>
            <a
              className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <div className="nav-item-left">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>Antrian &amp; Kasir</span>
              </div>
            </a>
            <a
              className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
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
              className={`nav-item ${activeTab === 'capsters' ? 'active' : ''}`}
              onClick={() => setActiveTab('capsters')}
            >
              <div className="nav-item-left">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>Tim Capster</span>
              </div>
            </a>
            <a
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <div className="nav-item-left">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                <span>Katalog &amp; Stok</span>
              </div>
            </a>
          </div>

          {/* Studio status widget card matching Image 4 */}
          <div className="sidebar-widget-card">
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
          <div className="sidebar-user-pill">
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
      <main className="admin-main-viewport">
        {/* Topbar Header matching Image 4 */}
        <div className="admin-top-header">
          <div className="admin-header-title-wrap">
            <h1>
              {activeTab === 'overview' && 'Ringkasan Studio'}
              {activeTab === 'bookings' && 'Antrian & Kasir'}
              {activeTab === 'services' && 'Katalog Layanan & Tarif'}
              {activeTab === 'capsters' && 'Manajemen Tim Capster'}
              {activeTab === 'products' && 'Inventori & Stok Produk'}
            </h1>
            <p>
              South Hair Studio Kota Palopo &bull; Sistem Kasir &amp; Booking Realtime
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
              <div className="stat-value" style={{ color: '#4ade80' }}>
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
                      const isPaid = b.payment_status === 'paid';
                      const isWait = b.status === 'pending' || !isPaid;
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
                        <h4 className="service-title-text">{svc.name}</h4>
                        <p className="service-desc-text">{svc.description}</p>
                      </div>

                      <div className="service-footer-row">
                        <div>
                          <div style={{ fontSize: '10.5px', color: 'var(--muted-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tarif Layanan</div>
                          <div className="service-price-val">Rp {Number(svc.price).toLocaleString('id-ID')}</div>
                        </div>
                        <button
                          type="button"
                          className="service-edit-btn"
                          onClick={() => handleOpenEditPrice(svc)}
                        >
                          Ubah Tarif
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
                  <b style={{ color: '#fff', fontSize: '15px' }}>{editingService.name}</b>
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
                  <b style={{ color: '#fff', fontSize: '15px' }}>{editingProduct.name}</b>
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
    </div>
  );
}
