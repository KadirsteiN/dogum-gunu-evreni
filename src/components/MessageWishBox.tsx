"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { trackClientActivity } from "@/lib/client-storage";

export default function MessageWishBox() {
  const [activeTab, setActiveTab] = useState<"MESSAGE" | "WISH">("MESSAGE");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    setSuccessMsg(null);

    try {
      const isWish = activeTab === "WISH";
      await trackClientActivity({
        actionType: isWish ? "WISH" : "MESSAGE",
        title: isWish ? "Dilek Kuyusuna Yeni Dilek ✨" : "Sana Özel Yeni Bir Not 💌",
        detail: text.trim(),
        metadata: { type: activeTab },
      });

      setText("");
      setSuccessMsg(
        isWish
          ? "Dileğin yıldızlara ve kalbime ulaştı! En kısa sürede gerçekleşecek ✨💖"
          : "Notun kalbime kaydedildi sevgilim, okuduğumda çok mutlu olacağım 💌🥰"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rosewarm">
            Kalpten Kalbe
          </span>
          <h3 className="font-serif text-2xl font-bold text-wine">
            Mesaj Kutusu & Dilek Kuyusu 💌
          </h3>
        </div>

        {/* Sekmeler */}
        <div className="inline-flex p-1 rounded-2xl bg-powder/80 border border-rosewarm/25">
          <button
            type="button"
            onClick={() => {
              setActiveTab("MESSAGE");
              setSuccessMsg(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "MESSAGE"
                ? "bg-gradient-to-r from-rosewarm to-wine text-white shadow"
                : "text-wine hover:bg-white/50"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Bana Not Bırak 💌</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("WISH");
              setSuccessMsg(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "WISH"
                ? "bg-gradient-to-r from-rosewarm to-wine text-white shadow"
                : "text-wine hover:bg-white/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dilek Kuyusu ✨</span>
          </button>
        </div>
      </div>

      <p className="text-sm text-[#6D2E46] mb-4">
        {activeTab === "MESSAGE"
          ? "İçinden geçenleri, söylemek istediklerini veya tatlı bir sırrını bana bırak:"
          : "Yeni yaşında birlikte yapmamızı istediğin bir hayalini veya dileğini kuyuya at:"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            activeTab === "MESSAGE"
              ? "Sevgilim, şu an bunu okurken bilmeni isterim ki..."
              : "Dilek kuyusuna dileğim: Birlikte en yakın zamanda..."
          }
          className="w-full p-4 rounded-2xl bg-white/90 border border-rosewarm/30 text-sm text-wine placeholder:text-wine/40 focus:outline-none focus:ring-2 focus:ring-rosewarm resize-none"
        />

        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-sm shadow-md hover:opacity-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>
            {isSubmitting
              ? "Gönderiliyor..."
              : activeTab === "MESSAGE"
              ? "Notumu Kalbine Gönder 💌"
              : "Dileğimi Kuyuya At ✨"}
          </span>
        </button>
      </form>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-4 rounded-2xl bg-powder/90 border border-rosewarm flex items-center gap-3 text-wine text-xs sm:text-sm font-semibold"
          >
            <CheckCircle2 className="w-5 h-5 text-rosewarm shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
