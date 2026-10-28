import React, { useState } from 'react';

export default function Navbar({ onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="site-header">
      <nav>
        <a href="#" className="brand-link" aria-label="South Hair Studio Beranda" onClick={closeMobile}>
          <img src="assets/logo_south.png" alt="Logo South Hair Studio" className="brand-logo-img" />
          <span className="brand-title">South Hair Studio</span>
        </a>

        <div className="navlinks">
          <a href="#layanan">Layanan</a>
          <a href="#booking">Booking Kursi</a>
          <a href="#tim">Tim Capster</a>
          <a href="#produk">Produk</a>
          <a href="#galeri">Galeri</a>
          <a href="#lokasi">Lokasi &amp; Review</a>
        </div>

        <div className="nav-actions">
          <a href="#booking" className="btn btn-sm">Book Kursi</a>
          <button 
            className={`menu-toggle ${mobileOpen ? 'open active' : ''}`} 
            id="menuToggle" 
            aria-label="Buka Menu Navigasi"
            onClick={toggleMobile}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (PUBLIC VIEW) */}
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`} id="mobileDrawer">
        <a href="#layanan" className="drawer-link" onClick={closeMobile}>Katalog Layanan <span>&rsaquo;</span></a>
        <a href="#booking" className="drawer-link" onClick={closeMobile}>Jadwal &amp; Booking <span>&rsaquo;</span></a>
        <a href="#tim" className="drawer-link" onClick={closeMobile}>Tim Capster <span>&rsaquo;</span></a>
        <a href="#produk" className="drawer-link" onClick={closeMobile}>Produk Grooming <span>&rsaquo;</span></a>
        <a href="#galeri" className="drawer-link" onClick={closeMobile}>Galeri Potongan <span>&rsaquo;</span></a>
        <a href="#lokasi" className="drawer-link" onClick={closeMobile}>Lokasi &amp; Review <span>&rsaquo;</span></a>
        <a 
          href="#login" 
          className="drawer-link" 
          style={{ color: 'var(--accent)', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '8px' }}
          onClick={(e) => {
            e.preventDefault();
            closeMobile();
            if (onNavigate) onNavigate('login');
            else window.location.hash = '#login';
          }}
        >
          Portal Kasir &amp; Admin <span>&rsaquo;</span>
        </a>
      </div>
    </header>
  );
}
