/**
 * Starter Theme client-side interactive effects
 * Demonstrates how to register scroll listeners or micro-interactions.
 */
export function initThemeEffects() {
  if (typeof window === 'undefined') return;

  console.log('[Theme: Starter] Initializing client-side effects...');

  // Set css custom property mapping to dynamic scroll position
  const handleScroll = () => {
    const scrollY = window.scrollY;
    document.documentElement.style.setProperty('--theme-scroll-y', `${scrollY}px`);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}
