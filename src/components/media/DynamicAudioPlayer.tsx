'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Music,
  Activity, Radio, FastForward, Rewind
} from 'lucide-react';
import { useFeatureModules } from '@/lib/modules/feature-module-context';

export interface DynamicAudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  className?: string;
}

export const DynamicAudioPlayer: React.FC<DynamicAudioPlayerProps> = ({
  src,
  title = 'Audio Post',
  artist = 'Creator Audio',
  className = '',
}) => {
  const { modules } = useFeatureModules();
  const audioModule = modules.find((m) => m.id === 'audio_player');

  const isEnabled = audioModule ? audioModule.isEnabled : true;
  const settings = audioModule?.settings || {};

  const activeEngine = settings.activeEngine || 'wavesurfer'; // 'wavesurfer' | 'howler' | 'plyr_audio'
  const waveformColor = settings.waveformColor || '#EC4899';
  const showTimestamps = settings.showTimestamps ?? true;

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  // Draw Waveform for Wavesurfer Engine
  useEffect(() => {
    if (activeEngine !== 'wavesurfer' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const bars = 45;
    const barWidth = width / bars - 2;

    for (let i = 0; i < bars; i++) {
      // Deterministic synthetic waveform bars based on index
      const barHeight = Math.sin(i * 0.4) * (height / 2.5) + (height / 2);
      const isPlayed = (i / bars) * 100 <= progress;

      ctx.fillStyle = isPlayed ? waveformColor : '#CBD5E1';
      ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);
    }
  }, [progress, activeEngine, waveformColor]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !duration) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audioRef.current.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Fallback if module disabled
  if (!isEnabled) {
    return (
      <div className={`p-3 bg-slate-100 rounded-xl border border-slate-200 ${className}`}>
        <audio ref={audioRef} src={src} controls className="w-full" />
      </div>
    );
  }

  // --- Engine 1: Wavesurfer Waveform Engine ---
  if (activeEngine === 'wavesurfer') {
    return (
      <div className={`relative p-4 rounded-2xl bg-[#FFF9FC] border border-[#F3DCE8] shadow-sm space-y-3 ${className}`}>
        <audio ref={audioRef} src={src} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: waveformColor }}
            >
              <Music size={18} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#18181B] line-clamp-1">{title}</h5>
              <p className="text-[11px] text-[#71717A] font-medium">{artist}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 flex items-center gap-1">
            <Activity size={10} /> Wavesurfer Engine
          </span>
        </div>

        {/* Canvas Waveform Display */}
        <div className="relative py-1 cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const pct = (clickX / rect.width) * 100;
          if (audioRef.current && duration) {
            audioRef.current.currentTime = (pct / 100) * duration;
            setProgress(pct);
          }
        }}>
          <canvas ref={canvasRef} width={360} height={36} className="w-full h-9 rounded" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            style={{ backgroundColor: waveformColor }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5 fill-white" />}
          </button>

          {showTimestamps && (
            <span className="text-xs font-mono font-medium text-[#71717A]">
              {formatTime(currentTime)} / {formatTime(duration || 0)}
            </span>
          )}

          <div className="flex items-center gap-1.5">
            <button onClick={toggleMute} className="text-[#71717A] hover:text-[#18181B]">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Engine 2: Howler Audio Engine (Card Layout with Volume) ---
  if (activeEngine === 'howler') {
    return (
      <div className={`p-4 rounded-xl bg-slate-900 border border-slate-800 text-white space-y-3 ${className}`}>
        <audio ref={audioRef} src={src} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Radio size={16} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-100">{title}</h5>
              <p className="text-[10px] text-slate-400">Howler Audio Engine</p>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5 fill-slate-950" />}
          </button>

          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-slate-400 hover:text-white">
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-slate-800 rounded appearance-none accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  }

  // --- Engine 3: Plyr Audio (Minimalist Audio Pill) ---
  return (
    <div className={`p-2.5 rounded-full bg-slate-950 border border-slate-800 text-white flex items-center gap-3 shadow-lg ${className}`}>
      <audio ref={audioRef} src={src} />

      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5 fill-white" />}
      </button>

      <div className="flex-1 min-w-0 pr-2">
        <h5 className="text-xs font-bold text-white truncate">{title}</h5>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-pink-500"
          />
          <span className="text-[10px] font-mono text-slate-400 shrink-0">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>
    </div>
  );
};
