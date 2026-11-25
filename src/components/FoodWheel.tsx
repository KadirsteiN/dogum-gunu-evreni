"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Utensils, Sparkles } from "lucide-react";
import { WheelItemData } from "@/types";
import { trackClientActivity } from "@/lib/client-storage";

interface FoodWheelProps {
  items: WheelItemData[];
}

export default function FoodWheel({ items }: FoodWheelProps) {
  const activeItems = items.filter((item) => item.isActive);
  const slices =
    activeItems.length >= 2
      ? activeItems
      : [
          { id: "1", label: "Pizza Gecesi 🍕", color: "#FF6B8B", category: "FOOD", isActive: true },
          { id: "2", label: "Burger Keyfi 🍔", color: "#FF8FA3", category: "FOOD", isActive: true },
          { id: "3", label: "Sushi & Noodle 🍣", color: "#F472B6", category: "FOOD", isActive: true },
          { id: "4", label: "Waffle & Kahve 🧇", color: "#E11D48", category: "FOOD", isActive: true },
        ];

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelItemData | null>(null);

  const sliceAngle = 360 / slices.length;

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinner(null);

    const randomIndex = Math.floor(Math.random() * slices.length);
    const chosen = slices[randomIndex];

    // Üstteki ibre (270 derece / -90 derece) hizasına denk gelecek dönüş açısı
    const extraSpins = 360 * 6;
    const targetSliceCenter = randomIndex * sliceAngle + sliceAngle / 2;
    const targetAngle = 360 - targetSliceCenter;
    const currentMod = rotation % 360;
    const delta = (targetAngle - currentMod + 360) % 360;

    const newRotation = rotation + extraSpins + delta;
    setRotation(newRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      setWinner(chosen);

      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#FF6B8B", "#FFE4EC", "#9D174D"],
      });

      await trackClientActivity({
        actionType: "WHEEL_SPIN",
        title: `Yemek Çarkı Çevrildi: ${chosen.label}`,
        detail: `Bugünkü menü kararı: ${chosen.label}`,
        metadata: { itemId: chosen.id, label: chosen.label },
      });
    }, 4200);
  };

  // SVG dilim koordinatları
  const createSlicePath = (index: number) => {
    const startAngle = ((index * sliceAngle - 90) * Math.PI) / 180;
    const endAngle = (((index + 1) * sliceAngle - 90) * Math.PI) / 180;
    const r = 140;
    const cx = 150;
    const cy = 150;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-powder text-wine text-xs font-semibold mb-2">
        <Utensils className="w-3.5 h-3.5 text-rosewarm" />
        <span>Kararsızlığa Son!</span>
      </div>

      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-wine mb-2">
        &ldquo;Bugün Ne Yesek?&rdquo; Çarkı 🍕
      </h3>
      <p className="text-sm text-[#6D2E46] mb-6">
        &ldquo;Fark etmez aşkım sen seç&rdquo; cümlesini tarihe gömen lezzet çarkını çevir:
      </p>

      {/* Çark Kapsayıcı */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 max-w-full mx-auto mb-6 flex items-center justify-center">
        {/* Üst İbre */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-wine drop-shadow-md" />
        </div>

        {/* Dönen SVG Çark */}
        <div
          className="w-full h-full rounded-full shadow-xl border-4 border-white overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? "transform 4.1s cubic-bezier(0.15, 0.85, 0.25, 1)"
              : "none",
          }}
        >
          <svg viewBox="0 0 300 300" className="w-full h-full">
            {slices.map((slice, idx) => {
              const midAngle = idx * sliceAngle + sliceAngle / 2 - 90;
              const rad = (midAngle * Math.PI) / 180;
              const tx = 150 + 88 * Math.cos(rad);
              const ty = 150 + 88 * Math.sin(rad);

              return (
                <g key={slice.id}>
                  <path
                    d={createSlicePath(idx)}
                    fill={slice.color || "#FF8FA3"}
                    stroke="#FFF8F5"
                    strokeWidth="2"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle}, ${tx}, ${ty})`}
                  >
                    {slice.label.length > 18
                      ? slice.label.slice(0, 17) + "…"
                      : slice.label}
                  </text>
                </g>
              );
            })}
            <circle cx="150" cy="150" r="22" fill="#FFF8F5" stroke="#9D174D" strokeWidth="4" />
          </svg>
        </div>
      </div>

      <button
        type="button"
        onClick={spinWheel}
        disabled={isSpinning}
        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-sm sm:text-base shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 inline-flex items-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        <span>{isSpinning ? "Şansımız Dönüyor..." : "Çarkı Çevir! 🎡"}</span>
      </button>

      {winner && (
        <div className="mt-6 p-4 rounded-2xl bg-powder/90 border-2 border-rosewarm animate-bounce">
          <p className="text-xs font-bold uppercase text-wine">Karar Verildi! 🎉</p>
          <p className="font-serif text-xl font-bold text-wine mt-1">
            {winner.label}
          </p>
          <p className="text-xs text-[#6D2E46] mt-1">
            Seçimin bana bildirim olarak gönderildi bile, afiyet olsun bize! 😋
          </p>
        </div>
      )}
    </div>
  );
}
