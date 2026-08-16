'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize,
  RotateCcw, RotateCw, Settings, PictureInPicture, Layers, Zap
} from 'lucide-react';
import { useFeatureModules } from '@/lib/modules/feature-module-context';

export interface DynamicVideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  aspectRatio?: 'video' | 'vertical' | 'auto';
  onEnded?: () => void;
}

export const DynamicVideoPlayer: React.FC<DynamicVideoPlayerProps> = ({
  src,
  poster,
  autoPlay,
  controls = true,
  muted,
  loop = false,
  className = '',
  aspectRatio = 'video',
  onEnded,
}) => {
  const { modules } = useFeatureModules();
  const videoModule = modules.find((m) => m.id === 'video_player');

  const isEnabled = videoModule ? videoModule.isEnabled : true;
  const settings = videoModule?.settings || {};

  const activeEngine = settings.activeEngine || 'vidstack'; // 'vidstack' | 'videojs' | 'plyr'
  const defaultAutoPlay = autoPlay ?? settings.autoPlay ?? false;
  const defaultControls = controls ?? settings.controls ?? true;
  const defaultMuted = muted ?? settings.muted ?? false;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(defaultAutoPlay);
  const [isMuted, setIsMuted] = useState(defaultMuted);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setCurrentTime(video.currentTime);
        setDuration(video.duration);
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    });

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onEnded]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current || !duration) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      videoRef.current.parentElement?.requestFullscreen().catch(() => {});
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const changeSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const aspectClass =
    aspectRatio === 'vertical'
      ? 'aspect-[9/16]'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : 'h-full w-full';

  // If module is disabled, return native browser video player fallback
  if (!isEnabled) {
    return (
      <div className={`relative rounded-xl overflow-hidden bg-black ${aspectClass} ${className}`}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls={defaultControls}
          autoPlay={defaultAutoPlay}
          muted={defaultMuted}
          loop={loop}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // --- Engine 1: Vidstack Player (Modern feature-rich engine) ---
  if (activeEngine === 'vidstack') {
    return (
      <div className={`group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl ${aspectClass} ${className}`}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={defaultAutoPlay}
          muted={defaultMuted}
          loop={loop}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Engine Badge Overlay */}
        <div className="absolute top-3 left-3 bg-indigo-600/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-md">
          <Zap size={11} className="fill-indigo-200" />
          <span>Vidstack Engine</span>
        </div>

        {/* Center Play Button Overlay */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-all hover:bg-black/30"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 hover:scale-110 transition-transform">
              <Play size={28} className="ml-1 fill-white" />
            </div>
          </div>
        )}

        {/* Custom Controls Bar */}
        {defaultControls && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 space-y-2">
            {/* Timeline Progress Bar */}
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all"
              />
            </div>

            <div className="flex items-center justify-between text-white text-xs font-medium pt-1">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="hover:text-indigo-400 transition-colors">
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-current" />}
                </button>

                <button onClick={toggleMute} className="hover:text-indigo-400 transition-colors">
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                <span className="text-slate-300 font-mono text-[11px]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Speed Settings Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="hover:text-indigo-400 transition-colors flex items-center gap-1 text-[11px] font-bold bg-white/10 px-2 py-0.5 rounded-md"
                  >
                    <span>{playbackSpeed}x</span>
                    <Settings size={13} />
                  </button>

                  {showSettings && (
                    <div className="absolute bottom-7 right-0 bg-slate-900 border border-slate-700 rounded-lg p-1 shadow-xl flex flex-col gap-0.5 text-xs text-slate-200 z-30 min-w-[70px]">
                      {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => changeSpeed(s)}
                          className={`px-2 py-1 text-left rounded hover:bg-indigo-600 hover:text-white ${
                            playbackSpeed === s ? 'bg-indigo-600/40 text-indigo-300 font-bold' : ''
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={togglePiP} className="hover:text-indigo-400 transition-colors" title="Picture in Picture">
                  <PictureInPicture size={16} />
                </button>

                <button onClick={toggleFullscreen} className="hover:text-indigo-400 transition-colors" title="Fullscreen">
                  <Maximize size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Engine 2: Video.js / React Player Engine (Dark aesthetic & Codec focus) ---
  if (activeEngine === 'videojs') {
    return (
      <div className={`group relative rounded-xl overflow-hidden bg-slate-900 border border-indigo-950 shadow-2xl ${aspectClass} ${className}`}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={defaultAutoPlay}
          muted={defaultMuted}
          loop={loop}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* VideoJS Top Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <div className="bg-slate-950/80 border border-slate-800 backdrop-blur-md text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <Layers size={11} />
            <span>Video.js Engine</span>
          </div>
          <span className="text-[10px] bg-slate-950/80 backdrop-blur-md text-slate-300 font-mono px-2 py-0.5 rounded">
            HLS / MP4
          </span>
        </div>

        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px] cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              <Play size={24} className="ml-1 fill-white" />
            </div>
          </div>
        )}

        {defaultControls && (
          <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 border-t border-slate-800 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-20 space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex items-center justify-between text-xs text-slate-200">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="text-emerald-400 hover:text-emerald-300">
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
                </button>
                <button onClick={toggleMute} className="hover:text-emerald-400">
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <span className="font-mono text-[11px] text-slate-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <button onClick={toggleFullscreen} className="hover:text-emerald-400">
                <Maximize size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Engine 3: Plyr HTML5 Player (Minimalist clean layout) ---
  return (
    <div className={`group relative rounded-xl overflow-hidden bg-black border border-slate-800 ${aspectClass} ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={defaultAutoPlay}
        muted={defaultMuted}
        loop={loop}
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
      />

      <div className="absolute top-3 left-3 bg-pink-600/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 z-10">
        <span>Plyr Player</span>
      </div>

      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-lg">
            <Play size={20} className="ml-1 fill-white" />
          </div>
        </div>
      )}

      {defaultControls && (
        <div className="absolute bottom-2 inset-x-2 bg-black/80 backdrop-blur-md rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center gap-3 text-white text-xs">
          <button onClick={togglePlay} className="hover:text-pink-400">
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-pink-500"
          />
          <button onClick={toggleMute} className="hover:text-pink-400">
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button onClick={toggleFullscreen} className="hover:text-pink-400">
            <Maximize size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
