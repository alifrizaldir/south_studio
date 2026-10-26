import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img src="assets/logo_south.png" alt="Logo South Hair Studio" className="brand-logo-img" />
              <span className="footer-brand-title">South Hair Studio</span>
            </div>
            <p style={{ maxWidth: '42ch', marginBottom: '16px' }}>
              Barbershop modern di Kota Palopo. Pelayanan potong rambut presisi, styling matang, dan sistem antrean terstruktur untuk kenyamanan pelanggan.
            </p>
            <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>
              No. 139, Jl. Andi Kambo, Kota Palopo, Sulawesi Selatan<br />
              WhatsApp:{' '}
              <a
                href="https://wa.me/6282340069911"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--text)', textDecoration: 'underline' }}
              >
                0823-4006-9911
              </a>{' '}
              &bull; Instagram:{' '}
              <a
                href="https://www.instagram.com/southhairstudio.id"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--text)', textDecoration: 'underline' }}
              >
                @southhairstudio.id
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h5>Navigasi Utama</h5>
            <a href="#layanan">Katalog Layanan</a>
            <a href="#booking">Jadwal &amp; Booking</a>
            <a href="#tim">Tim Barber</a>
            <a href="#galeri">Galeri Portofolio</a>
          </div>

          <div className="footer-col">
            <h5>Akses &amp; Petunjuk</h5>
            <a href="#lokasi">Peta &amp; Jam Buka</a>
            <a
              href="https://maps.google.com/?q=Jl.+Andi+Kambo,+Kota+Palopo"
              target="_blank"
              rel="noopener noreferrer"
            >
              Petunjuk Arah Google Maps
            </a>
            <div style={{ marginTop: '18px' }}>
              <a
                href="#login"
                className="admin-lock-btn"
                style={{ textDecoration: 'none', display: 'inline-block' }}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('login');
                  else window.location.hash = '#login';
                }}
              >
                &#128274; Portal Kasir &amp; Owner
              </a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--muted)' }}>
          &copy; {new Date().getFullYear()} South Hair Studio Palopo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
