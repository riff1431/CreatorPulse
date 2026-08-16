'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Starter Theme SDK Hook: Demonstrates GSAP staggered card animations
 */
export function useThemeMotion<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.theme-motion-fade-up', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
}

export default useThemeMotion;
