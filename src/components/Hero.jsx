import React from 'react';

export default function Hero() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-section" style={{ padding: 0 }}>
        <div className="hero-grid">
          {/* Left Column: Editorial Headline & Story */}
          <div className="hero-content reveal in">
            <div className="hero-kicker">BARBERSHOP - PALOPO</div>

            <div className="hero-script-wrap">
              <span className="hero-script-text">South Hair Studio</span>
            </div>

            <h1 className="hero-title">
              Fresh Cuts Only<br />
              On The South Side.
            </h1>

            <p className="hero-desc">
              South Hair Studio dibangun untuk pria modern yang menuntut lebih dari sekadar potongan rambut, dengan estetika yang matang dan pengalaman booking yang mulus. Karena waktu dan penampilan Anda sama-sama penting.
            </p>

            {/* CTA Action Buttons */}
            <div className="hero-cta-group">
              <a href="#booking" className="btn">Jadwalkan Kursi Sekarang</a>
              <a href="#layanan" className="btn btn-outline">Lihat Tarif Layanan</a>
            </div>

            <div className="hero-meta-footer">
              <div className="hero-meta-col">
                <div className="hero-meta-label">Alamat Studio</div>
                <div className="hero-meta-val">No. 139, Jl. Andi Kambo, Kota Palopo</div>
              </div>
              <div className="hero-meta-col">
                <div className="hero-meta-label">Jam Operasional</div>
                <div className="hero-meta-val">Setiap Hari 10:00 - 22:00 WITA</div>
              </div>
              <div className="hero-meta-col">
                <div className="hero-meta-label">WhatsApp &amp; Sosial</div>
                <div className="hero-meta-social">
                  <a href="https://wa.me/6282340069911" target="_blank" rel="noopener noreferrer">WhatsApp</a> &bull;{' '}
                  <a href="https://www.instagram.com/southhairstudio.id" target="_blank" rel="noopener noreferrer">IG</a> &bull;{' '}
                  <a href="https://tiktok.com/@southhairstudio" target="_blank" rel="noopener noreferrer">TikTok</a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Precision Barber Photography */}
          <div className="hero-image-pane">
            <img src="assets/hero_barber_clipper.jpg" alt="Barber memotong rambut presisi di South Hair Studio Palopo" loading="eager" />
            <div className="hero-image-overlay">
              <div className="hero-tagline">Master Barber &bull; Classic &amp; Modern Fade</div>
            </div>
          </div>
        </div>
      </section>

      {/* TENTANG KAMI */}
      <section id="tentang">
        <div className="wrap">
          <div className="about-layout reveal in">
            {/* Left: Overlapping Tilted Polaroid Art Cards */}
            <div className="about-collage-container">
              <div className="about-collage-wrap">
                <div className="about-polaroid card-behind">
                  <img src="assets/tentang_chair.jpg" alt="Kursi barber klasik South Hair Studio" loading="lazy" />
                </div>
                <div className="about-polaroid card-front">
                  <img src="assets/tentang_barber.jpg" alt="Tradisi barbershop berkelas South Hair Studio" loading="lazy" />
                </div>
              </div>
            </div>

            {/* Right: Content Text Pane */}
            <div className="about-text-pane">
              <h2 className="about-title">Tentang Kami</h2>
              <p>
                South Hair Studio berdiri pada 25 Mei 2025, dirintis oleh Kak Ikmal yang sebelumnya bekerja sebagai karyawan di barbershop lain. Kami fokus pada potongan presisi dan perawatan rambut pria, dikerjakan oleh capster yang menguasai gaya klasik maupun modern.
              </p>
              <p>
                Dari gaya kerja harian hingga detail akhir, kami berkomitmen memastikan setiap pelanggan pulang dengan penampilan dan rasa percaya diri yang lebih baik.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
