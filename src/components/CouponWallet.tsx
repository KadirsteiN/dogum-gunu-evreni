"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Ticket, CheckCircle2, Sparkles } from "lucide-react";
import { CouponData } from "@/types";
import {
  appendLocalLog,
  updateLocalStoreSection,
  trackClientActivity,
} from "@/lib/client-storage";

interface CouponWalletProps {
  initialCoupons: CouponData[];
}

export default function CouponWallet({ initialCoupons }: CouponWalletProps) {
  const [coupons, setCoupons] = useState<CouponData[]>(initialCoupons);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialCoupons && initialCoupons.length > 0) {
      setCoupons(initialCoupons);
    }
  }, [initialCoupons]);

  const handleUseCoupon = async (id: string) => {
    setLoadingId(id);
    try {
      const target = coupons.find((c) => c.id === id);
      const res = await fetch(`/api/coupons/${id}/use`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        const nextCoupons = coupons.map((c) =>
          c.id === id ? data.coupon : c
        );
        setCoupons(nextCoupons);
        updateLocalStoreSection("coupons", nextCoupons);
        if (data.log) {
          appendLocalLog(data.log);
        }
      } else if (target) {
        const fallbackCoupon: CouponData = {
          ...target,
          isUsed: true,
          usedAt: new Date().toISOString(),
        };
        const nextCoupons = coupons.map((c) =>
          c.id === id ? fallbackCoupon : c
        );
        setCoupons(nextCoupons);
        updateLocalStoreSection("coupons", nextCoupons);
        await trackClientActivity({
          actionType: "COUPON_USED",
          title: `Kupon Kullanıldı: ${target.emoji} ${target.title}`,
          detail: target.description,
          metadata: { couponId: target.id, title: target.title },
        });
      }
      setConfirmId(null);

      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#FF6B8B", "#FFE4EC", "#9D174D"],
      });
    } catch {
      // Sessizce yönet
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rosewarm">
            VIP Ayrıcalıklar
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-wine">
            İlişki Kuponları Cüzdanı 🎟️
          </h3>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-powder text-wine text-xs font-bold">
          <Ticket className="w-4 h-4 text-rosewarm" />
          <span>
            {coupons.filter((c) => !c.isUsed).length} Aktif Kuponun Var
          </span>
        </div>
      </div>

      <p className="text-sm text-[#6D2E46] mb-6">
        İstediğin an kullanabileceğin özel hediye biletlerin. &ldquo;Kuponu Kullan&rdquo; dediğinde anında bana bildirim düşer!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`relative rounded-3xl p-5 border-2 border-dashed transition-all overflow-hidden flex flex-col justify-between ${
              coupon.isUsed
                ? "bg-gray-100/70 border-gray-300 opacity-75"
                : "bg-gradient-to-br from-white via-[#FFF8F5] to-powder/70 border-rosewarm/50 shadow-sm hover:shadow-md"
            }`}
          >
            {/* Bilet Kenar Çentikleri */}
            <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FFF8F5] border-r border-rosewarm/30" />
            <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FFF8F5] border-l border-rosewarm/30" />

            {/* KULLANILDI Damgası */}
            {coupon.isUsed && (
              <div className="absolute top-4 right-4 rotate-12 border-2 border-wine text-wine px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-widest bg-powder/90 shadow">
                KULLANILDI ✓
              </div>
            )}

            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-powder flex items-center justify-center text-2xl shrink-0 shadow-inner">
                {coupon.emoji}
              </div>
              <div className="pr-4">
                <h4 className="font-serif text-lg font-bold text-wine leading-snug">
                  {coupon.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#6D2E46] mt-1 leading-relaxed">
                  {coupon.description}
                </p>
              </div>
            </div>

            {coupon.isUsed ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-wine/70 pt-2 border-t border-rosewarm/15">
                <CheckCircle2 className="w-4 h-4 text-rosewarm" />
                <span>
                  Bu kupon kullanıldı ve sevgiline iletildi 💖
                </span>
              </div>
            ) : confirmId === coupon.id ? (
              <div className="flex items-center gap-2 pt-2 border-t border-rosewarm/20">
                <button
                  type="button"
                  onClick={() => handleUseCoupon(coupon.id)}
                  disabled={loadingId === coupon.id}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rosewarm to-wine text-white text-xs font-bold shadow"
                >
                  {loadingId === coupon.id ? "Onaylanıyor..." : "Evet, Şimdi Kullan! ✨"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="py-2.5 px-3 rounded-xl bg-powder text-wine text-xs font-bold"
                >
                  Vazgeç
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmId(coupon.id)}
                className="w-full py-2.5 rounded-xl bg-powder/90 hover:bg-rosewarm hover:text-white text-wine text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kuponu Kullan</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
