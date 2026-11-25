"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  ChevronDown,
  Heart,
} from "lucide-react";
import { PlaylistItem } from "@/types";

interface MusicPlayerProps {
  playlist: PlaylistItem[];
  autoStart: boolean;
}

export default function MusicPlayer({ playlist, autoStart }: MusicPlayerProps) {
  const safePlaylist: PlaylistItem[] =
    Array.isArray(playlist) && playlist.length > 0
      ? playlist
      : [
          {
            title: "Romantik Melodiler",
            artist: "Bizim Şarkımız",
            url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
            note: "Seni çok seviyorum sevgilim 💕",
          },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [useSynthFallback, setUseSynthFallback] = useState(false);
  const [waitingForInteraction, setWaitingForInteraction] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const synthCtxRef = useRef<AudioContext | null>(null);

  const currentTrack = safePlaylist[currentIndex] || safePlaylist[0];

  // Tatlı Web Audio müzik kutusu fallback (eğer harici MP3 yüklenemezse sessizce devreye girer)
  const stopSynth = useCallback(() => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  }, []);

  const startSynth = useCallback(() => {
    stopSynth();
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!synthCtxRef.current) {
        synthCtxRef.current = new AudioCtx();
      }
      const ctx = synthCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 783.99];
      let step = 0;

      synthIntervalRef.current = setInterval(() => {
        if (isMuted) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(notes[step % notes.length], ctx.currentTime);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          Math.max(0.01, volume * 0.12),
          ctx.currentTime + 0.08
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.95);
        step++;
      }, 650);
    } catch {
      // Sessizce yönet
    }
  }, [isMuted, stopSynth, volume]);

  const playCurrent = useCallback(async () => {
    stopSynth();
    if (!audioRef.current) return;

    try {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
      await audioRef.current.play();
      setIsPlaying(true);
      setUseSynthFallback(false);
      setWaitingForInteraction(false);
    } catch (err) {
      const errorName = err instanceof Error ? err.name : "";
      if (errorName === "NotAllowedError") {
        // Tarayıcı otomatik oynatmayı engellediyse ilk dokunuşu bekle
        setWaitingForInteraction(true);
        setIsPlaying(false);
      } else {
        // Ağ veya kaynak hatası durumunda Web Audio müzik kutusu devreye girer
        setUseSynthFallback(true);
        setIsPlaying(true);
        setWaitingForInteraction(false);
        startSynth();
      }
    }
  }, [isMuted, startSynth, stopSynth, volume]);

  useEffect(() => {
    if (autoStart) {
      playCurrent();
    }
    return () => {
      stopSynth();
    };
  }, [autoStart, playCurrent, stopSynth]);

  // Tarayıcı autoplay politikası nedeniyle ses beklemeye alındıysa ilk kullanıcı etkileşiminde başlat
  useEffect(() => {
    if (!waitingForInteraction && autoStart && isPlaying) return;

    const handleFirstInteraction = () => {
      if (autoStart && !isPlaying) {
        playCurrent();
      }
    };

    if (waitingForInteraction) {
      window.addEventListener("click", handleFirstInteraction, { once: true });
      window.addEventListener("touchstart", handleFirstInteraction, { once: true });
      window.addEventListener("keydown", handleFirstInteraction, { once: true });
    }

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [waitingForInteraction, autoStart, isPlaying, playCurrent]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      stopSynth();
      setIsPlaying(false);
    } else {
      playCurrent();
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isPlaying && (waitingForInteraction || autoStart)) {
      setIsMuted(false);
      playCurrent();
      return;
    }
    setIsMuted((prev) => !prev);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % safePlaylist.length;
    setCurrentIndex(nextIdx);
    setTimeout(() => {
      if (isPlaying) playCurrent();
    }, 80);
  };

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + safePlaylist.length) % safePlaylist.length;
    setCurrentIndex(prevIdx);
    setTimeout(() => {
      if (isPlaying) playCurrent();
    }, 80);
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 max-w-[calc(100vw-1.5rem)]">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
        onEnded={handleNext}
        onError={() => {
          if ((isPlaying || autoStart) && !useSynthFallback) {
            setUseSynthFallback(true);
            setIsPlaying(true);
            startSynth();
          }
        }}
      />

      {!isOpen ? (
        <div className="flex items-center gap-1.5">
          {/* Hızlı Ses Aç/Kapat (Mute/Unmute) Butonu */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Sesi Aç" : "Sesi Kapat"}
            title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
            className="w-11 h-11 rounded-full glass-card border border-rosewarm/35 text-wine flex items-center justify-center shadow-lg hover:bg-powder transition-all active:scale-95 shrink-0"
          >
            {isMuted || !isPlaying ? (
              <VolumeX className="w-4 h-4 text-rosewarm" />
            ) : (
              <Volume2 className="w-4 h-4 text-wine" />
            )}
          </button>

          {/* Ana Yüzen Müzik Hapı */}
          <button
            type="button"
            onClick={() => {
              if (waitingForInteraction && !isPlaying) {
                playCurrent();
              }
              setIsOpen(true);
            }}
            className="flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] rounded-full bg-gradient-to-r from-rosewarm to-wine text-white shadow-xl hover:scale-[1.03] active:scale-95 transition-all"
          >
            <div
              className={`p-1.5 rounded-full bg-white/20 shrink-0 ${
                isPlaying && !isMuted ? "animate-spin" : ""
              }`}
            >
              <Music className="w-4 h-4" />
            </div>
            <div className="text-left pr-1">
              <p className="text-xs font-bold leading-tight max-w-[115px] sm:max-w-[140px] truncate">
                {currentTrack.title}
              </p>
              <p className="text-[10px] text-pink-100">
                {waitingForInteraction
                  ? "Sesi Başlatmak İçin Dokun 🎵"
                  : isMuted
                  ? "Sessizde 🔇"
                  : isPlaying
                  ? "Çalıyor 🎵"
                  : "Duraklatıldı"}
              </p>
            </div>
          </button>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-4 w-[calc(100vw-1.5rem)] max-w-[20rem] sm:max-w-[22rem] shadow-2xl border border-rosewarm/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rosewarm to-wine flex items-center justify-center text-white shadow shrink-0">
                <Music className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-wine uppercase tracking-wider truncate">
                  Bizim Şarkılarımız
                </h4>
                <p className="text-[11px] text-rosewarm font-medium">
                  {currentIndex + 1} / {safePlaylist.length} Şarkı{" "}
                  {useSynthFallback ? "• Müzik Kutusu" : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 rounded-full hover:bg-powder text-wine flex items-center justify-center transition-colors shrink-0"
              aria-label="Küçült"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-powder/60 rounded-2xl p-3 mb-3">
            <p className="font-serif font-bold text-wine text-sm truncate">
              {currentTrack.title}
            </p>
            <p className="text-xs text-[#6D2E46] mb-2 truncate">{currentTrack.artist}</p>
            {currentTrack.note && (
              <div className="flex items-start gap-1.5 text-xs text-wine/90 bg-white/70 rounded-xl p-2 italic">
                <Heart className="w-3.5 h-3.5 text-rosewarm shrink-0 mt-0.5 fill-rosewarm" />
                <span className="break-words">{currentTrack.note}</span>
              </div>
            )}
          </div>

          {/* Oynatma Kontrolleri */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              type="button"
              onClick={handlePrev}
              className="w-10 h-10 rounded-full hover:bg-powder text-wine flex items-center justify-center transition-colors"
              aria-label="Önceki Şarkı"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-rosewarm to-wine text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
              aria-label={isPlaying ? "Duraklat" : "Oynat"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-10 h-10 rounded-full hover:bg-powder text-wine flex items-center justify-center transition-colors"
              aria-label="Sonraki Şarkı"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Ses Ayarı */}
          <div className="flex items-center gap-2.5 px-1">
            <button
              type="button"
              onClick={() => toggleMute()}
              className="w-8 h-8 rounded-full hover:bg-powder flex items-center justify-center text-wine hover:text-rosewarm shrink-0"
              aria-label="Sesi Kapat/Aç"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rosewarm" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setIsMuted(false);
                setVolume(parseFloat(e.target.value));
              }}
              aria-label="Ses Seviyesi"
              className="w-full accent-rosewarm h-2 bg-powder rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
