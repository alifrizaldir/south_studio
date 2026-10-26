import React from 'react';

export default function LocationSection() {
  return (
    <section id="lokasi" style={{ borderTop: '1px solid var(--line)' }}>
      <div className="wrap">
        <div className="section-header center reveal in">
          <div className="section-kicker">Kunjungi Studio</div>
          <h2 className="section-title">Lokasi &amp; Ulasan Pelanggan</h2>
          <p className="section-sub">Temukan lokasi barbershop kami dengan mudah di pusat Kota Palopo.</p>
        </div>

        <div className="location-layout reveal in">
          <div className="location-map-card">
            <iframe
              className="map-interactive-frame"
              title="Peta Lokasi South Hair Studio Palopo"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15936.840788698188!2d120.1916327!3d-3.0031852!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d91456a00000001%3A0x1b1b1b1b1b1b1b1b!2sJl.%20Andi%20Kambo%2C%20Kota%20Palopo%2C%20Sulawesi%20Selatan!5e0!3m2!1sid!2sid!4v1700000000000"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
            <div className="location-card-footer">
              <div className="location-address-txt">
                No. 139, Jl. Andi Kambo, Kota Palopo
                <span>Buka Setiap Hari: 10:00 - 22:00 WITA</span>
              </div>
              <a
                href="https://maps.google.com/?q=Jl.+Andi+Kambo,+Kota+Palopo"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                Buka di Google Maps &rarr;
              </a>
            </div>
          </div>

          {/* Verified Reviews Column */}
          <div>
            <div className="review-card">
              <div className="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <div className="review-body">
                &ldquo;Potongan rapi dan fade sangat halus. Kak Ikmal sangat detail memperhatikan kontur kepala dan rambut. Tempatnya adem dan nyaman.&rdquo;
              </div>
              <div className="review-author">
                <div className="review-avatar">AP</div>
                <div>Andi Pratama &bull; Pelanggan Reguler</div>
              </div>
            </div>

            <div className="review-card">
              <div className="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <div className="review-body">
                &ldquo;Sistem booking kursinya sangat menolong. Sampai di studio langsung masuk kursi tanpa harus menunggu antre berjam-jam saat jam pulang kantor.&rdquo;
              </div>
              <div className="review-author">
                <div className="review-avatar">RS</div>
                <div>Rizky Syahputra &bull; Booking Online</div>
              </div>
            </div>

            <div className="review-card">
              <div className="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <div className="review-body">
                &ldquo;Langganan sejak buka. Cuci rambut dan pijat kepalanya juara setelah dicukur. Pembayaran QRIS cepat dan tercatat otomatis.&rdquo;
              </div>
              <div className="review-author">
                <div className="review-avatar">DK</div>
                <div>Dedi Kurniawan &bull; Warga Wara Palopo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
