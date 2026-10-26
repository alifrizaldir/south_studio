import React, { useState, useEffect, useRef } from 'react';
import { getSupabaseCapsters } from '../lib/supabase';

const DEFAULT_CAPSTERS = [
  {
    id: 'rezky',
    name: 'Rezky',
    displayName: 'REZKY',
    badge: 'SENIOR CAPSTER',
    kicker: '01. REZKY • HOMIES BEHIND THE CHAIR',
    role: 'SENIOR CAPSTER • SKIN FADE & MODERN TEXTURE',
    desc: 'Spesialis potongan clean fade, buzz cut, textured crop, dan styling rapi presisi.',
    img: 'assets/capster_south/rezky.png',
    bookingValue: 'Rezky'
  },
  {
    id: 'abi',
    name: 'Abi',
    displayName: 'ABI',
    badge: 'HOMIES BARBER',
    kicker: '02. ABI • HOMIES BEHIND THE CHAIR',
    role: 'CAPSTER • PRECISION CLIPPER & CLASSIC STYLE',
    desc: 'Ahli dalam taper fade, side part klasik, quiff, serta perawatan brewok dan kumis.',
    img: 'assets/capster_south/abi.png',
    bookingValue: 'Abi'
  },
  {
    id: 'ikmal',
    name: 'Kak Ikmal',
    displayName: 'KAK IKMAL',
    badge: 'FOUNDER & SENIOR',
    kicker: '03. KAK IKMAL • HOMIES BEHIND THE CHAIR',
    role: 'FOUNDER & SENIOR BARBER • PERMING & COLOR EXPERT',
    desc: 'Pendiri South Hair Studio, spesialis konsultasi bentuk wajah, perming korea, dan pewarnaan rambut.',
    img: 'assets/capster_south/ikmal.png',
    bookingValue: 'Kak Ikmal'
  }
];

export default function CapsterSection({ onSelectCapster }) {
  const [capsters, setCapsters] = useState(DEFAULT_CAPSTERS);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    async function load() {
      const data = await getSupabaseCapsters();
      if (data && data.length > 0) {
        setCapsters(
          data.map((c, i) => ({
            id: c.slug || `capster-${c.id}`,
            name: c.name,
            displayName: c.name.toUpperCase(),
            badge: c.badge || 'BARBER',
            kicker: `0${i + 1}. ${c.name.toUpperCase()} • HOMIES BEHIND THE CHAIR`,
            role: c.role_title,
            desc: c.bio,
            img: c.photo_url || 'assets/capster_south/rezky.png',
            bookingValue: c.booking_value || c.name,
            status: c.status
          }))
        );
      }
    }
    load();
  }, []);

  const handleSelect = (capsterName) => {
    if (onSelectCapster) {
      onSelectCapster(capsterName);
    }
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const nextCap = () => {
    setActiveIdx((prev) => (prev + 1) % capsters.length);
  };

  const prevCap = () => {
    setActiveIdx((prev) => (prev - 1 + capsters.length) % capsters.length);
  };

  const activeCap = capsters[activeIdx] || capsters[0] || DEFAULT_CAPSTERS[0];

  return (
    <section id="tim" style={{ borderTop: '1px solid var(--line)' }}>
      <div className="wrap">
        <div className="section-header center reveal in">
          <h2 className="section-title">Tim Kami</h2>
          <p className="section-sub">Capster berpengalaman, siap mewujudkan gaya yang Anda inginkan.</p>
        </div>

        <div className="team-container">
        {/* DESKTOP TRIO GRID (VISIBLE ON DESKTOP > 768px) */}
        <div className="team-trio-grid team-desktop-only">
          {capsters.map((c) => (
            <div
              key={c.id}
              className="trio-team-card reveal in"
              onClick={() => handleSelect(c.bookingValue)}
              role="button"
              tabIndex="0"
              aria-label={`Pilih Capster ${c.name} untuk booking`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelect(c.bookingValue);
              }}
            >
              <div className="trio-poster-frame">
                <img src={c.img} alt={`${c.displayName} - Homies Behind The Chair South Hair Studio`} loading="lazy" />
                <div className="trio-quick-badge">
                  <span>Pilih</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
              <div className="trio-label-row">
                <span className="trio-name">{c.displayName}</span>
              </div>
            </div>
          ))}
        </div>

        {/* MOBILE 3D CAROUSEL STAGE SHOWCASE */}
        <div className="capster-mobile-stage-wrap">
          <div className="capster-showcase-top">
            <div className="capster-top-brand">
              <span>SOUTH [CREW]</span>
              <span className="capster-top-badge">03 BARBERS</span>
            </div>
            <div className="capster-top-studio">
              HOMIES BEHIND THE CHAIR
            </div>
          </div>

          <div className="capster-center-meta-top">
            <span className="capster-kicker-text">{activeCap.kicker}</span>
          </div>

          {/* 3D CAROUSEL STAGE VIEWPORT */}
          <div className="capster-stage-viewport" id="capStageViewport" aria-label="Tim Capster South Hair Studio">
            <div className="capster-fade-edge left"></div>
            <div className="capster-fade-edge right"></div>

            <button className="capster-nav-arrow prev" onClick={prevCap} aria-label="Capster Sebelumnya">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button className="capster-nav-arrow next" onClick={nextCap} aria-label="Capster Selanjutnya">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>

            <div className="capster-cards-track">
              {capsters.map((cap, i) => {
                const diff = i - activeIdx;
                const absDiff = Math.abs(diff);
                const isActive = i === activeIdx;

                return (
                  <div
                    key={cap.id}
                    className={`capster-card ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      if (isActive) handleSelect(cap.bookingValue);
                      else setActiveIdx(i);
                    }}
                    style={{
                      transform: `translate3d(${diff * 160}px, 0, ${-absDiff * 80}px) scale(${isActive ? 1.05 : 0.82})`,
                      opacity: isActive ? 1 : 0.45,
                      zIndex: 10 - absDiff,
                      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div className="capster-card-inner">
                      <span className="capster-card-badge">{cap.badge}</span>
                      <div className="capster-card-img-wrap">
                        <img src={cap.img} alt={`${cap.displayName} South Hair Studio`} className="capster-card-img" loading="lazy" />
                      </div>
                      <div className="capster-card-quick-cta">
                        <span>{cap.displayName}</span>
                        <span>PILIH &rarr;</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="capster-center-meta-bottom">
            <div className="capster-meta-name">{activeCap.displayName}</div>
            <div className="capster-meta-role">{activeCap.role}</div>
            <div className="capster-meta-desc">{activeCap.desc}</div>
            <div className="capster-meta-action-row">
              <button className="btn-capster-select" onClick={() => handleSelect(activeCap.bookingValue)}>
                <span>Pilih Capster {activeCap.name}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <div className="capster-controls-bar">
            <span className="capster-drag-hint">&larr; Pilih capster &rarr;</span>
            <div className="capster-dots-nav">
              {capsters.map((_, i) => (
                <div
                  key={i}
                  className={`capster-dot ${i === activeIdx ? 'active' : ''}`}
                  onClick={() => setActiveIdx(i)}
                />
              ))}
            </div>
          </div>

          <div className="capster-showcase-bottom">
            <div className="capster-giant-title">OURCREW</div>
            <div className="capster-bottom-stat">
              <span className="stat-highlight">3 DEDICATED BARBERS</span>
              Capster handal siap memberikan potongan rambut presisi sesuai karakter dan bentuk kepala Anda di Kota Palopo.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
}
