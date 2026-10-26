import React, { useState, useEffect } from 'react';
import { getSupabaseGallery } from '../lib/supabase';

const DEFAULT_GALLERY = [
  { img: 'assets/galeri_south/warrior_cut.png', title: 'WARRIORCUT' },
  { img: 'assets/galeri_south/fringe.png', title: 'FRINGE' },
  { img: 'assets/galeri_south/texture.png', title: 'TEXTURE' },
  { img: 'assets/galeri_south/fade.png', title: 'FADE' },
  { img: 'assets/galeri_south/taper_fade.png', title: 'TAPER FADE' },
  { img: 'assets/galeri_south/warrior_cut2.png', title: 'WARRIORCUT 2' },
  { img: 'assets/galeri_south/fringe2.png', title: 'FRINGE 2' },
  { img: 'assets/galeri_south/mullet_taper.png', title: 'MULLET, TAPER' }
];

export default function GallerySection() {
  const [items, setItems] = useState(DEFAULT_GALLERY);
  const [activeImgIndex, setActiveImgIndex] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getSupabaseGallery();
      if (data && data.length > 0) {
        setItems(
          data.map((g) => ({
            img: g.image_url,
            title: g.title,
            desc: g.description
          }))
        );
      }
    }
    load();
  }, []);

  const openLightbox = (idx) => setActiveImgIndex(idx);
  const closeLightbox = () => setActiveImgIndex(null);

  const nextImg = (e) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev + 1) % items.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <>
      <section id="galeri" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="section-header center reveal in">
            <h2 className="section-title">Galeri Hasil Cukur</h2>
            <p className="section-sub">Sebagian hasil kerja capster kami.</p>
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
                  <img src={item.img} alt={`${item.title} - South Hair Studio`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY LIGHTBOX MODAL */}
      {activeImgIndex !== null && (
        <div className="gallery-modal active" onClick={closeLightbox}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-modal-close" onClick={closeLightbox} aria-label="Tutup foto">&times;</button>
            <button className="gallery-modal-nav prev" onClick={prevImg} aria-label="Foto sebelumnya">&lsaquo;</button>
            <div className="gallery-modal-img-wrap">
              <img src={GALLERY_ITEMS[activeImgIndex].img} alt={GALLERY_ITEMS[activeImgIndex].title} />
            </div>
            <button className="gallery-modal-nav next" onClick={nextImg} aria-label="Foto selanjutnya">&rsaquo;</button>
          </div>
        </div>
      )}
    </>
  );
}
