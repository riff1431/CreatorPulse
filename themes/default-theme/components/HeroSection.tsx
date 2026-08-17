'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, ArrowRight, ShieldCheck, Zap, CheckCircle2, 
  Heart, Play, Lock, Eye, Flame, Star, ChevronRight, ChevronLeft
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import gsap from 'gsap';

interface CardItem {
  id: string;
  title: string;
  creator: string;
  handle: string;
  category: string;
  image: string;
  price: string;
  likes: string;
  isVip?: boolean;
  accentColor: string;
  angle: number;
  desktopX: number;
}

const CARDS_DATA: CardItem[] = [
  {
    id: 'c1',
    title: 'Neon Tokyo Odyssey',
    creator: 'Kaito Tanaka',
    handle: '@kaito_art',
    category: 'Digital Art',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    price: '$12.00',
    likes: '2.4k',
    isVip: true,
    accentColor: '#EC4899',
    angle: -14,
    desktopX: -180,
  },
  {
    id: 'c2',
    title: 'Analog Beats Vault',
    creator: 'Marcus Vance',
    handle: '@marcus_beats',
    category: 'Music Producer',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    price: '$18.00',
    likes: '4.8k',
    accentColor: '#8B5CF6',
    angle: -7,
    desktopX: -90,
  },
  {
    id: 'c3',
    title: 'Editorial Portrait Masterclass',
    creator: 'Elena Rostova',
    handle: '@elena_visuals',
    category: 'Photography',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    price: '$25.00',
    likes: '8.9k',
    isVip: true,
    accentColor: '#F43F5E',
    angle: 0,
    desktopX: 0,
  },
  {
    id: 'c4',
    title: '3D Spatial Aesthetics',
    creator: 'Sophia Chen',
    handle: '@sophia_3d',
    category: '3D & Motion',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    price: '$15.00',
    likes: '3.6k',
    accentColor: '#06B6D4',
    angle: 7,
    desktopX: 90,
  },
  {
    id: 'c5',
    title: 'Cyberpunk Soundscapes',
    creator: 'Alex Rivera',
    handle: '@rivera_sound',
    category: 'Audio Design',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    price: '$9.99',
    likes: '5.1k',
    isVip: true,
    accentColor: '#10B981',
    angle: 14,
    desktopX: 180,
  },
];

export const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(2); // Center card active by default
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isFanned, setIsFanned] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Detect viewport size dynamically
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Entrance animations
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Fade in texts
      gsap.fromTo(
        '.hero-anim-text',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );

      // Card entrance fanning
      const cards = gsap.utils.toArray<HTMLElement>('.hero-fan-card');
      gsap.fromTo(
        cards,
        { 
          opacity: 0, 
          scale: 0.8, 
          y: 40,
          rotation: 0,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.06,
          ease: 'elastic.out(1, 0.8)',
          onComplete: () => {
            setIsFanned(true);
          }
        }
      );

      // Floating handles
      gsap.fromTo(
        '.floating-handle',
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.7, delay: 0.4, stagger: 0.1, ease: 'back.out(1.7)' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Mouse tilt for desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardsRef.current) return;
    const rect = cardsRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setHoveredCard(null);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 40 && activeCardIndex < CARDS_DATA.length - 1) {
      // Swiped left -> next card
      setActiveCardIndex(prev => prev + 1);
    } else if (diff < -40 && activeCardIndex > 0) {
      // Swiped right -> previous card
      setActiveCardIndex(prev => prev - 1);
    }
    setTouchStart(null);
  };

  return (
    <section 
      ref={containerRef}
      className="relative overflow-hidden pt-6 pb-14 sm:pt-12 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center select-none"
    >
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] lg:w-[800px] h-[300px] sm:h-[450px] bg-gradient-to-tr from-[#EC4899]/15 via-[#8B5CF6]/10 to-[#F43F5E]/15 blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Top Pill Badge */}
      <div className="hero-anim-text mb-4 sm:mb-6 inline-flex items-center">
        <Badge variant="gradient" size="md">
          <Sparkles size={13} className="text-[#EC4899]" />
          <span className="text-[11px] sm:text-xs font-black">Next-Gen Creator Monetization Platform</span>
        </Badge>
      </div>

      {/* Main Responsive Headline */}
      <div className="text-center space-y-3 sm:space-y-4 max-w-4xl mx-auto px-2">
        <h1 className="hero-anim-text text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] sm:leading-[1.06] text-[#18181B] dark:text-[#FDF2F8]">
          A place to display your{' '}
          <span className="bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#FB7185] bg-clip-text text-transparent inline-block">
            masterpiece.
          </span>
        </h1>

        <p className="hero-anim-text text-xs xs:text-sm sm:text-base lg:text-lg text-[#71717A] dark:text-[#D4B8D0] leading-relaxed max-w-2xl mx-auto font-medium">
          Empower your creative community with tiered VIP subscriptions, paywalled exclusive drops, 24-hour status stories, and instant fan tips.
        </p>
      </div>

      {/* Mobile Floating Tags Strip */}
      <div className="hero-anim-text flex md:hidden items-center justify-center gap-2 mt-4 flex-wrap max-w-xs sm:max-w-md">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/80 dark:bg-[#1A1222]/80 border border-[#F3DCE8] dark:border-[#3A2A4C] text-[#EC4899] shadow-2xs">
          @sophia_3d
        </span>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/80 dark:bg-[#1A1222]/80 border border-[#F3DCE8] dark:border-[#3A2A4C] text-emerald-600 dark:text-emerald-400 shadow-2xs">
          @kaito_art
        </span>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/80 dark:bg-[#1A1222]/80 border border-[#F3DCE8] dark:border-[#3A2A4C] text-indigo-600 dark:text-indigo-400 shadow-2xs">
          @elena_visuals
        </span>
      </div>

      {/* 3D Fanning Card Deck Container */}
      <div 
        ref={cardsRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-5xl h-[290px] xs:h-[330px] sm:h-[400px] lg:h-[450px] my-6 sm:my-10 flex items-center justify-center perspective-[1200px] touch-pan-y"
      >
        {/* Desktop Floating Creator Badges */}
        <div className="floating-handle absolute top-4 left-6 sm:left-14 z-30 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#1A1222]/90 backdrop-blur-md border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-lg shadow-pink-500/10 text-xs font-black text-[#BE185D] dark:text-[#F472B6] animate-bounce" style={{ animationDuration: '4s' }}>
          <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-ping" />
          <span>@sophia_3d</span>
        </div>

        <div className="floating-handle absolute top-8 right-6 sm:right-16 z-30 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#1A1222]/90 backdrop-blur-md border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-lg shadow-pink-500/10 text-xs font-black text-emerald-600 dark:text-emerald-400 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1s' }}>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>@kaito_art</span>
        </div>

        <div className="floating-handle absolute bottom-8 left-10 sm:left-20 z-30 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#1A1222]/90 backdrop-blur-md border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-lg shadow-pink-500/10 text-xs font-black text-indigo-600 dark:text-indigo-400 animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}>
          <span>@elena_visuals</span>
        </div>

        <div className="floating-handle absolute bottom-10 right-10 sm:right-24 z-30 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#1A1222]/90 backdrop-blur-md border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-lg shadow-pink-500/10 text-xs font-black text-amber-600 dark:text-amber-400 animate-bounce" style={{ animationDuration: '4.2s', animationDelay: '1.5s' }}>
          <span>@marcus_beats</span>
        </div>

        {/* Dynamic 3D Transform Wrapper */}
        <div 
          className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{
            transform: !isMobile
              ? `rotateY(${mousePos.x * 10}deg) rotateX(${-mousePos.y * 10}deg)`
              : 'none',
            transformStyle: 'preserve-3d',
          }}
        >
          {CARDS_DATA.map((card, index) => {
            const isHovered = hoveredCard === card.id;
            const isCenterOrActive = isMobile ? index === activeCardIndex : (hoveredCard ? isHovered : index === 2);

            // Responsive horizontal offset multiplier
            const spreadScale = isMobile ? 0.38 : 1;
            const targetX = (index - (isMobile ? activeCardIndex : 2)) * (isMobile ? 70 : 90) * spreadScale;
            const targetAngle = isMobile ? (index - activeCardIndex) * 5 : card.angle;

            return (
              <div
                key={card.id}
                onClick={() => {
                  setActiveCardIndex(index);
                  setHoveredCard(card.id);
                }}
                onMouseEnter={() => {
                  if (!isMobile) setHoveredCard(card.id);
                }}
                onMouseLeave={() => {
                  if (!isMobile) setHoveredCard(null);
                }}
                className="hero-fan-card absolute w-[145px] xs:w-[170px] sm:w-[220px] lg:w-[260px] h-[210px] xs:h-[245px] sm:h-[310px] lg:h-[360px] rounded-2xl sm:rounded-3xl p-2.5 xs:p-3 sm:p-4 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] transition-all duration-500 ease-out cursor-pointer group flex flex-col justify-between overflow-hidden select-none"
                style={{
                  transform: isFanned
                    ? `translateX(${targetX}px) rotateZ(${targetAngle}deg) translateY(${Math.abs(targetAngle) * 2}px) translateZ(${isCenterOrActive ? 90 : (4 - Math.abs(index - (isMobile ? activeCardIndex : 2))) * 12}px) scale(${isCenterOrActive ? (isMobile ? 1.05 : 1.08) : 0.95})`
                    : 'translateX(0px) rotateZ(0deg)',
                  zIndex: isCenterOrActive ? 40 : 20 - Math.abs(index - (isMobile ? activeCardIndex : 2)),
                  boxShadow: isCenterOrActive 
                    ? `0 20px 40px -10px ${card.accentColor}40, 0 0 0 2px ${card.accentColor}`
                    : '0 10px 25px -10px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Card Top Image Cover */}
                <div className="relative w-full h-[62%] sm:h-[65%] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    {card.isVip && (
                      <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-white/90 dark:bg-black/80 text-[#EC4899] backdrop-blur-md flex items-center gap-0.5">
                        <Lock size={8} /> VIP
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold bg-black/60 text-white backdrop-blur-md truncate max-w-[70px] sm:max-w-none">
                      {card.category}
                    </span>
                  </div>

                  {/* Likes Pill */}
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-black/50 text-white backdrop-blur-md">
                    <Heart size={9} className="fill-rose-500 text-rose-500" />
                    <span>{card.likes}</span>
                  </div>

                  {/* Bottom Image Overlay Info */}
                  <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-white">
                    <span className="text-[10px] sm:text-[11px] font-black truncate max-w-[75px] sm:max-w-none">{card.creator}</span>
                    <span className="text-[10px] sm:text-[11px] font-black text-[#FB7185] bg-black/40 px-1.5 py-0.5 rounded-full backdrop-blur-xs">
                      {card.price}
                    </span>
                  </div>
                </div>

                {/* Card Bottom Meta */}
                <div className="pt-1.5 sm:pt-2 space-y-0.5 sm:space-y-1">
                  <h4 className="text-[11px] xs:text-xs sm:text-sm font-black text-[#18181B] dark:text-[#FDF2F8] truncate group-hover:text-[#EC4899] transition-colors">
                    {card.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#71717A] dark:text-[#D4B8D0] font-medium">
                    <span className="truncate">{card.handle}</span>
                    <span className="text-[#EC4899] font-bold group-hover:translate-x-0.5 transition-transform flex items-center shrink-0">
                      Unlock <ChevronRight size={11} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Swipe Navigation Controls & Dots */}
      <div className="flex md:hidden items-center justify-center gap-3 mb-4">
        <button
          onClick={() => setActiveCardIndex(prev => Math.max(0, prev - 1))}
          disabled={activeCardIndex === 0}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-center text-xs text-[#71717A] disabled:opacity-40 shadow-xs"
          aria-label="Previous card"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1.5">
          {CARDS_DATA.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setActiveCardIndex(dotIdx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                dotIdx === activeCardIndex 
                  ? 'w-6 bg-[#EC4899]' 
                  : 'w-2 bg-[#F3DCE8] dark:bg-[#3A2A4C]'
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setActiveCardIndex(prev => Math.min(CARDS_DATA.length - 1, prev + 1))}
          disabled={activeCardIndex === CARDS_DATA.length - 1}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-center text-xs text-[#71717A] disabled:opacity-40 shadow-xs"
          aria-label="Next card"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Subtext Quote from Video */}
      <p className="hero-anim-text text-xs sm:text-sm text-[#71717A] dark:text-[#D4B8D0] text-center max-w-lg mb-5 sm:mb-6 font-medium px-4">
        Artists can display their masterpieces, and buyers can discover, subscribe, and collect exclusive digital drops.
      </p>

      {/* Call to Action Buttons */}
      <div className="hero-anim-text flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto px-4">
        <Link href="/auth/signup" className="w-full sm:w-auto">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto px-8 shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[46px]" 
            rightIcon={<ArrowRight size={16} />}
          >
            Join for $9.99/mo
          </Button>
        </Link>
        <Link href="/explore" className="w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto px-8 hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] min-h-[46px]"
          >
            Read more & Explore
          </Button>
        </Link>
      </div>

      {/* Key Guarantees & Highlights */}
      <div className="hero-anim-text pt-8 sm:pt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-10 text-[11px] sm:text-xs font-bold text-[#71717A] dark:text-[#D4B8D0] px-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={15} className="text-[#EC4899] shrink-0" />
          <span>Instant Payouts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={15} className="text-amber-500 shrink-0" />
          <span>95% Creator Share</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
          <span>Zero Upfront Setup Fee</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
