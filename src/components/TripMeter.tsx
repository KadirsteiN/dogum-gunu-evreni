"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Send, RotateCcw, Check } from "lucide-react";
import { trackClientActivity } from "@/lib/client-storage";

function getTripStatus(level: number): { label: string; emoji: string; color: string } {
  if (level === 0) {
    return {
      label: "Süt Liman: Şu an hiç trip yok, her şey pamuk gibi 🥰",
      emoji: "😇",
      color: "from-pink-300 to-rosewarm",
    };
  }
  if (level <= 30) {
    return {
      label: "Hafif burun kıvırma & tek kelimelik 'Peki.' aşaması 😒",
      emoji: "😒",
      color: "from-rosewarm to-pink-500",
    };
  }
  if (level <= 60) {
    return {
      label: "'Yok bir şey' deyip içten içe patlama seviyesi 😤",
      emoji: "😤",
      color: "from-pink-500 to-rose-600",
    };
  }
  if (level <= 85) {
    return {
      label: "Görüldü atma ve profil fotoğrafı gizleme riski yüksek! ⚠️",
      emoji: "😠",
      color: "from-rose-600 to-wine",
    };
  }
  return {
    label: "KIRMIZI ALARM! Acil tatlı, çiçek ve yoğun ilgi operasyonu şart! 🚨🍫💐",
    emoji: "🌋",
    color: "from-wine to-red-700",
  };
}

export default function TripMeter() {
  const [level, setLevel] = useState(20);
  const [reason, setReason] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const status = getTripStatus(level);

  const handleIncreaseTrip = () => {
    setIsSent(false);
    setLevel((prev) => Math.min(100, prev + 15));
  };

  const handleReset = () => {
    setIsSent(false);
    setLevel(0);
  };

  const handleSendTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await trackClientActivity({
        actionType: "TRIP",
        title: `Trip Atıldı! Seviye: %${level} ${status.emoji}`,
        detail: reason.trim()
          ? `Sebep: "${reason.trim()}" — (${status.label})`
          : status.label,
        metadata: { level, reason: reason.trim() || null },
      });
      setIsSent(true);
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rosewarm">
            Resmi Trip Ölçer
          </span>
          <h3 className="font-serif text-2xl font-bold text-wine">
            İnteraktif Trip Metresi 😤
          </h3>
        </div>
        <span className="text-3xl">{status.emoji}</span>
      </div>

      <p className="text-sm text-[#6D2E46] mb-5">
        İçinde kalmasın! Butona basarak trip seviyeni yükselt ve sebebini yazıp bana gönder:
      </p>

      {/* Seviye Çubuğu */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-bold text-wine mb-1.5">
          <span>Güncel Trip Seviyesi</span>
          <span className="text-base font-serif">%{level}</span>
        </div>
        <div className="w-full h-5 bg-powder rounded-full overflow-hidden p-0.5 border border-rosewarm/30">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${level}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className={`h-full rounded-full bg-gradient-to-r ${status.color}`}
          />
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={level}
          onChange={(e) => {
            setIsSent(false);
            setLevel(Number(e.target.value));
          }}
          className="w-full mt-2 accent-wine cursor-pointer"
        />
      </div>

      {/* Durum Açıklaması */}
      <div className="p-3.5 rounded-2xl bg-powder/70 border border-rosewarm/25 text-xs sm:text-sm font-medium text-wine mb-5">
        {status.label}
      </div>

      {/* Trip At Butonları */}
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={handleIncreaseTrip}
          className="flex-1 py-3 px-4 rounded-2xl bg-powder hover:bg-rosewarm/25 text-wine font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Flame className="w-4 h-4 text-rosewarm" />
          <span>Trip At! (+%15)</span>
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="p-3 rounded-2xl bg-white/80 hover:bg-powder text-wine border border-rosewarm/20"
          aria-label="Sıfırla"
          title="Tribi Sıfırla"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Gönderim Formu */}
      <form onSubmit={handleSendTrip} className="space-y-3">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Neden trip atıyorsun? (İsteğe bağlı tatlı bir sebep yaz...)"
          className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-rosewarm/30 text-sm text-wine placeholder:text-wine/40 focus:outline-none focus:ring-2 focus:ring-rosewarm"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-sm shadow-md hover:opacity-95 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSent ? (
            <>
              <Check className="w-4 h-4" />
              <span>Tribin Kayıtlara Geçti! Gönlün Alınacak 💝</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Gönderiliyor..." : `Tribi Gönder (%${level})`}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
