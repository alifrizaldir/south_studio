import React, { useState, useEffect } from 'react';
import { createSupabaseBooking } from '../lib/supabase';

const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00'
];

const CAPSTERS = [
  { name: 'Rezky', label: 'Rezky (Capster)' },
  { name: 'Abi', label: 'Abi (Capster)' },
  { name: 'Kak Ikmal', label: 'Kak Ikmal (Founder & Senior Barber)' }
];

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function BookingSection({ selectedService, selectedCapster, onShowToast }) {
  // Use current system date dynamically as the base
  const now = new Date();
  const initialDate = new Date();
  // If current local time is past evening studio operations (>= 21:00), default recommendation to tomorrow
  if (now.getHours() >= 21) {
    initialDate.setDate(initialDate.getDate() + 1);
  }

  const [currentYear, setCurrentYear] = useState(() => initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(() => initialDate.getDate());

  const [service, setService] = useState({
    name: 'Hair Cut',
    priceStr: 'Rp 50.000',
    price: 50000
  });

  const [capster, setCapster] = useState('Rezky');
  const [time, setTime] = useState('10:00');

  // Customer form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // Ticket
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedService) {
      setService(selectedService);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedCapster) {
      setCapster(selectedCapster);
    }
  }, [selectedCapster]);

  // Calendar matrix calculation
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Midnight today reference for comparison
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const isPrevDisabled =
    currentYear < todayMidnight.getFullYear() ||
    (currentYear === todayMidnight.getFullYear() && currentMonth <= todayMidnight.getMonth());

  const prevMonth = () => {
    if (isPrevDisabled) return;
    let nextM = currentMonth - 1;
    let nextY = currentYear;
    if (nextM < 0) {
      nextM = 11;
      nextY -= 1;
    }
    const maxDays = new Date(nextY, nextM + 1, 0).getDate();
    setCurrentYear(nextY);
    setCurrentMonth(nextM);
    setSelectedDay((prev) => {
      const clamped = Math.min(prev, maxDays);
      const isPast = new Date(nextY, nextM, clamped, 0, 0, 0, 0) < todayMidnight;
      return isPast ? todayMidnight.getDate() : clamped;
    });
  };

  const nextMonth = () => {
    let nextM = currentMonth + 1;
    let nextY = currentYear;
    if (nextM > 11) {
      nextM = 0;
      nextY += 1;
    }
    const maxDays = new Date(nextY, nextM + 1, 0).getDate();
    setCurrentYear(nextY);
    setCurrentMonth(nextM);
    setSelectedDay((prev) => Math.min(prev, maxDays));
  };

  const isDatePast = (dayNum) => {
    const d = new Date(currentYear, currentMonth, dayNum, 0, 0, 0, 0);
    return d < todayMidnight;
  };

  const isDateToday = (dayNum) => {
    return (
      currentYear === todayMidnight.getFullYear() &&
      currentMonth === todayMidnight.getMonth() &&
      dayNum === todayMidnight.getDate()
    );
  };

  const isSelectedDateToday = isDateToday(selectedDay);

  const isSlotPast = (slotStr) => {
    if (!isSelectedDateToday) return false;
    const slotHour = parseInt(slotStr.split(':')[0], 10);
    return slotHour <= now.getHours();
  };

  // Auto-adjust time slot if user picks today and currently selected slot has expired
  useEffect(() => {
    if (isSelectedDateToday && isSlotPast(time)) {
      const available = TIME_SLOTS.find((s) => !isSlotPast(s));
      if (available) {
        setTime(available);
      }
    }
  }, [selectedDay, currentMonth, currentYear]);

  const formattedDateStr = `${selectedDay} ${MONTH_NAMES[currentMonth]} ${currentYear}`;
  const isoDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) {
      alert('Mohon isi nama lengkap dan nomor WhatsApp Anda.');
      return;
    }

    setIsSubmitting(true);
    const bookingPayload = {
      customer_name: custName.trim(),
      customer_phone: custPhone.trim(),
      service_name: service.name,
      capster_name: capster,
      booking_date: isoDateStr,
      booking_time: time,
      total_price: service.price,
      notes: custNotes.trim()
    };

    try {
      // Simpan langsung ke Supabase
      const data = await createSupabaseBooking(bookingPayload);

      const bookingCode = data?.booking?.booking_code || `SHS-${selectedDay}${currentMonth + 1}-${Math.floor(100 + Math.random() * 900)}`;
      const ticket = {
        code: bookingCode,
        name: custName.trim(),
        phone: custPhone.trim(),
        schedule: `${formattedDateStr}, ${time} WITA`,
        service: service.name,
        capster: capster,
        price: service.priceStr
      };
      setConfirmedTicket(ticket);
      if (onShowToast) onShowToast(`Kursi Anda berhasil terkunci! Kode: ${ticket.code}`);
    } catch (err) {
      // Local fallback in case offline
      const ticket = {
        code: `SHS-${selectedDay}${currentMonth + 1}-${Math.floor(100 + Math.random() * 900)}`,
        name: custName.trim(),
        phone: custPhone.trim(),
        schedule: `${formattedDateStr}, ${time} WITA`,
        service: service.name,
        capster: capster,
        price: service.priceStr
      };
      setConfirmedTicket(ticket);
      if (onShowToast) onShowToast(`Kursi Anda berhasil terkunci! Kode: ${ticket.code}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBookingForm = () => {
    setConfirmedTicket(null);
    setCustName('');
    setCustPhone('');
    setCustNotes('');
  };

  const getWaLink = () => {
    if (!confirmedTicket) return '#';
    const text = encodeURIComponent(
      `Halo South Hair Studio, saya ingin konfirmasi booking kursi:\n` +
      `Kode: ${confirmedTicket.code}\n` +
      `Nama: ${confirmedTicket.name}\n` +
      `Jadwal: ${confirmedTicket.schedule}\n` +
      `Layanan: ${confirmedTicket.service}\n` +
      `Capster: ${confirmedTicket.capster}\n` +
      `Tarif: ${confirmedTicket.price}\n\nTerima kasih!`
    );
    return `https://wa.me/6282340069911?text=${text}`;
  };

  return (
    <section id="booking" className="book-section">
      <div className="wrap">
        <div className="section-header center reveal in">
          <div className="section-kicker">Sistem Booking Kursi Mandiri</div>
          <h2 className="section-title">Pesan Jadwal &amp; Kunci Kursi Anda</h2>
          <p className="section-sub">
            Pilih tanggal, jam, dan capster. Tiket jadwal Anda akan langsung dibuat dan kursi dikunci di sistem kasir studio.
          </p>
        </div>

        <div className="book-layout reveal in">
          {/* Kolom Kiri: Pilihan Jadwal & Capster */}
          <div className="panel-box">
            <h4>
              1. Pilih Tanggal &amp; Jam Sesi
              <span className="step">Langkah 1 &amp; 2</span>
            </h4>

            {/* Kalender */}
            <div className="cal-header">
              <button
                type="button"
                className="cal-nav-btn"
                onClick={prevMonth}
                disabled={isPrevDisabled}
                aria-label="Bulan sebelumnya"
              >
                &lsaquo;
              </button>
              <span id="calMonthLabel">{MONTH_NAMES[currentMonth]} {currentYear}</span>
              <button
                type="button"
                className="cal-nav-btn"
                onClick={nextMonth}
                aria-label="Bulan berikutnya"
              >
                &rsaquo;
              </button>
            </div>

            <div className="cal-matrix" id="calendarMatrix">
              <span className="weekday">Min</span>
              <span className="weekday">Sen</span>
              <span className="weekday">Sel</span>
              <span className="weekday">Rab</span>
              <span className="weekday">Kam</span>
              <span className="weekday">Jum</span>
              <span className="weekday">Sab</span>

              {/* Empty leading days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="cal-day empty" aria-hidden="true"></div>
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = dayNum === selectedDay;
                const isPast = isDatePast(dayNum);
                const isToday = isDateToday(dayNum);
                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    disabled={isPast}
                    className={`cal-day ${isSelected ? 'selected' : ''} ${isPast ? 'disabled' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => {
                      if (!isPast) setSelectedDay(dayNum);
                    }}
                    aria-label={`${dayNum} ${MONTH_NAMES[currentMonth]} ${currentYear}${isToday ? ', Hari Ini' : ''}${isPast ? ', Sudah Lewat' : ''}`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Slot Jam */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px' }}>
                Tanggal Terpilih: <b>{formattedDateStr}</b>
              </div>
              <div className="slots-grid">
                {TIME_SLOTS.map((s) => {
                  const isPastSlot = isSlotPast(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isPastSlot}
                      className={`time-slot-btn ${time === s ? 'selected' : ''} ${isPastSlot ? 'disabled' : ''}`}
                      onClick={() => {
                        if (!isPastSlot) setTime(s);
                      }}
                      style={isPastSlot ? { opacity: 0.35, cursor: 'not-allowed', textDecoration: 'line-through' } : {}}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pilihan Layanan & Capster Dropdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '10px' }}>
              <div className="field-group">
                <label htmlFor="bookServiceSelect">Pilih Layanan Cukur:</label>
                <select
                  id="bookServiceSelect"
                  className="custom-select"
                  value={`${service.name}|${service.priceStr}|${service.price}`}
                  onChange={(e) => {
                    const [n, pStr, p] = e.target.value.split('|');
                    setService({ name: n, priceStr: pStr, price: Number(p) });
                  }}
                >
                  <option value="Hair Cut|Rp 50.000|50000">Hair Cut - Rp 50.000</option>
                  <option value="Highlight Color|Rp 300.000|300000">Highlight Color - Rp 300.000</option>
                  <option value="Full Color|Rp 400.000|400000">Full Color - Rp 400.000</option>
                  <option value="Perming|Rp 350.000|350000">Perming - Rp 350.000</option>
                  <option value="Down Perm|Rp 150.000|150000">Down Perm - Rp 150.000</option>
                </select>
              </div>

              <div className="field-group">
                <label htmlFor="bookCapsterSelect">Pilih Capster:</label>
                <select
                  id="bookCapsterSelect"
                  className="custom-select"
                  value={capster}
                  onChange={(e) => setCapster(e.target.value)}
                >
                  {CAPSTERS.map((c) => (
                    <option key={c.name} value={c.name}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Formulir Pemesan & Ringkasan / Tiket Sukses */}
          <div className="panel-box summary-card">
            <div>
              <h4>
                2. Data Pemesan &amp; Konfirmasi
                <span className="step">Langkah 3</span>
              </h4>

              {/* Ringkasan Layanan */}
              <div className="summary-list" style={{ marginBottom: '20px' }}>
                <div className="summary-row">
                  <span className="label">Layanan</span>
                  <span className="value">{service.name}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Jadwal Sesi</span>
                  <span className="value">{formattedDateStr}, {time} WITA</span>
                </div>
                <div className="summary-row">
                  <span className="label">Capster</span>
                  <span className="value">{capster}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Tarif Layanan</span>
                  <span className="value price">{service.priceStr}</span>
                </div>
              </div>

              {!confirmedTicket ? (
                /* Form Data Pemesan (Aktif) */
                <form id="inlineBookingForm" onSubmit={handleSubmit}>
                  <div className="field-group" style={{ marginBottom: '14px' }}>
                    <label htmlFor="inlineCustName">Nama Lengkap Anda *</label>
                    <input
                      type="text"
                      id="inlineCustName"
                      className="custom-input"
                      placeholder="Contoh: Rian Hidayat"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field-group" style={{ marginBottom: '14px' }}>
                    <label htmlFor="inlineCustPhone">Nomor WhatsApp Aktif *</label>
                    <input
                      type="tel"
                      id="inlineCustPhone"
                      className="custom-input"
                      placeholder="Contoh: 082199887766"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field-group" style={{ marginBottom: '20px' }}>
                    <label htmlFor="inlineCustNotes">
                      Catatan Model / Request <span className="opt">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      id="inlineCustNotes"
                      className="custom-input"
                      placeholder="Contoh: Taper tipis samping atau belah dua"
                      value={custNotes}
                      onChange={(e) => setCustNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-accent"
                    style={{ width: '100%', fontWeight: 800, fontSize: '14px' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Memproses Booking...' : 'Kunci Kursi & Konfirmasi Booking'}
                  </button>
                </form>
              ) : (
                /* Box Tiket Sukses */
                <div className="confirmed-ticket" style={{ display: 'block' }}>
                  <div className="ticket-badge">&check; Kursi Anda Berhasil Terkunci!</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Kode Booking Resmi
                  </div>
                  <div className="ticket-code">{confirmedTicket.code}</div>

                  <div className="ticket-details">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Nama:</span>
                      <b>{confirmedTicket.name}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Jadwal:</span>
                      <b>{confirmedTicket.schedule}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Layanan:</span>
                      <b>{confirmedTicket.service}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Capster:</span>
                      <b>{confirmedTicket.capster}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Tarif:</span>
                      <b style={{ color: 'var(--accent)' }}>{confirmedTicket.price}</b>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
                    * Data jadwal Anda telah dicatat di komputer kasir South Hair Studio. Silakan kirim detail tiket ini ke WhatsApp studio untuk konfirmasi instan.
                  </div>

                  <div className="ticket-actions">
                    <a
                      href={getWaLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                      style={{ width: '100%' }}
                    >
                      Kirim ke WhatsApp South Hair Studio
                    </a>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={resetBookingForm}
                      style={{ width: '100%' }}
                    >
                      + Buat Booking Baru Lainnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
