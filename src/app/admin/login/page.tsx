"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Heart, ArrowRight, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Giriş yapılamadı.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Sunucu ile bağlantı kurulamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12">
      <div className="glass-card rounded-3xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rosewarm to-wine text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Lock className="w-7 h-7" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-rosewarm">
          Gizli Kontrol Merkezi
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-wine mt-1 mb-2">
          Yönetim Paneline Giriş 🔐
        </h1>
        <p className="text-xs sm:text-sm text-[#6D2E46] mb-6">
          Sevgilinin tüm etkileşimlerini, kullandığı kuponları ve sana bıraktığı mesajları görmek için yönetici şifresini gir:
        </p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-wine uppercase mb-1.5">
              Yönetici Şifresi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-rosewarm/35 text-sm text-wine focus:outline-none focus:ring-2 focus:ring-rosewarm"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-sm shadow-lg hover:opacity-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? "Kontrol Ediliyor..." : "Panele Giriş Yap"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-rosewarm/20">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-wine/80 hover:text-rosewarm"
          >
            <Heart className="w-3.5 h-3.5 text-rosewarm fill-rosewarm" />
            <span>Doğum Günü Evrenine Dön</span>
          </a>
        </div>
      </div>
    </div>
  );
}
