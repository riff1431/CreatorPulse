'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Check if the user has requested reduced motion.
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Hook to stagger reveal a list of child elements matching a selector.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  selector: string,
  options: {
    stagger?: number;
    duration?: number;
    delay?: number;
    y?: number;
    opacity?: number;
  } = {}
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion()) return;

    const elements = containerRef.current.querySelectorAll(selector);
    if (!elements || elements.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        {
          opacity: options.opacity ?? 0,
          y: options.y ?? 20,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: options.duration ?? 0.5,
          delay: options.delay ?? 0.05,
          stagger: options.stagger ?? 0.08,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [selector, options.stagger, options.duration, options.delay, options.y, options.opacity]);

  return containerRef;
}

/**
 * Hook for 3D card hover tilt / parallax effect.
 */
export function useHoverParallax<T extends HTMLElement = HTMLDivElement>(maxTilt = 8) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const tiltX = ((y - centerY) / centerY) * -maxTilt;
      const tiltY = ((x - centerX) / centerX) * maxTilt;

      gsap.to(el, {
        rotationX: tiltX,
        rotationY: tiltY,
        transformPerspective: 1000,
        ease: 'power1.out',
        duration: 0.3,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        rotationX: 0,
        rotationY: 0,
        ease: 'power2.out',
        duration: 0.5,
      });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt]);

  return ref;
}

/**
 * Hook to animate smooth numeric KPI count-up.
 */
export function useAnimatedCounter<T extends HTMLElement = HTMLSpanElement>(
  targetValue: number,
  options: {
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
  } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = `${options.prefix || ''}${targetValue.toFixed(options.decimals || 0)}${options.suffix || ''}`;
      return;
    }

    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: targetValue,
        duration: options.duration ?? 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          if (el) {
            el.textContent = `${options.prefix || ''}${obj.val.toFixed(options.decimals || 0)}${options.suffix || ''}`;
          }
        },
      });
    });

    return () => ctx.revert();
  }, [targetValue, options.duration, options.prefix, options.suffix, options.decimals]);

  return ref;
}

/**
 * Hook for smooth page-level fade and slide-in.
 */
export function usePageTransition<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
}
