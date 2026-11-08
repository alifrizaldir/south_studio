import { useState, useEffect, useRef } from 'react';

/**
 * useInView Hook
 * Mendeteksi kapan sebuah elemen/section memasuki viewport pengguna
 * Dilengkapi fitur replay saat di-scroll kembali ke atas agar animasi dapat dinikmati berulang kali.
 */
export function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        } else if (entry.boundingClientRect.top > 0) {
          // Reset saat di-scroll kembali ke atas sehingga animasi dapat diputar ulang secara smooth
          setIsInView(false);
        }
      },
      {
        threshold: options.threshold ?? 0.12,
        rootMargin: options.rootMargin ?? '0px 0px -40px 0px'
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return [ref, isInView];
}

