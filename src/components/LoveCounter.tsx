"use client";

import React, { useState, useEffect } from "react";
import { Heart, CalendarHeart } from "lucide-react";

interface LoveCounterProps {
  relationshipDate: string;
}

export default function LoveCounter({ relationshipDate }: LoveCounterProps) {
  const [elapsed, setElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const start = new Date(relationshipDate).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setElapsed({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [relationshipDate]);

  const boxes = [
    { label: "Gün", value: elapsed.days },
    { label: "Saat", value: elapsed.hours },
    { label: "Dakika", value: elapsed.minutes },
    { label: "Saniye", value: elapsed.seconds },
  ];

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-powder text-wine text-xs font-semibold mb-3">
        <CalendarHeart className="w-4 h-4 text-rosewarm shrink-0" />
        <span>Seninle Geçen En Güzel Zaman</span>
      </div>

      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wine mb-2">
        Kalbim Seninle Atalı... 💓
      </h2>
      <p className="text-xs sm:text-sm text-[#6D2E46] mb-6">
        Her saniyesi sevgiyle, kahkahayla ve seninle dolu:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
        {boxes.map((b) => (
          <div
            key={b.label}
            className="bg-gradient-to-b from-white to-powder/70 border border-rosewarm/25 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center"
          >
            <span className="font-serif text-3xl sm:text-4xl font-bold text-wine tabular-nums">
              {b.value}
            </span>
            <span className="text-xs font-semibold text-rosewarm uppercase tracking-wider mt-1">
              {b.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-wine/80 font-medium">
        <Heart className="w-3.5 h-3.5 text-rosewarm fill-rosewarm animate-pulse" />
        <span>Ve sonsuza kadar devam edecek...</span>
      </div>
    </div>
  );
}
