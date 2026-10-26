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

export default function App() {
  const getInitialRoute = () => {
    const hash = window.location.hash.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    if (hash === '#admin' || pathname === '/admin' || pathname === '/admin.html') return 'admin';
    if (hash === '#login' || pathname === '/login' || pathname === '/login.html') return 'login';
    return 'home';
  };

  const [route, setRoute] = useState(getInitialRoute);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCapster, setSelectedCapster] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin') setRoute('admin');
      else if (hash === '#login') setRoute('login');
      else if (hash === '' || hash === '#home') setRoute('home');
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
    return (
      <>
        <AdminDashboard
          onLogout={() => navigateTo('home')}
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
