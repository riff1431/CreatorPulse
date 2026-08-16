'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ZoomIn, X, Sparkles, Image as ImageIcon, Eye } from 'lucide-react';
import { useFeatureModules } from '@/lib/modules/feature-module-context';

export interface DynamicImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'auto' | 'square' | 'video' | 'banner';
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  width?: number;
  height?: number;
}

export const DynamicImageLoader: React.FC<DynamicImageLoaderProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'auto',
  fill = false,
  priority = false,
  quality,
  width = 800,
  height = 600,
}) => {
  const { modules } = useFeatureModules();
  const imageModule = modules.find((m) => m.id === 'image_loader');

  const isEnabled = imageModule ? imageModule.isEnabled : true;
  const settings = imageModule?.settings || {};

  const activeEngine = settings.activeEngine || 'next_image'; // 'next_image' | 'zoom_lightbox' | 'blurhash'
  const hoverEffect = settings.hoverEffect || 'zoom'; // 'zoom' | 'glow' | 'none'
  const imgQuality = quality ?? settings.quality ?? 85;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpenZoomModal, setIsOpenZoomModal] = useState(false);

  const hoverClass =
    hoverEffect === 'zoom'
      ? 'group-hover:scale-105 transition-transform duration-300'
      : hoverEffect === 'glow'
      ? 'group-hover:shadow-[0_0_25px_rgba(236,72,153,0.3)] transition-shadow duration-300'
      : '';

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'banner'
      ? 'aspect-[3/1]'
      : '';

  // Fallback if module is disabled
  if (!isEnabled) {
    return (
      <div className={`relative overflow-hidden ${aspectClass} ${className}`}>
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${hoverClass}`}
          loading="lazy"
        />
      </div>
    );
  }

  // --- Engine 1: Next.js Native Image Loader ---
  if (activeEngine === 'next_image') {
    return (
      <div className={`group relative overflow-hidden rounded-xl bg-slate-100 ${aspectClass} ${className}`}>
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            quality={imgQuality}
            onLoad={() => setIsLoaded(true)}
            className={`object-cover transition-all duration-300 ${
              isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
            } ${hoverClass}`}
          />
        ) : (
          <img
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-60'
            } ${hoverClass}`}
            loading="lazy"
          />
        )}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="bg-black/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles size={9} className="text-indigo-400" /> Next Image Engine
          </span>
        </div>
      </div>
    );
  }

  // --- Engine 2: Zoom & Lightbox Viewer Engine ---
  if (activeEngine === 'zoom_lightbox') {
    return (
      <>
        <div
          onClick={() => setIsOpenZoomModal(true)}
          className={`group relative overflow-hidden rounded-xl bg-slate-900 cursor-zoom-in ${aspectClass} ${className}`}
        >
          <img
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover ${hoverClass}`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl">
              <ZoomIn size={14} className="text-pink-600" /> Expand Lightbox
            </div>
          </div>
          <div className="absolute top-2 left-2 bg-pink-600/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            Zoom Engine
          </div>
        </div>

        {/* Lightbox Modal */}
        {isOpenZoomModal && (
          <div
            onClick={() => setIsOpenZoomModal(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
          >
            <button
              onClick={() => setIsOpenZoomModal(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50"
            >
              <X size={20} />
            </button>
            <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img src={src} alt={alt} className="max-w-full max-h-[85vh] object-contain" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full text-xs text-white font-medium">
                {alt || 'Interactive Image Preview'}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // --- Engine 3: Progressive BlurHash Skeleton Engine ---
  return (
    <div className={`group relative overflow-hidden rounded-xl bg-slate-200 ${aspectClass} ${className}`}>
      {/* Skeleton Pulse loader before load */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse flex items-center justify-center">
          <ImageIcon size={24} className="text-slate-400" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-500 ${
          isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-md'
        } ${hoverClass}`}
        loading="lazy"
      />
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <Eye size={9} className="text-emerald-400" /> BlurHash Engine
        </span>
      </div>
    </div>
  );
};
