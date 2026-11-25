"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Mic, MicOff, Sparkles, Heart, Flame } from "lucide-react";

interface BirthdayIntroProps {
  partnerName: string;
  onEnterUniverse: () => void;
}

export default function BirthdayIntro({
  partnerName,
  onEnterUniverse,
}: BirthdayIntroProps) {
  const [candles, setCandles] = useState<boolean[]>([true, true, true]);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [allBlown, setAllBlown] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const allOut = candles.every((c) => !c);

  useEffect(() => {
    if (allOut && !allBlown) {
      setAllBlown(true);
      stopMicrophone();
      triggerCelebration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOut]);

  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, []);

  const triggerCelebration = () => {
    const duration = 2600;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#FF6B8B", "#FFE4EC", "#9D174D", "#FFD166"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#FF6B8B", "#FFE4EC", "#9D174D", "#FFD166"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const blowCandle = (index: number) => {
    setCandles((prev) => prev.map((c, i) => (i === index ? false : c)));
  };

  const blowAllCandles = () => {
    setCandles([false, false, false]);
  };

  const startMicrophone = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsListening(true);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;

        // Üfleme ses eşiği
        if (average > 48) {
          setCandles((prev) => {
            const firstLit = prev.findIndex((c) => c === true);
            if (firstLit !== -1) {
              const copy = [...prev];
              copy[firstLit] = false;
              return copy;
            }
            return prev;
          });
        }

        rafRef.current = requestAnimationFrame(checkVolume);
      };

      rafRef.current = requestAnimationFrame(checkVolume);
    } catch {
      setMicError(
        "Mikrofon izni alınamadı, mumların üzerine dokunarak veya aşağıdaki butona basarak üfleyebilirsin 💕"
      );
      setIsListening(false);
    }
  };

  const stopMicrophone = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
    setIsListening(false);
  };

  return (
    <div className="fixed inset-0 z-50 min-h-dvh flex items-center justify-center bg-gradient-to-b from-[#FFE4EC] via-[#FFF8F5] to-[#FFE4EC] px-4 py-6 sm:py-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card rounded-3xl max-w-lg w-full p-5 sm:p-10 text-center relative overflow-hidden my-auto"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-powder text-wine text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
          <Sparkles className="w-4 h-4 text-rosewarm shrink-0" />
          <span>Sana Özel Doğum Günü Evreni</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-wine mb-2 leading-tight">
          İyi ki Doğdun {partnerName}! 🎂
        </h1>
        <p className="text-xs sm:text-base text-[#6D2E46] mb-5 sm:mb-6 leading-relaxed">
          Gözlerini kapat, en güzel dileğini tut ve pastandaki mumları söndür.
          Mumlara tek tek dokunabilir veya mikrofonu açıp gerçekten üfleyebilirsin! ✨
        </p>

        {/* Pasta ve Mumlar */}
        <div className="relative mx-auto my-4 sm:my-6 w-full max-w-[16rem] sm:max-w-[18rem] pt-10 pb-3 flex flex-col items-center">
          {/* Mumlar */}
          <div className="flex items-end justify-center gap-6 sm:gap-8 mb-[-6px] z-10">
            {candles.map((isLit, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => blowCandle(idx)}
                aria-label={`Mum ${idx + 1}`}
                className="group relative flex flex-col items-center px-2 pt-2 focus:outline-none cursor-pointer touch-manipulation"
              >
                {/* Alev */}
                <div className="h-9 flex items-center justify-center">
                  <AnimatePresence>
                    {isLit ? (
                      <motion.div
                        key="flame"
                        initial={{ scale: 0 }}
                        animate={{
                          scale: [1, 1.15, 0.95, 1.1, 1],
                          rotate: [-3, 3, -2, 4, 0],
                        }}
                        exit={{ opacity: 0, y: -15, scale: 0.2 }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="relative flex items-center justify-center"
                      >
                        <div className="absolute w-7 h-7 bg-amber-300/60 rounded-full blur-md" />
                        <Flame className="w-7 h-7 text-amber-500 fill-amber-400 drop-shadow" />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="smoke"
                        initial={{ opacity: 0.9, y: 0 }}
                        animate={{ opacity: 0, y: -20 }}
                        transition={{ duration: 1 }}
                        className="text-xs text-gray-400 select-none"
                      >
                        💨
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {/* Fitil */}
                <div className="w-0.5 h-2 bg-amber-900" />
                {/* Mum Gövdesi */}
                <div className="w-5 h-16 rounded-t-md bg-gradient-to-b from-white via-pink-100 to-rosewarm border-2 border-rosewarm/40 shadow-sm group-hover:scale-105 transition-transform" />
              </button>
            ))}
          </div>

          {/* Üst Krema Katı */}
          <div className="w-44 sm:w-48 h-12 bg-gradient-to-r from-[#FF8FA3] via-[#FF6B8B] to-[#FF8FA3] rounded-t-2xl border-b-4 border-wine/20 shadow-md relative flex items-center justify-around px-3">
            <span className="text-lg">🍓</span>
            <span className="text-lg">🍒</span>
            <span className="text-lg">🍓</span>
          </div>

          {/* Alt Kek Katı */}
          <div className="w-52 sm:w-56 h-16 bg-gradient-to-b from-[#FFE4EC] to-[#FFC2D4] rounded-b-2xl border-2 border-rosewarm/30 shadow-lg flex items-center justify-center">
            <span className="font-serif text-xs sm:text-sm font-semibold text-wine tracking-wider">
              ♥ İYİ Kİ VARSIN ♥
            </span>
          </div>

          {/* Pasta Tabağı */}
          <div className="w-60 sm:w-64 h-3 bg-wine/15 rounded-full mt-1" />
        </div>

        {/* Durum ve Mikrofon Kontrolleri */}
        {!allBlown ? (
          <div className="space-y-3 mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={isListening ? stopMicrophone : startMicrophone}
                className={`w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  isListening
                    ? "bg-wine text-white shadow-lg animate-pulse"
                    : "bg-powder text-wine hover:bg-rosewarm/20"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 shrink-0" />
                    <span>Mikrofon Açık (Şimdi Üfle! 🌬️)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 shrink-0" />
                    <span>Mikrofonla Üfle 🎤</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={blowAllCandles}
                className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rosewarm to-wine text-white text-xs sm:text-sm font-semibold shadow-md hover:opacity-95 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Mumları Üfle & Dilek Tut ✨</span>
              </button>
            </div>

            {micError && (
              <p className="text-xs text-wine/80 bg-powder/60 rounded-xl p-2.5">
                {micError}
              </p>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-4"
          >
            <p className="text-wine font-serif text-base sm:text-lg font-semibold">
              Dileğin kabul olsun sevgilim! 🎉💖
            </p>
            <button
              type="button"
              onClick={onEnterUniverse}
              className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-sm sm:text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Heart className="w-5 h-5 fill-white shrink-0" />
              <span>Dünyamıza Giriş Yap & Müziği Başlat 🎵</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
