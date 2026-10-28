import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LayananSection from './components/LayananSection';
import BookingSection from './components/BookingSection';
import CapsterSection from './components/CapsterSection';
import ProductSection from './components/ProductSection';
import GallerySection from './components/GallerySection';
import LocationSection from './components/LocationSection';
import Footer from './components/Footer';
import Toast from './components/Toast';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';

// Helper pembersih sesi admin (Session Destroy)
const destroyAdminSession = () => {
  try {
    sessionStorage.removeItem('shs_auth_token');
    sessionStorage.removeItem('shs_auth_user');
    sessionStorage.removeItem('shs_admin_unlocked');
  } catch (e) {
    console.warn('Gagal menghapus sesi admin:', e);
  }
};

const isSessionAuthenticated = () => {
  try {
    return (
      sessionStorage.getItem('shs_admin_unlocked') === 'true' &&
      Boolean(sessionStorage.getItem('shs_auth_token'))
    );
  } catch (e) {
    return false;
  }
};

export default function App() {
  const getInitialRoute = () => {
    const hash = window.location.hash.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    // Ketika halaman admin di-refresh atau dibuka langsung:
    // Hancurkan session dan otomatis kembalikan ke form login admin
    if (hash === '#admin' || pathname === '/admin' || pathname === '/admin.html') {
      destroyAdminSession();
      if (window.location.hash !== '#login') {
        window.location.hash = '#login';
      }
      return 'login';
    }

    if (hash === '#login' || pathname === '/login' || pathname === '/login.html') return 'login';
    return 'home';
  };

  const [route, setRoute] = useState(getInitialRoute);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCapster, setSelectedCapster] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Listener untuk membersihkan sesi saat page reload / refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin') {
        destroyAdminSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin') {
        // Jika mencoba masuk ke admin tanpa sesi aktif, tolak dan arahkan ke login
        if (!isSessionAuthenticated()) {
          destroyAdminSession();
          window.location.hash = '#login';
          setRoute('login');
          return;
        }
        setRoute('admin');
      } else if (hash === '#login') {
        setRoute('login');
      } else if (hash === '' || hash === '#home') {
        setRoute('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newRoute) => {
    setRoute(newRoute);
    if (newRoute === 'admin') window.location.hash = '#admin';
    else if (newRoute === 'login') window.location.hash = '#login';
    else window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3800);
  };

  if (route === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => navigateTo('admin')}
        onBackToHome={() => navigateTo('home')}
      />
    );
  }

  if (route === 'admin') {
    // Session Guard: Pastikan sesi aktif dan valid
    if (!isSessionAuthenticated()) {
      destroyAdminSession();
      if (window.location.hash !== '#login') {
        window.location.hash = '#login';
      }
      return (
        <LoginPage
          onLoginSuccess={() => navigateTo('admin')}
          onBackToHome={() => navigateTo('home')}
        />
      );
    }

    return (
      <>
        <AdminDashboard
          onLogout={() => {
            destroyAdminSession();
            navigateTo('login');
          }}
          onBackToHome={() => navigateTo('home')}
          onShowToast={showToast}
        />
        <Toast message={toastMessage} />
      </>
    );
  }

  return (
    <>
      <Navbar onNavigate={navigateTo} />
      <Hero />
      <LayananSection onSelectService={(svc) => setSelectedService(svc)} />
      <BookingSection
        selectedService={selectedService}
        selectedCapster={selectedCapster}
        onShowToast={showToast}
      />
      <CapsterSection onSelectCapster={(cap) => setSelectedCapster(cap)} />
      <ProductSection />
      <GallerySection />
      <LocationSection />
      <Footer onNavigate={navigateTo} />
      <Toast message={toastMessage} />
    </>
  );
}
