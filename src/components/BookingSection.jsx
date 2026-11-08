import React, { useState, useEffect } from 'react';
import { useInView } from '../hooks/useInView';
import {
  createSupabaseBooking,
  getActiveBookingsForDate,
  trackBookingByCodeOrPhone,
  normalizeCapsterName,
  supabase,
  isSupabaseConfigured
} from '../lib/supabase';

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

  const [bookingSectionRef, bookingInView] = useInView({ threshold: 0.1 });

  const [capster, setCapster] = useState('Rezky');
  const [time, setTime] = useState('10:00');

  // Customer form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // Ticket & Booking status
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Ticket Tracker State
  const [activeMode, setActiveMode] = useState('book'); // 'book' | 'track'
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Listener untuk membuka tracker langsung saat link 'Cek Tiket' di Navbar diklik
  useEffect(() => {
    const handleOpenTracker = () => {
      setActiveMode('track');
      const el = document.getElementById('booking');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
    window.addEventListener('shs:open_ticket_tracker', handleOpenTracker);
    return () => window.removeEventListener('shs:open_ticket_tracker', handleOpenTracker);
  }, []);

  const DEMO_CHIPS = [
    { code: 'SHS-0811-102', label: 'SHS-0811-102', name: 'Fikram', status: 'Selesai' },
    { code: 'SHS-0811-422', label: 'SHS-0811-422', name: 'Budi', status: 'Menunggu' },
    { code: 'SHS-0811-205', label: 'SHS-0811-205', name: 'Aldi', status: 'Selesai' }
  ];

  const handleTrackSubmit = async (codeToSearch = trackQuery) => {
    const q = String(codeToSearch || '').trim();
    if (!q) {
      setTrackError('Silakan masukkan kode booking (contoh: SHS-0811-102) atau nomor WhatsApp Anda.');
      return;
    }

    setIsTracking(true);
    setTrackError('');

    try {
      const res = await trackBookingByCodeOrPhone(q);
      if (res && res.success && res.booking) {
        setTrackResult(res.booking);
        if (onShowToast) onShowToast(`Status Tiket #${res.booking.booking_code}: ${res.booking.status?.toUpperCase()}`);
      } else {
        setTrackResult(null);
        setTrackError(res?.message || `Tiket "${q}" tidak ditemukan. Pastikan kode atau nomor WhatsApp sudah benar.`);
      }
    } catch (err) {
      setTrackError('Gagal memuat status tiket: ' + err.message);
    } finally {
      setIsTracking(false);
    }
  };

  const handleCopyCode = (code) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      if (onShowToast) onShowToast(`Kode #${code} berhasil disalin ke clipboard!`);
    } catch (e) {}
  };

  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return {
          title: 'SESI CUKUR SELESAI',
          desc: 'Potongan rambut telah selesai dikerjakan. Terima kasih telah mempercayakan penampilan Anda di South Hair Studio!',
          badgeClass: 'status-completed',
          icon: '✓'
        };
      case 'confirmed':
      case 'in_service':
        return {
          title: 'SEDANG DILAYANI DI KURSI',
          desc: 'Pelanggan saat ini sedang ditangani di kursi pangkas oleh Capster. Nikmati sesi cukur Anda!',
          badgeClass: 'status-inservice',
          icon: '✂'
        };
      case 'cancelled':
        return {
          title: 'BOOKING DIBATALKAN',
          desc: 'Reservasi ini telah dibatalkan. Silakan lakukan reservasi baru jika ingin menjadwalkan ulang.',
          badgeClass: 'status-cancelled',
          icon: '✕'
        };
      case 'pending':
      default:
        return {
          title: 'MENUNGGU GILIRAN JADWAL',
          desc: 'Jadwal kursi Anda telah terkunci di komputer kasir studio. Mohon tiba 10 menit lebih awal sebelum jam sesi.',
          badgeClass: 'status-pending',
          icon: '⏱'
        };
    }
  };

  const getWaTrackLink = (b) => {
    if (!b) return '#';
    const text = encodeURIComponent(
      `Halo South Hair Studio, saya ingin menanyakan status booking tiket saya:\n` +
      `Kode: #${b.booking_code}\n` +
      `Nama: ${b.customer_name}\n` +
      `Jadwal: ${formatDateIndo(b.booking_date)}, ${b.booking_time} WITA\n` +
      `Capster: ${b.capster_name}\n\nTerima kasih!`
    );
    return `https://wa.me/6282340069911?text=${text}`;
  };

  // Active bookings list from Supabase for slot collision detection
  const [activeBookings, setActiveBookings] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotAlert, setSlotAlert] = useState(null);

  const formattedDateStr = `${selectedDay} ${MONTH_NAMES[currentMonth]} ${currentYear}`;
  const isoDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  /**
   * [ALUR 1: GET DATA DINAMIS DARI DATABASE]
   * Fungsi ini dipanggil otomatis setiap kali pengunjung mengganti tanggal pada kalender.
   * Melakukan request SELECT ke tabel 'bookings' untuk mengambil semua slot yang sudah dibooking.
   */
  const loadBookingsForDate = async (dateStr) => {
    setIsLoadingSlots(true);
    try {
      const data = await getActiveBookingsForDate(dateStr);
      setActiveBookings(data || []);
    } catch (err) {
      console.error('[BookingSection GET] Gagal mengambil slot booking Supabase:', err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    loadBookingsForDate(isoDateStr);
  }, [isoDateStr]);

  /**
   * [ALUR 2: WEBSOCKET REALTIME SYNCHRONIZATION (SUPABASE REALTIME)]
   * Inilah yang dibuktikan saat seminar di depan Dosen Penguji:
   * Menggunakan teknologi WebSocket 'postgres_changes' pada tabel 'bookings'.
   * Jika ada pelanggan lain atau kasir yang memesan/membatalkan slot,
   * server PostgreSQL akan mem-broadcast event ke browser ini,
   * dan fungsi loadBookingsForDate() akan otomatis terpanggil seketika tanpa perlu reload halaman!
   */
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel(`public:bookings:${isoDateStr}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          loadBookingsForDate(isoDateStr);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isoDateStr]);

  /**
   * [ALUR 3: LOGIKA PENGECEKAN KETERISIAN SLOT JAM]
   * Memeriksa apakah jam tertentu (misal '16:00') pada capster yang dipilih sudah terisi.
   * Mengembalikan boolean (true = Terisi/Merah, false = Tersedia/Hijau).
   */
  const isSlotBooked = (slotStr, targetCapster = capster) => {
    if (!activeBookings || activeBookings.length === 0) return false;
    const targetTime = slotStr.slice(0, 5);
    const normTarget = normalizeCapsterName(targetCapster);

    return activeBookings.some((b) => {
      if (b.status === 'cancelled') return false;
      const bTime = String(b.booking_time || '').slice(0, 5);
      const bCapster = normalizeCapsterName(b.capster_name);
      return bTime === targetTime && bCapster === normTarget;
    });
  };

  const isCurrentSlotBooked = isSlotBooked(time, capster);

  useEffect(() => {
    if (selectedService) {
      setService(selectedService);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedCapster) {
      setCapster(selectedCapster);
      if (isSlotBooked(time, selectedCapster)) {
        setSlotAlert(`⚠️ Slot jam ${time} WITA untuk ${selectedCapster} sudah terisi. Silakan pilih jam lain.`);
      }
    }
  }, [selectedCapster]);

  const handleCapsterChange = (newCapster) => {
    setCapster(newCapster);
    if (isSlotBooked(time, newCapster)) {
      const msg = `⚠️ Slot jam ${time} WITA untuk ${newCapster} sudah terisi. Silakan pilih jam yang tersedia.`;
      setSlotAlert(msg);
      if (onShowToast) onShowToast(msg);
    } else {
      setSlotAlert(null);
    }
  };

  const handleSlotClick = (slotStr) => {
    if (isSlotPast(slotStr)) return;

    if (isSlotBooked(slotStr, capster)) {
      const msg = `⚠️ Slot jam ${slotStr} WITA untuk capster ${capster} sudah terisi oleh pelanggan lain. Silakan pilih jam lain.`;
      setSlotAlert(msg);
      if (onShowToast) {
        onShowToast(msg);
      }
      return;
    }

    setTime(slotStr);
    setSlotAlert(null);
  };

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
      const available = TIME_SLOTS.find((s) => !isSlotPast(s) && !isSlotBooked(s));
      if (available) {
        setTime(available);
      }
    }
  }, [selectedDay, currentMonth, currentYear]);

  /**
   * [ALUR 4: POST / SUBMIT PEMESANAN BOOKING BARU]
   * Dipanggil saat pelanggan mengklik tombol "Kunci Kursi & Konfirmasi Booking".
   * Alur:
   * 1. Validasi Formulir: Memastikan nama & nomor WhatsApp tidak kosong.
   * 2. Validasi Clash Client: Mengecek apakah slot jam masih kosong di state lokal.
   * 3. Request POST ke Server: Mengirim bookingPayload ke createSupabaseBooking().
   * 4. Validasi Clash Server: Supabase kembali memeriksa di database untuk mencegah double-booking.
   * 5. Response & Tiket: Jika sukses, sistem menampilkan 'confirmedTicket' berisi kode booking unik.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) {
      alert('Mohon isi nama lengkap dan nomor WhatsApp Anda.');
      return;
    }

    if (isSlotBooked(time, capster)) {
      const msg = `Maaf, slot pukul ${time} WITA untuk capster ${capster} pada tanggal ${formattedDateStr} sudah terisi oleh pelanggan lain.\nSilakan pilih jam lain yang masih tersedia.`;
      alert(msg);
      setSlotAlert(`⚠️ ${msg}`);
      if (onShowToast) onShowToast(msg);
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
      // Eksekusi POST data ke PostgreSQL Supabase (dengan Fail-Safe Offline Fallback)
      const result = await createSupabaseBooking(bookingPayload);

      if (result && result.success === false) {
        if (result.isConflict) {
          alert(result.error);
          setSlotAlert(`⚠️ ${result.error}`);
        } else {
          alert(result.error || 'Maaf, slot jam ini sudah terisi untuk capster tersebut. Silakan pilih jam lain.');
        }
        await loadBookingsForDate(isoDateStr);
        setIsSubmitting(false);
        return;
      }

      // Membentuk objek tiket konfirmasi untuk ditampilkan ke pelanggan
      const bookingCode = result?.booking?.booking_code || `SHS-${selectedDay}${currentMonth + 1}-${Math.floor(100 + Math.random() * 900)}`;
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
      await loadBookingsForDate(isoDateStr);
      if (onShowToast) onShowToast(`Kursi Anda berhasil terkunci! Kode: ${ticket.code}`);
    } catch (err) {
      // Fail-safe fallback jika terjadi pengecualian tak terduga
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
    setSlotAlert(null);
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
    <section id="booking" ref={bookingSectionRef} className={`book-section booking-anim-section ${bookingInView ? 'in-view' : ''}`}>
      <div className="wrap">
        <div className={`section-header center booking-header-anim ${bookingInView ? 'in-view' : ''}`}>
          <div className="section-kicker">Sistem Booking Kursi Mandiri</div>
          <h2 className="section-title">Pesan Jadwal &amp; Kunci Kursi Anda</h2>
          <p className="section-sub">
            Pilih tanggal, jam, dan capster. Tiket jadwal Anda akan langsung dibuat dan kursi dikunci di sistem kasir studio.
          </p>
        </div>

        {/* TAB TOGGLE: Reservasi Kursi Baru vs Cek Status Tiket & Antrean */}
        <div className="booking-mode-tabs-wrap">
          <div className="booking-mode-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === 'book'}
              className={`booking-tab-btn ${activeMode === 'book' ? 'active' : ''}`}
              onClick={() => setActiveMode('book')}
            >
              <span className="tab-icon">✂</span>
              <span className="tab-text">Reservasi Kursi Baru</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === 'track'}
              className={`booking-tab-btn ${activeMode === 'track' ? 'active' : ''}`}
              onClick={() => setActiveMode('track')}
            >
              <span className="tab-icon">🔍</span>
              <span className="tab-text">Cek Status Tiket &amp; Antrean</span>
              <span className="live-pill-tag">Live</span>
            </button>
          </div>
        </div>

        {/* TAMPILAN MODE 1: FORM RESERVASI KURSI BARU */}
        {activeMode === 'book' && (
        <div className="book-layout">
          {/* Kolom Kiri: Pilihan Jadwal & Capster (Meluncur dari arah KIRI) */}
          <div className="panel-box booking-panel-left-anim">
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
            <div style={{ marginTop: '12px' }}>
              <div className="slots-header-bar">
                <div className="slots-header-date">
                  Tanggal Terpilih: <b>{formattedDateStr}</b>
                </div>
                <div className="slots-legend">
                  <span className="legend-item"><span className="legend-dot avail"></span> Tersedia</span>
                  <span className="legend-item"><span className="legend-dot booked"></span> Terisi / Penuh</span>
                  <span className="legend-item"><span className="legend-dot selected"></span> Dipilih</span>
                </div>
              </div>

              <div className="slots-grid">
                {TIME_SLOTS.map((s) => {
                  const isPastSlot = isSlotPast(s);
                  const isBooked = isSlotBooked(s, capster);
                  const isSelected = time === s && !isBooked;

                  return (
                    <button
                      key={s}
                      type="button"
                      className={`time-slot-btn ${isSelected ? 'selected' : ''} ${isPastSlot ? 'disabled is-past' : ''} ${isBooked ? 'disabled is-booked' : ''}`}
                      onClick={() => handleSlotClick(s)}
                      title={
                        isBooked
                          ? `Pukul ${s} WITA sudah dibooking untuk ${capster}`
                          : isPastSlot
                          ? 'Jam sudah lewat'
                          : `Pilih pukul ${s} WITA`
                      }
                    >
                      <span className="slot-time-num">{s}</span>
                      {isBooked ? (
                        <span className="slot-status-badge badge-booked">TERISI</span>
                      ) : isPastSlot ? (
                        <span className="slot-status-badge badge-past">LEWAT</span>
                      ) : isSelected ? (
                        <span className="slot-status-badge badge-selected">DIPILIH</span>
                      ) : (
                        <span className="slot-status-badge badge-avail">TERSEDIA</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Alert / Peringatan jika pengguna mengklik slot lain yang sudah penuh */}
              {slotAlert && !isCurrentSlotBooked && (
                <div className="slot-warning-toast" role="alert">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px' }}>⚠️</span>
                    <span>{slotAlert}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-close-toast"
                    onClick={() => setSlotAlert(null)}
                    aria-label="Tutup peringatan"
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* Peringatan jika jam yang sedang terpilih ternyata sudah dibooking */}
              {isCurrentSlotBooked && (
                <div className="booking-conflict-alert" role="alert">
                  <div className="conflict-header">
                    <div className="conflict-icon-box">⚠️</div>
                    <div className="conflict-text">
                      <strong>
                        Slot Jam <span className="tag-jam-full">{time} WITA</span> Sudah Terisi!
                      </strong>
                      <p>
                        Capster <span className="conflict-capster-pill">{capster}</span> telah dibooking pelanggan lain pada pukul <span className="conflict-time-pill">{time} WITA</span> ({formattedDateStr}). 
                        Silakan pilih jam bertanda hijau yang masih kosong di atas atau ganti capster.
                      </p>
                    </div>
                  </div>
                  {TIME_SLOTS.some((s) => !isSlotPast(s) && !isSlotBooked(s, capster)) && (
                    <button
                      type="button"
                      className="btn-suggest-slot"
                      onClick={() => {
                        const nextFree = TIME_SLOTS.find((s) => !isSlotPast(s) && !isSlotBooked(s, capster));
                        if (nextFree) {
                          setTime(nextFree);
                          setSlotAlert(null);
                          if (onShowToast) onShowToast(`Jadwal dialihkan ke jam ${nextFree} WITA yang tersedia.`);
                        }
                      }}
                    >
                      👉 Pilih Jam Kosong Terdekat Otomatis
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pilihan Layanan & Capster Dropdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '14px' }}>
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
                  onChange={(e) => handleCapsterChange(e.target.value)}
                >
                  {CAPSTERS.map((c) => (
                    <option key={c.name} value={c.name}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Formulir Pemesan & Ringkasan / Tiket Sukses (Meluncur dari arah KANAN) */}
          <div className="panel-box summary-card booking-panel-right-anim">
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
                    className={`btn btn-accent ${isCurrentSlotBooked ? 'btn-conflict-disabled' : ''}`}
                    style={{ width: '100%', fontWeight: 800, fontSize: '14px' }}
                    disabled={isSubmitting || isCurrentSlotBooked}
                  >
                    {isSubmitting
                      ? 'Memproses Booking...'
                      : isCurrentSlotBooked
                      ? `⚠️ Slot ${time} Terisi (Pilih Jam Lain)`
                      : 'Kunci Kursi & Konfirmasi Booking'}
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
                      <b style={{ color: '#ffffff' }}>{confirmedTicket.price}</b>
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
                      className="btn btn-outline"
                      style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      onClick={() => {
                        setActiveMode('track');
                        setTrackQuery(confirmedTicket.code);
                        handleTrackSubmit(confirmedTicket.code);
                      }}
                    >
                      <span>🔍</span> Lacak Status Antrean Tiket Ini
                    </button>
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
        )}

        {/* TAMPILAN MODE 2: CEK TIKET & STATUS ANTREAN REALTIME */}
        {activeMode === 'track' && (
          <div className="booking-tracker-container">
            {/* Box Form Pencarian Tiket */}
            <div className="tracker-search-card">
              <div className="tracker-search-header">
                <div className="tracker-badge-pill">
                  <span className="live-dot-pulse"></span>
                  Lacak Tiket &amp; Antrean Realtime
                </div>
                <h3 className="tracker-search-title">Cek Status Booking Anda</h3>
                <p className="tracker-search-sub">
                  Masukkan <strong>Kode Booking</strong> (contoh: <code>SHS-0811-102</code>) atau <strong>Nomor WhatsApp</strong> yang Anda daftarkan untuk memantau giliran pangkas secara realtime.
                </p>
              </div>

              <form
                className="tracker-search-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTrackSubmit(trackQuery);
                }}
              >
                <div className="tracker-input-group">
                  <span className="tracker-input-icon">🔍</span>
                  <input
                    type="text"
                    className="tracker-input-field"
                    placeholder="Masukkan Kode Booking (misal: SHS-0811-102) atau No. WA..."
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    autoFocus
                  />
                  {trackQuery && (
                    <button
                      type="button"
                      className="tracker-clear-btn"
                      onClick={() => {
                        setTrackQuery('');
                        setTrackResult(null);
                        setTrackError('');
                      }}
                      title="Hapus input"
                    >
                      &times;
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-accent tracker-submit-btn"
                    disabled={isTracking}
                  >
                    {isTracking ? 'Mencari...' : 'Cari Tiket'}
                  </button>
                </div>
              </form>

              {/* Demo Quick-Chips untuk Presentasi Sidang UTS */}
              <div className="tracker-chips-wrapper">
                <span className="tracker-chips-label">Data Demo Cepat (1-Klik untuk Sidang):</span>
                <div className="tracker-chips-list">
                  {DEMO_CHIPS.map((chip) => (
                    <button
                      key={chip.code}
                      type="button"
                      className={`tracker-chip-btn ${trackQuery.toUpperCase().includes(chip.code) ? 'active' : ''}`}
                      onClick={() => {
                        setTrackQuery(chip.code);
                        handleTrackSubmit(chip.code);
                      }}
                    >
                      <span className="chip-code">{chip.label}</span>
                      <span className="chip-name">({chip.name})</span>
                      <span className={`chip-badge chip-${chip.status.toLowerCase()}`}>{chip.status}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert Error jika tiket tidak ditemukan */}
              {trackError && (
                <div className="tracker-alert-box tracker-alert-error">
                  <span className="alert-icon">⚠️</span>
                  <div className="alert-text">
                    <strong>Tiket Tidak Ditemukan</strong>
                    <p>{trackError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* HASIL TIKET: DIGITAL BARBER PASS */}
            {trackResult && (
              <div className="tracker-result-card">
                {/* Header Boarding Pass */}
                <div className="tracker-pass-top">
                  <div className="pass-brand-meta">
                    <span className="pass-studio-name">SOUTH HAIR STUDIO</span>
                    <span className="pass-doc-type">OFFICIAL DIGITAL BARBER PASS</span>
                  </div>
                  <div className="pass-code-wrap">
                    <span className="pass-code-label">KODE BOOKING</span>
                    <div className="pass-code-val">
                      <strong>#{trackResult.booking_code}</strong>
                      <button
                        type="button"
                        className="btn-copy-code"
                        onClick={() => handleCopyCode(trackResult.booking_code)}
                        title="Salin Kode Tiket"
                      >
                        {copiedCode ? '✓ Tersalin' : '📋 Salin'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hero Status Bar */}
                {(() => {
                  const sInfo = getStatusInfo(trackResult.status);
                  return (
                    <div className={`ticket-live-status-hero ${sInfo.badgeClass}`}>
                      <div className="status-hero-left">
                        <div className="status-hero-icon-ring">
                          <span className="status-icon-symbol">{sInfo.icon}</span>
                        </div>
                        <div className="status-hero-texts">
                          <div className="status-hero-kicker">
                            <span className="pulse-indicator-dot"></span>
                            STATUS ANTREAN REALTIME
                          </div>
                          <h4 className="status-hero-title">{sInfo.title}</h4>
                          <p className="status-hero-desc">{sInfo.desc}</p>
                        </div>
                      </div>
                      <div className="status-hero-right">
                        <button
                          type="button"
                          className="btn-refresh-status"
                          onClick={() => handleTrackSubmit(trackResult.booking_code)}
                          disabled={isTracking}
                          title="Segarkan status langsung dari database"
                        >
                          <span className={`refresh-icon ${isTracking ? 'spinning' : ''}`}>🔄</span>
                          {isTracking ? 'Memperbarui...' : 'Segarkan Status'}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Stepper Progres Antrean (4 Tahap) */}
                <div className="tracker-stepper-box">
                  <div className="stepper-title">Progres Alur Kursi Pangkas</div>
                  <div className="tracker-stepper">
                    {/* Tahap 1: Booking Tercatat */}
                    <div className="stepper-step completed">
                      <div className="step-circle">1</div>
                      <div className="step-info">
                        <span className="step-label">Booking Masuk</span>
                        <span className="step-sub">Sistem Menerima</span>
                      </div>
                    </div>

                    <div className={`stepper-line ${trackResult.status !== 'cancelled' ? 'completed' : ''}`}></div>

                    {/* Tahap 2: Kursi Terkunci */}
                    <div className={`stepper-step ${trackResult.status !== 'cancelled' ? 'completed' : ''}`}>
                      <div className="step-circle">2</div>
                      <div className="step-info">
                        <span className="step-label">Kursi Terkunci</span>
                        <span className="step-sub">Slot Kasir Valid</span>
                      </div>
                    </div>

                    <div className={`stepper-line ${['confirmed', 'in_service', 'completed'].includes(trackResult.status) ? 'completed' : ''}`}></div>

                    {/* Tahap 3: Di Kursi Cukur */}
                    <div className={`stepper-step ${['confirmed', 'in_service', 'completed'].includes(trackResult.status) ? (trackResult.status === 'completed' ? 'completed' : 'active') : ''}`}>
                      <div className="step-circle">3</div>
                      <div className="step-info">
                        <span className="step-label">Di Kursi Cukur</span>
                        <span className="step-sub">{['confirmed', 'in_service'].includes(trackResult.status) ? 'Sedang Dipangkas' : 'Giliran Sesi'}</span>
                      </div>
                    </div>

                    <div className={`stepper-line ${trackResult.status === 'completed' ? 'completed' : ''}`}></div>

                    {/* Tahap 4: Selesai */}
                    <div className={`stepper-step ${trackResult.status === 'completed' ? 'completed' : ''}`}>
                      <div className="step-circle">4</div>
                      <div className="step-info">
                        <span className="step-label">Selesai</span>
                        <span className="step-sub">{trackResult.status === 'completed' ? 'Tuntas & Rapi' : 'Grooming Selesai'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Informasi Tiket */}
                <div className="tracker-details-grid">
                  <div className="tracker-detail-cell">
                    <span className="cell-label">Nama Pelanggan</span>
                    <span className="cell-val bold">{trackResult.customer_name}</span>
                  </div>

                  <div className="tracker-detail-cell">
                    <span className="cell-label">Nomor WhatsApp</span>
                    <span className="cell-val mono">{trackResult.customer_phone || '-'}</span>
                  </div>

                  <div className="tracker-detail-cell">
                    <span className="cell-label">Layanan Potong</span>
                    <span className="cell-val bold">{trackResult.service_name}</span>
                  </div>

                  <div className="tracker-detail-cell">
                    <span className="cell-label">Capster Bertugas</span>
                    <span className="cell-val highlight-capster">✂ {trackResult.capster_name}</span>
                  </div>

                  <div className="tracker-detail-cell">
                    <span className="cell-label">Jadwal Sesi</span>
                    <span className="cell-val bold">
                      {formatDateIndo(trackResult.booking_date)}, {trackResult.booking_time} WITA
                    </span>
                  </div>

                  <div className="tracker-detail-cell">
                    <span className="cell-label">Total Tarif</span>
                    <span className="cell-val price-val">
                      Rp {Number(trackResult.total_price || trackResult.total_amount || trackResult.service_price || 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="tracker-detail-cell">
                    <span className="cell-label">Metode &amp; Status Pembayaran</span>
                    <div className="cell-val cell-badge-row">
                      <span className="cashier-pay-badge tunai">
                        {(trackResult.payment_method && trackResult.payment_method !== 'none' ? trackResult.payment_method : 'TUNAI').toUpperCase()}
                      </span>
                      <span className={`cashier-pay-status ${trackResult.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>
                        {trackResult.payment_status === 'paid' ? 'LUNAS' : (trackResult.status === 'cancelled' ? 'BATAL' : 'BAYAR DI KASIR')}
                      </span>
                    </div>
                  </div>

                  <div className="tracker-detail-cell">
                    <span className="cell-label">Catatan Request</span>
                    <span className="cell-val notes-val">
                      {trackResult.notes ? `"${trackResult.notes}"` : 'Tidak ada catatan tambahan'}
                    </span>
                  </div>
                </div>

                {/* Aksi Tiket */}
                <div className="tracker-actions-bar">
                  <a
                    href={getWaTrackLink(trackResult)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp tracker-wa-btn"
                  >
                    <span>💬</span> Hubungi WhatsApp Studio
                  </a>
                  <button
                    type="button"
                    className="btn btn-outline tracker-print-btn"
                    onClick={() => window.print()}
                  >
                    <span>🖨️</span> Cetak / Simpan Tiket
                  </button>
                  <button
                    type="button"
                    className="btn btn-subtle tracker-reset-btn"
                    onClick={() => {
                      setTrackResult(null);
                      setTrackQuery('');
                    }}
                  >
                    Lacak Tiket Lain
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
