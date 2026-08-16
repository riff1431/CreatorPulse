import { useEffect } from 'react';

/**
 * Starter Theme SDK Hook: Mounts client-side visual effects and viewport listeners
 */
export function useThemeEffects() {
  useEffect(() => {
    // Example: dynamic header scroll elevation effect
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      document.documentElement.classList.toggle('is-scrolled', isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

export default useThemeEffects;
