import React, { useState, useEffect } from 'react';
import { getSupabaseServices } from '../lib/supabase';
import { useInView } from '../hooks/useInView';

const DEFAULT_SERVICES = [
  { id: 1, name: 'Hair Cut', priceStr: 'Rp 40.000', price: 40000, img: 'assets/layanan_south/hair_cut.png' },
  { id: 2, name: 'Highlight Color', priceStr: 'Rp 150.000', price: 150000, img: 'assets/layanan_south/highlight_color.png' },
  { id: 3, name: 'Full Color', priceStr: 'Rp 130.000', price: 130000, img: 'assets/layanan_south/full_color.png' },
  { id: 4, name: 'Perming', priceStr: 'Rp 180.000', price: 180000, img: 'assets/layanan_south/perming.png' },
  { id: 5, name: 'Down Perm', priceStr: 'Rp 75.000', price: 75000, img: 'assets/layanan_south/down_perm.png' }
];

export default function LayananSection({ onSelectService }) {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [sectionRef, inView] = useInView({ threshold: 0.12 });

  useEffect(() => {
    async function loadData() {
      const data = await getSupabaseServices();
      if (data && data.length > 0) {
        const mapped = data.map((s) => ({
          id: s.id,
          name: s.name,
          priceStr: `Rp ${Number(s.price).toLocaleString('id-ID')}`,
          price: Number(s.price),
          img: s.image_url || 'assets/layanan_south/hair_cut.png',
          desc: s.description || ''
        }));
        setServices(mapped);
      }
    }
    loadData();
  }, []);

  const handleChoose = (item) => {
    if (onSelectService) {
      onSelectService(item);
    }
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="layanan" ref={sectionRef} className={`layanan-anim-section ${inView ? 'in-view' : ''}`}>
      <div className="wrap">
        <div className="section-header center layanan-header-anim">
          <div className="section-kicker">KATALOG &amp; TARIF</div>
          <h2 className="section-title">Katalog Layanan</h2>
          <p className="section-sub">Pilih layanan dan tarif, lalu booking langsung.</p>
        </div>

        <div className="catalog-container">
          <div className="catalog-list">
            {services.map((svc, idx) => (
              <div
                key={svc.id || svc.name}
                className="catalog-item catalog-item-anim"
                style={{ '--item-index': idx }}
                onClick={() => handleChoose(svc)}
                role="button"
                tabIndex="0"
                aria-label={`Pilih layanan ${svc.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleChoose(svc);
                }}
              >
                <div className="catalog-left">
                  <div className="catalog-thumb">
                    <img src={svc.img} alt={`${svc.name} South Hair Studio`} loading="lazy" />
                  </div>
                  <div className="catalog-name">{svc.name}</div>
                </div>
                <div className="catalog-right">
                  <div className="catalog-price">{svc.priceStr}</div>
                  <button
                    className="catalog-book-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChoose(svc);
                    }}
                    type="button"
                  >
                    <span>Pilih</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
