export function initThemeClientEffects() {
  if (typeof window === 'undefined') return;
  document.documentElement.setAttribute('data-theme', 'theme-default-theme');
}

export default initThemeClientEffects;
