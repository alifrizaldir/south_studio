import React, { useState, useEffect } from 'react';
import { getSupabaseGallery } from '../lib/supabase';

const DEFAULT_GALLERY = [
  { img: 'assets/galeri_south/Image (Warriorcut).png', title: 'WARRIORCUT', subtitle: 'Signature Modern Fade & Sharp Edge' },
  { img: 'assets/galeri_south/Image (fringe)-2.png', title: 'FRINGE', subtitle: 'Messy Curly Texture & Drop Fade' },
  { img: 'assets/galeri_south/Image (Texture).png', title: 'TEXTURE', subtitle: 'High Volume Textured Top & Taper' },
  { img: 'assets/galeri_south/Image (Fade).png', title: 'FADE', subtitle: 'Classic Mid Skin Fade & Clean Back' },
  { img: 'assets/galeri_south/Image (Taper, Taper Fade, Temple Taper).png', title: 'TAPER, TAPER FADE, TEMPLE TAPER', subtitle: 'Low Taper Side & Natural Flow' },
  { img: 'assets/galeri_south/Image (fringe)-1.png', title: 'FRINGE 2', subtitle: 'Spiky Textured Crop & Low Fade' },
  { img: 'assets/galeri_south/Image (fringe).png', title: 'FRINGE 3', subtitle: 'Forward Crop & Angular Styling' },
  { img: 'assets/galeri_south/Image (mullet).png', title: 'MULLET', subtitle: 'Modern Burst Mullet & Tapered Sides' }
];

export default function GallerySection() {
  const [items, setItems] = useState(DEFAULT_GALLERY);
  const [activeImgIndex, setActiveImgIndex] = useState(null);

  // Touch swipe support for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getSupabaseGallery();
      if (data && data.length > 0) {
        setItems(
          data.map((g) => ({
            img: g.image_url,
            title: g.title,
            subtitle: g.description || 'Gaya Rambut Presisi South Studio'
          }))
        );
      }
    }
    load();
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (activeImgIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeImgIndex]);

  // Keyboard navigation (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeImgIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') setActiveImgIndex((prev) => (prev + 1) % items.length);
      if (e.key === 'ArrowLeft') setActiveImgIndex((prev) => (prev - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImgIndex, items.length]);

  const openLightbox = (idx) => setActiveImgIndex(idx);
  const closeLightbox = () => setActiveImgIndex(null);

  const nextImg = (e) => {
    if (e) e.stopPropagation();
    setActiveImgIndex((prev) => (prev + 1) % items.length);
  };

  const prevImg = (e) => {
    if (e) e.stopPropagation();
    setActiveImgIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      // Swiped left -> next
      setActiveImgIndex((prev) => (prev + 1) % items.length);
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev
      setActiveImgIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  const currentItem = activeImgIndex !== null ? items[activeImgIndex] : null;

  return (
    <>
      <section id="galeri" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="section-header center reveal in">
            <h2 className="section-title">Galeri Hasil Cukur</h2>
            <p className="section-sub">Klik foto mana saja untuk melihat detail potongan dan inspirasi gaya.</p>
          </div>

          <div className="gallery-container">
            <div className="gallery-modern-grid reveal in">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="gallery-modern-card"
                  onClick={() => openLightbox(idx)}
                  role="button"
                  tabIndex="0"
                  aria-label={`Lihat model rambut ${item.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') openLightbox(idx);
                  }}
                >
                  <div className="gallery-card-img-wrap">
                    <img src={item.img} alt={`${item.title} - South Hair Studio`} loading="lazy" />
                  </div>

                  {/* Modern Interactive Hover Overlay */}
                  <div className="gallery-card-overlay">
                    <div className="gallery-card-top-tag">
                      <span className="gallery-pill-lens">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          <line x1="11" y1="8" x2="11" y2="14"/>
                          <line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                        <span>Pratinjau</span>
                      </span>
                    </div>

                    <div className="gallery-card-bottom-info">
                      <span className="gallery-card-title">{item.title}</span>
                      <span className="gallery-card-subtitle">{item.subtitle}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY LIGHTBOX MODAL */}
      {activeImgIndex !== null && currentItem && (
        <div
          className="gallery-modal active"
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Topbar Bar inside Modal */}
            <div className="gallery-modal-topbar">
              <div className="gallery-modal-meta">
                <span className="gallery-modal-badge">STYLE #{String(activeImgIndex + 1).padStart(2, '0')}</span>
                <span className="gallery-modal-name">{currentItem.title}</span>
              </div>
              <div className="gallery-modal-top-actions">
                <span className="gallery-modal-counter">
                  {activeImgIndex + 1} / {items.length}
                </span>
                <button
                  type="button"
                  className="gallery-modal-close-btn"
                  onClick={closeLightbox}
                  aria-label="Tutup pratinjau foto"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Main Stage Image & Arrows */}
            <div className="gallery-modal-stage">
              <button
                type="button"
                className="gallery-modal-nav prev"
                onClick={prevImg}
                aria-label="Foto sebelumnya"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>

              <div className="gallery-modal-img-wrap">
                <img
                  key={activeImgIndex}
                  src={currentItem.img}
                  alt={currentItem.title}
                  className="gallery-modal-active-img"
                />
              </div>

              <button
                type="button"
                className="gallery-modal-nav next"
                onClick={nextImg}
                aria-label="Foto selanjutnya"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>

            {/* Bottom Panel with Description & Booking CTA */}
            <div className="gallery-modal-bottom-bar">
              <div className="gallery-modal-bottom-desc">
                <span className="gallery-modal-style-title">{currentItem.title}</span>
                <span className="gallery-modal-style-desc">{currentItem.subtitle}</span>
              </div>
              <a
                href="#booking"
                className="gallery-modal-cta-btn"
                onClick={() => {
                  closeLightbox();
                  const el = document.getElementById('booking');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Booking Model Ini</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

            {/* Thumbnail Strip */}
            <div className="gallery-modal-thumbs-strip">
              {items.map((it, tIdx) => (
                <div
                  key={tIdx}
                  className={`gallery-thumb-item ${tIdx === activeImgIndex ? 'active' : ''}`}
                  onClick={() => setActiveImgIndex(tIdx)}
                  title={it.title}
                >
                  <img src={it.img} alt={it.title} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
