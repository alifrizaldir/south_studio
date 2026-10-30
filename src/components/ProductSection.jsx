import React, { useState, useRef, useEffect, useCallback } from 'react';

const PRODUCTS_DATA = [
  {
    id: 'pomade-waterbased',
    indexStr: '01. SOUTH WATERBASED POMADE',
    name: 'South Waterbased Pomade',
    brand: 'by The Presiden Men Supply • Palopo City',
    role: 'SUPER HOLD • WATERBASED POMADE',
    origin: 'THE PRESIDEN MEN SUPPLY • PALOPO CITY STUDIO',
    category: 'pomade',
    price: 'Rp 95.000',
    rawPrice: 95000,
    img: 'assets/produk_south/pomade_clay.jpeg',
    badge: 'BEST SELLER',
    desc: 'Formula waterbased dengan daya rekat super kuat dan aroma bubblegum segar yang digemari pelanggan South Hair Studio. Memberikan kontrol penuh pada tatanan rambut formal maupun kasual, mudah dibilas hanya dengan sekali bilasan air tanpa sisa residu lengket.',
    hold: 'Super Hold (5/5)',
    shine: 'Medium Shine (3/5)',
    scent: 'Fresh Sweet Bubblegum',
    washability: 'Sangat Mudah (Waterbased)',
    size: '100 gram / 3.5 oz',
    cocok: 'Pompadour, Slickback, Side Part, Classic Taper, Combed Over',
    caraPakai: 'Ambil pomade secukupnya sebesar ruas jari, ratakan pada telapak tangan hingga hangat, lalu aplikasikan merata pada rambut setengah lembap atau kering. Sisir rapi sesuai gaya yang diinginkan.'
  },
  {
    id: 'dust-it-powder',
    indexStr: '02. SOUTH DUST IT TEXTURE POWDER',
    name: 'South Dust It Hair Powder',
    brand: 'by SEVICH Original • Light Control',
    role: 'MAX VOLUME • NATURAL MATTE TEXTURE',
    origin: 'SEVICH x SOUTH • PALOPO CITY STUDIO',
    category: 'powder',
    price: 'Rp 75.000',
    rawPrice: 75000,
    img: 'assets/produk_south/powder.jpeg',
    badge: 'TRENDING #1',
    desc: 'Hair powder penambah volume seketika yang memberikan tekstur matte natural tanpa efek berminyak atau lepek. Sangat pas untuk iklim tropis Kota Palopo karena formulanya menyerap minyak berlebih di kulit kepala dan menjaga rambut tetap mengembang bervolume seharian.',
    hold: 'Natural Medium Hold (3.5/5)',
    shine: 'Pure Zero Matte (1/5)',
    scent: 'Neutral Fresh Odorless',
    washability: '100% Bersih Sekali Bilas',
    size: '8 gram / 0.28 oz (Awet 1-2 Bulan)',
    cocok: 'Textured Crop, French Crop, Messy Quiff, Korean Curtain, Mullet',
    caraPakai: 'Taburkan sedikit bubuk langsung ke akar rambut yang kering atau ke telapak tangan. Acak-acak rambut dengan jari untuk menciptakan volume tebal dan tekstur messy yang tahan lama.'
  },
  {
    id: 'kurl-cream',
    indexStr: '03. SOUTH KURL CREAM PRO',
    name: 'South Kurl Cream',
    brand: 'by HAIR PRO Hairnerds Professional',
    role: 'CURL DEFINING • ANTI-FRIZZ TREATMENT',
    origin: 'HAIR PRO x SOUTH • PALOPO CITY STUDIO',
    category: 'curly',
    price: 'Rp 120.000',
    rawPrice: 120000,
    img: 'assets/produk_south/curly.jpeg',
    badge: 'STUDIO ESSENTIAL',
    desc: 'Krim perawatan dan styling khusus rambut ikal, keriting, maupun hasil perming / downperm di South Hair Studio. Diperkaya Hydrolyzed Collagen, Shea Butter, dan Olive Oil untuk mengunci kelembapan alami, mendefinisikan gelombang rambut agar elastis (bouncy), dan menghilangkan rambut kembang mengembang kusut.',
    hold: 'Soft Flexible Hold (2.5/5)',
    shine: 'Healthy Satin Glow (3/5)',
    scent: 'Subtle Botanical Essence',
    washability: 'Ringan & Menutrisi',
    size: '100 ml Pump Bottle',
    cocok: 'Curly Hair, Perming Haircut, Wavy Hair, Korean Perm, Textured Curly Crop',
    caraPakai: 'Pump 1-2 tetes ke tangan, usapkan dari tengah hingga ujung rambut saat rambut 70% kering setelah keramas. Remas-remas rambut (scrunching) untuk mengunci bentuk ikal yang elastis.'
  },
  {
    id: 'pomade-clay-special',
    indexStr: '04. SOUTH MATTE CLAY SPECIAL',
    name: 'South Matte Clay Pomade',
    brand: 'by The Presiden Men Supply • Heavy Lock',
    role: 'HEAVY HOLD • DRY MATTE FINISH',
    origin: 'THE PRESIDEN MEN SUPPLY • PALOPO CITY STUDIO',
    category: 'pomade',
    price: 'Rp 110.000',
    rawPrice: 110000,
    img: 'assets/produk_south/pomade_clay.jpeg',
    badge: 'HEAVY LOCK',
    desc: 'Clay pomade dengan daya rekat ekstra kuat bagi pria yang aktif di luar ruangan. Memberikan hasil akhir kering (matte), tidak mengkilap, dan tekstur rambut yang tetap bisa di-restyling ulang kapan saja tanpa harus menambahkan produk lagi.',
    hold: 'Heavy Maximum Hold (5/5)',
    shine: 'Dry Matte (1/5)',
    scent: 'Gentleman Wood & Musk',
    washability: 'Cukup 1-2x Bilas Sampo',
    size: '100 gram',
    cocok: 'Modern Pompadour, High Fade Quiff, Faux Hawk, Textured Slick',
    caraPakai: 'Ratakan secukupnya di telapak tangan hingga tidak ada gumpalan, aplikasikan merata dari akar ke ujung rambut, lalu tata dengan jari atau sisir bergigi rapat.'
  },
  {
    id: 'powder-pro',
    indexStr: '05. SOUTH MATTE POWDER PRO PACK',
    name: 'South Dust It Texture Powder (Pro)',
    brand: 'by SEVICH Original • Sweat Resistant',
    role: 'EXTREME LIFT • OIL CONTROL FORMULA',
    origin: 'SEVICH x SOUTH • PALOPO CITY STUDIO',
    category: 'powder',
    price: 'Rp 85.000',
    rawPrice: 85000,
    img: 'assets/produk_south/powder.jpeg',
    badge: 'OIL CONTROL',
    desc: 'Kemasan praktis travel-friendly untuk Anda yang gemar beraktivitas outdoor atau bermotor. Mengatasi rambut lepek setelah memakai helm dalam hitungan detik. Cukup tabur dan acak, rambut langsung naik bervolume kembali!',
    hold: 'Light-Medium Texture (3/5)',
    shine: 'Natural Zero Shine',
    scent: 'Odorless Fresh',
    washability: '100% Bersih Sekali Bilas',
    size: '8 gram Pro Edition',
    cocok: 'Daily Commuter, Caesar Cut, Short Quiff, Helmet Hair Emergency',
    caraPakai: 'Setelah melepas helm atau saat rambut mulai lepek di siang hari, taburkan sedikit ke area mahkota kepala dan tata kembali rambut dengan jari.'
  },
  {
    id: 'curly-leave-in',
    indexStr: '06. SOUTH CURL NOURISHING ELIXIR',
    name: 'South Kurl Nourishing Leave-In',
    brand: 'by HAIR PRO Hairnerds Professional • Leave-In',
    role: 'ELASTIC BOUNCE • HEAT PROTECTOR',
    origin: 'HAIR PRO x SOUTH • PALOPO CITY STUDIO',
    category: 'curly',
    price: 'Rp 125.000',
    rawPrice: 125000,
    img: 'assets/produk_south/curly.jpeg',
    badge: 'AFTER PERM',
    desc: 'Formula perawatan pasca pengerjaan perming di South Hair Studio. Menjaga bentuk ikal rambut tetap bertahan hingga berbulan-bulan, melindungi batang rambut dari sinar UV matahari Palopo dan panas hair dryer saat blow-dry.',
    hold: 'Flexible Natural Definition',
    shine: 'Natural Healthy Sheen',
    scent: 'Luxury Salon Aroma',
    washability: 'Leave-In (Tanpa Dibilas)',
    size: '100 ml Netto',
    cocok: 'Rambut hasil perming, Down perm, Keriting alami kering, Wavy textured',
    caraPakai: 'Oleskan sebelum mengeringkan rambut dengan hair dryer diffuser atau biarkan mengering alami untuk hasil ikal yang rapi dan terhidrasi.'
  }
];

export default function ProductSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeIdx, setActiveIdx] = useState(0);
  const [modalProduct, setModalProduct] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoSlideActive, setIsAutoSlideActive] = useState(true);

  const sectionRef = useRef(null);
  const isInViewportRef = useRef(false);
  const positionRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const hasMovedRef = useRef(false);
  const isModalOpenRef = useRef(false);
  const isAutoSlideActiveRef = useRef(true);
  const pauseUntilRef = useRef(0);
  const lastAdvanceTimeRef = useRef(Date.now());
  const lastActiveIdxRef = useRef(0);
  const cardElementsRef = useRef({});
  const filteredProductsRef = useRef([]);
  const isMobileRef = useRef(false);
  const animFrameIdRef = useRef(null);
  const pointerDownCardRef = useRef(null);
  const pointerDownTimeRef = useRef(0);
  const isPointerActiveRef = useRef(false);
  const hasCapturedPointerRef = useRef(false);
  const lastClickTimeRef = useRef(0);

  // Silky smooth transition state refs (720ms - balanced, smooth, not rushed)
  const animStartPosRef = useRef(0);
  const animTargetPosRef = useRef(null);
  const animStartTimeRef = useRef(0);
  const animDurationRef = useRef(720);
  const isTransitioningRef = useRef(false);

  const filteredProducts = activeCategory === 'all'
    ? PRODUCTS_DATA
    : PRODUCTS_DATA.filter((p) => p.category === activeCategory);

  filteredProductsRef.current = filteredProducts;

  const safeIdx = activeIdx >= filteredProducts.length ? 0 : activeIdx;
  const currentProd = filteredProducts[safeIdx] || PRODUCTS_DATA[0];

  useEffect(() => {
    isAutoSlideActiveRef.current = isAutoSlideActive;
  }, [isAutoSlideActive]);

  useEffect(() => {
    isModalOpenRef.current = !!modalProduct;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    if (modalProduct) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [modalProduct]);

  // Screen size listener
  useEffect(() => {
    const handleResize = () => {
      isMobileRef.current = typeof window !== 'undefined' && window.innerWidth <= 768;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Silky smooth transition trigger (720ms balanced duration)
  const smoothGoTo = useCallback((target, duration = 720) => {
    animStartPosRef.current = positionRef.current;
    animTargetPosRef.current = target;
    animStartTimeRef.current = performance.now();
    animDurationRef.current = duration;
    isTransitioningRef.current = true;
  }, []);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveIdx(0);
    positionRef.current = 0;
    animTargetPosRef.current = null;
    isTransitioningRef.current = false;
    lastActiveIdxRef.current = 0;
    pauseUntilRef.current = Date.now() + 500;
    lastAdvanceTimeRef.current = Date.now();
  };

  // Nav arrow click: left (prev) and right (next) - smooth & responsive (600ms)
  const handlePrev = useCallback(() => {
    smoothGoTo(Math.round(positionRef.current) - 1, 600);
    pauseUntilRef.current = Date.now() + 2400;
  }, [smoothGoTo]);

  const handleNext = useCallback(() => {
    smoothGoTo(Math.round(positionRef.current) + 1, 600);
    pauseUntilRef.current = Date.now() + 2400;
  }, [smoothGoTo]);

  const handleDotClick = useCallback((targetIdx) => {
    const N = filteredProductsRef.current.length;
    if (N === 0) return;
    const curModulo = ((positionRef.current % N) + N) % N;
    let diff = targetIdx - curModulo;
    if (diff > N / 2) diff -= N;
    if (diff < -N / 2) diff += N;
    smoothGoTo(positionRef.current + diff, 650);
    pauseUntilRef.current = Date.now() + 2400;
  }, [smoothGoTo]);

  // Pointer drag gestures with immediate, reliable card click support
  const handlePointerDown = (e) => {
    if (e.target.closest('.prod-nav-arrow') || e.target.closest('button') || e.target.closest('a')) return;
    isPointerActiveRef.current = true;
    hasMovedRef.current = false;
    hasCapturedPointerRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartPosRef.current = positionRef.current;
    pointerDownTimeRef.current = Date.now();
    isDraggingRef.current = false;

    // Detect if pointerdown started on or inside a product card
    const cardEl = e.target.closest('.prod-card');
    pointerDownCardRef.current = cardEl ? cardEl.getAttribute('data-prod-id') : null;
  };

  const handlePointerMove = (e) => {
    if (!isPointerActiveRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;

    // Only engage drag when cursor or touch actually moves > 6px
    if (!hasMovedRef.current && Math.abs(deltaX) > 6) {
      hasMovedRef.current = true;
      isDraggingRef.current = true;
      setIsDragging(true);
      isTransitioningRef.current = false;
      animTargetPosRef.current = null;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
        hasCapturedPointerRef.current = true;
      } catch (_) {}
    }

    if (isDraggingRef.current) {
      const cardStep = isMobileRef.current ? 130 : 185;
      positionRef.current = dragStartPosRef.current - deltaX / cardStep;
    }
  };

  const handlePointerUp = (e) => {
    if (!isPointerActiveRef.current) return;
    isPointerActiveRef.current = false;

    if (hasCapturedPointerRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
      hasCapturedPointerRef.current = false;
    }

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      pauseUntilRef.current = Date.now() + 2000;
      smoothGoTo(Math.round(positionRef.current), 450);
    } else if (!hasMovedRef.current) {
      // Direct tap/click fallback if browser native click event is suppressed by capturing
      const elapsed = Date.now() - pointerDownTimeRef.current;
      if (elapsed < 600 && pointerDownCardRef.current) {
        const targetId = pointerDownCardRef.current;
        const targetProd = filteredProductsRef.current.find((p) => p.id === targetId);
        const targetIdx = filteredProductsRef.current.findIndex((p) => p.id === targetId);
        if (targetProd) {
          handleCardClick(targetProd, targetIdx);
        }
      }
    }
  };

  const openModal = (prod) => {
    setModalProduct(prod);
  };

  const closeModal = () => {
    setModalProduct(null);
  };

  // CLICK PRODUCT -> INSTANTLY OPEN MODAL & SMOOTHLY ALIGN CAROUSEL
  const handleCardClick = (prod, index) => {
    if (hasMovedRef.current) return;
    const now = Date.now();
    if (now - lastClickTimeRef.current < 250) return;
    lastClickTimeRef.current = now;

    const N = filteredProductsRef.current.length;
    if (N > 0) {
      const curModulo = ((positionRef.current % N) + N) % N;
      let diff = index - curModulo;
      if (diff > N / 2) diff -= N;
      if (diff < -N / 2) diff += N;
      smoothGoTo(positionRef.current + diff, 600);
      pauseUntilRef.current = Date.now() + 3000;
    }
    openModal(prod);
  };

  // Intersection Observer: smoothly starts auto-sliding once section enters viewport from above
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    let hasTriggered = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isInViewportRef.current = true;
            // When user scrolls down into the section from above, trigger smooth entrance glide once
            if (!hasTriggered && entry.boundingClientRect.top < window.innerHeight) {
              hasTriggered = true;
              pauseUntilRef.current = 0;
              lastAdvanceTimeRef.current = Date.now();
              if (!isTransitioningRef.current) {
                smoothGoTo(Math.round(positionRef.current) + 1, 720);
              }
            }
          } else {
            isInViewportRef.current = false;
            hasTriggered = false;
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, [smoothGoTo]);

  // SILKY-SMOOTH 60FPS CAROUSEL ANIMATION LOOP WITH TIMED EASING & LIGHTWEIGHT SHADOW/BLUR
  useEffect(() => {
    lastAdvanceTimeRef.current = Date.now();

    const animate = () => {
      const items = filteredProductsRef.current;
      const N = items.length;

      if (N > 0) {
        const cardStep = isMobileRef.current ? 130 : 185;
        const now = Date.now();
        const perfNow = performance.now();

        // 1. Auto-advance smoothly after resting comfortably at current card (every 2200ms)
        if (
          isInViewportRef.current &&
          isAutoSlideActiveRef.current &&
          !isDraggingRef.current &&
          !isModalOpenRef.current &&
          !isTransitioningRef.current &&
          now > pauseUntilRef.current &&
          now - lastAdvanceTimeRef.current > 2200
        ) {
          smoothGoTo(Math.round(positionRef.current) + 1, 720);
        }

        // 2. Buttery smooth easeInOutCubic interpolator (zero initial kick, zero harsh stop)
        if (isTransitioningRef.current && animTargetPosRef.current !== null) {
          const elapsed = perfNow - animStartTimeRef.current;
          const progress = Math.min(1, Math.max(0, elapsed / animDurationRef.current));

          // easeInOutCubic: smooth acceleration and decelerating float
          const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

          positionRef.current = animStartPosRef.current + (animTargetPosRef.current - animStartPosRef.current) * eased;

          if (progress >= 1) {
            positionRef.current = animTargetPosRef.current;
            animTargetPosRef.current = null;
            isTransitioningRef.current = false;
            lastAdvanceTimeRef.current = Date.now();
          }
        }

        const curPos = positionRef.current;
        const currentSafePos = ((curPos % N) + N) % N;
        const closestIndex = Math.round(currentSafePos) % N;

        items.forEach((p, i) => {
          const el = cardElementsRef.current[p.id];
          if (!el) return;

          let rawDiff = i - currentSafePos;
          let offset = ((rawDiff % N) + N) % N;
          if (offset > N / 2) offset -= N;

          const absOffset = Math.abs(offset);
          const sign = offset >= 0 ? 1 : -1;

          // Non-linear perspective compression: removes wide sparse gaps, creates cohesive layered deck
          const x = sign * (absOffset * cardStep - Math.max(0, absOffset - 1) * (isMobileRef.current ? 10 : 16));

          // Scale: 1.12 at center, 0.92 at neighbor 1, 0.78 at outer 2
          let scale = 1.12 - absOffset * 0.20;
          if (scale < 0.60) scale = 0.60;

          // Y elevation: Center card elevated higher (-12px), neighbors sit lower (+11px)
          const y = -12 + Math.min(absOffset, 2.5) * 11;

          // Z-index: highest at center (25), descending outward
          const zIndex = Math.round(25 - absOffset * 6);

          // Opacity: center 1, neighbor 0.92, outer 0.45, beyond 2.4 fades out
          let opacity = 1;
          if (absOffset > 2.4) {
            opacity = 0;
          } else if (absOffset > 1) {
            opacity = Math.max(0, 0.92 - (absOffset - 1) * 0.55);
          } else {
            opacity = 1 - absOffset * 0.08;
          }

          const brightness = Math.max(0.68, 1 - absOffset * 0.16);

          // Lightweight depth-of-field: zero blur on active center card for crisp text & 60fps scroll
          let filterStr = 'none';
          if (absOffset > 0.35) {
            const blur = Math.min(3.5, (absOffset - 0.35) * 2.2);
            filterStr = `brightness(${brightness.toFixed(2)}) blur(${blur.toFixed(1)}px)`;
          } else if (brightness < 0.98) {
            filterStr = `brightness(${brightness.toFixed(2)})`;
          }

          const isHidden = absOffset > 2.5 || opacity <= 0.01;

          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0px) scale(${scale.toFixed(3)})`;
          el.style.zIndex = zIndex;
          el.style.opacity = opacity.toFixed(3);
          el.style.filter = filterStr;
          el.style.visibility = isHidden ? 'hidden' : 'visible';
          el.style.pointerEvents = isHidden ? 'none' : 'auto';
        });

        if (closestIndex !== lastActiveIdxRef.current) {
          lastActiveIdxRef.current = closestIndex;
          setActiveIdx(closestIndex);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [smoothGoTo]);

  const getWaProductLink = (prod) => {
    const text = encodeURIComponent(
      `Halo South Hair Studio, saya ingin memesan produk grooming:\n` +
      `Produk: ${prod.name}\n` +
      `Harga: ${prod.price}\n\nApakah stok masih tersedia di studio? Terima kasih!`
    );
    return `https://wa.me/6282340069911?text=${text}`;
  };

  return (
    <>
      <section id="produk" ref={sectionRef} className="product-showcase-section">
        <div className="prod-inner-wrap">
          {/* TOP EDITORIAL SUB-NAV */}
          <div className="prod-showcase-top">
            <div className="prod-top-brand">
              <span>SOUTH [PRODUCT]</span>
              <span className="prod-top-badge">06 EDITIONS</span>
            </div>
            <div className="prod-top-filter-group" id="prodFilterTabs">
              <button
                className={`prod-filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                Semua
              </button>
              <button
                className={`prod-filter-btn ${activeCategory === 'pomade' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('pomade')}
              >
                Pomade
              </button>
              <button
                className={`prod-filter-btn ${activeCategory === 'powder' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('powder')}
              >
                Hair Powder
              </button>
              <button
                className={`prod-filter-btn ${activeCategory === 'curly' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('curly')}
              >
                Treatment &amp; Curl
              </button>
            </div>
            <div className="prod-top-studio">
              SOUTH HAIR STUDIO &bull; PALOPO
            </div>
          </div>

          <div className="prod-center-meta-top">
            <span className="prod-kicker-text">{currentProd.indexStr}</span>
          </div>

          {/* COVERFLOW GALLERY STAGE WITH FLANKING LEFT & RIGHT ARROWS */}
          <div
            className={`prod-stage-viewport ${isDragging ? 'is-dragging' : ''}`}
            id="prodStageViewport"
            aria-label="Katalog Produk South Hair Studio"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className="prod-fade-edge left"></div>
            <div className="prod-fade-edge right"></div>

            {/* LEFT ARROW ON THE LEFT FLANK */}
            <button
              type="button"
              className="prod-nav-arrow prev"
              onClick={handlePrev}
              aria-label="Produk Sebelumnya"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>

            {/* RIGHT ARROW ON THE RIGHT FLANK */}
            <button
              type="button"
              className="prod-nav-arrow next"
              onClick={handleNext}
              aria-label="Produk Selanjutnya"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            <div className="prod-cards-track">
              {filteredProducts.map((p, i) => {
                const isActive = i === safeIdx;

                return (
                  <div
                    key={p.id}
                    data-prod-id={p.id}
                    ref={(el) => {
                      if (el) cardElementsRef.current[p.id] = el;
                      else delete cardElementsRef.current[p.id];
                    }}
                    className={`prod-card ${isActive ? 'is-active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(p, i);
                    }}
                    title={`Klik untuk melihat keterangan ${p.name}`}
                  >
                    <div className="prod-card-inner">
                      <span className="prod-card-badge">{p.badge}</span>
                      <div className="prod-card-img-wrap">
                        <img src={p.img} alt={p.name} className="prod-card-img" loading="lazy" />
                      </div>
                      <div className="prod-card-glare"></div>
                      <div className="prod-card-hover-hint">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          <line x1="11" y1="8" x2="11" y2="14"></line>
                          <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                        <span>Lihat Keterangan</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="prod-center-meta-bottom">
            <div className="prod-meta-title">{currentProd.name}</div>
            <div className="prod-meta-role">{currentProd.role}</div>
            <div className="prod-meta-price">{currentProd.price}</div>
            <div className="prod-meta-actions-row">
              <a
                href={getWaProductLink(currentProd)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-prod-buy"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Pesan via WhatsApp</span>
              </a>
              <button
                type="button"
                className="btn-prod-detail"
                onClick={() => openModal(currentProd)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Lihat Detail Spesifikasi</span>
              </button>
            </div>
          </div>

          <div className="prod-controls-bar">
            <button
              type="button"
              className={`prod-auto-spin-btn ${isAutoSlideActive ? 'is-spinning' : ''}`}
              onClick={() => setIsAutoSlideActive((prev) => !prev)}
              aria-label="Toggle Auto Slide"
            >
              <span className="spin-icon-ring"></span>
              <span>Auto-Motion: {isAutoSlideActive ? 'Aktif' : 'Dijeda'}</span>
            </button>
            <span className="prod-drag-hint">&larr; Geser untuk melihat koleksi produk &rarr;</span>
            <div className="prod-dots-nav">
              {filteredProducts.map((_, i) => (
                <div
                  key={i}
                  className={`prod-dot ${i === safeIdx ? 'active' : ''}`}
                  onClick={() => handleDotClick(i)}
                  style={{ cursor: 'pointer' }}
                  title={`Lihat ${filteredProducts[i].name}`}
                />
              ))}
            </div>
          </div>

          <div className="prod-showcase-bottom">
            <div className="prod-giant-title">SOUTHCARE</div>
            <div className="prod-bottom-stat">
              <span className="stat-highlight">PREMIUM GROOMING FORMULA</span>
              <p className="prod-bottom-desc">
                Dirancang untuk menjaga karakter rambut pria tetap segar, sehat, dan bervolume menghadapi iklim tropis Kota Palopo.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* PRODUCT DETAIL MODAL (CENTERED IMAGE, JUSTIFIED TEXT, SMOOTH POP-UP) */}
      {modalProduct && (
        <div className="prod-modal-backdrop" onClick={closeModal}>
          <div className="prod-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="prod-modal-close-btn" onClick={closeModal} aria-label="Tutup Detail Produk">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* CENTERED IMAGE COLUMN */}
            <div className="prod-modal-img-col">
              <div className="prod-modal-img-inner">
                <img src={modalProduct.img} alt={modalProduct.name} className="prod-modal-img" />
                <span className="prod-modal-badge">{modalProduct.badge}</span>
              </div>
            </div>

            {/* STRUCTURED & JUSTIFIED INFO COLUMN */}
            <div className="prod-modal-info-col">
              <div className="prod-modal-kicker">{modalProduct.origin}</div>
              <h3 className="prod-modal-title">{modalProduct.name}</h3>
              <div className="prod-modal-role">{modalProduct.role}</div>

              <div className="prod-modal-price-row">
                <div className="prod-modal-price">{modalProduct.price}</div>
                <div className="prod-modal-stock">Stok Tersedia di Studio Palopo</div>
              </div>

              <div className="prod-modal-desc-wrap">
                <span className="prod-modal-section-title">Deskripsi Produk:</span>
                <p className="prod-modal-desc">{modalProduct.desc}</p>
              </div>

              <div className="prod-specs-grid">
                <div className="prod-spec-item">
                  <span className="spec-label">Hold</span>
                  <span className="spec-val">{modalProduct.hold}</span>
                </div>
                <div className="prod-spec-item">
                  <span className="spec-label">Shine</span>
                  <span className="spec-val">{modalProduct.shine}</span>
                </div>
                <div className="prod-spec-item">
                  <span className="spec-label">Aroma</span>
                  <span className="spec-val">{modalProduct.scent}</span>
                </div>
                <div className="prod-spec-item">
                  <span className="spec-label">Pembersihan</span>
                  <span className="spec-val">{modalProduct.washability}</span>
                </div>
                <div className="prod-spec-item">
                  <span className="spec-label">Ukuran / Netto</span>
                  <span className="spec-val">{modalProduct.size}</span>
                </div>
                <div className="prod-spec-item">
                  <span className="spec-label">Gaya Rambut Cocok</span>
                  <span className="spec-val">{modalProduct.cocok}</span>
                </div>
              </div>

              {modalProduct.caraPakai && (
                <div className="prod-modal-usage-box">
                  <span className="spec-label">Tips Pemakaian:</span>
                  <p className="prod-usage-text">{modalProduct.caraPakai}</p>
                </div>
              )}

              <div className="prod-modal-actions">
                <a
                  href={getWaProductLink(modalProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-modal-wa"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Pesan Sekarang via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
