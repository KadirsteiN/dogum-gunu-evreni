"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Sparkles, Lock, MailOpen, Cookie, Heart } from "lucide-react";
import { SpecialNoteData } from "@/types";
import {
  appendLocalLog,
  updateLocalStoreSection,
  trackClientActivity,
} from "@/lib/client-storage";

interface NotesHubProps {
  initialNotes: SpecialNoteData[];
}

export default function NotesHub({ initialNotes }: NotesHubProps) {
  const [notes, setNotes] = useState<SpecialNoteData[]>(initialNotes);
  const [activeTab, setActiveTab] = useState<"JAR" | "COOKIE" | "CAPSULE">("JAR");

  const jarNotes = notes.filter((n) => n.type === "JAR");
  const cookieNotes = notes.filter((n) => n.type === "COOKIE");
  const capsuleNotes = notes.filter((n) => n.type === "CAPSULE");

  const [currentJarNote, setCurrentJarNote] = useState<SpecialNoteData | null>(
    jarNotes[0] || null
  );
  const [currentCookie, setCurrentCookie] = useState<SpecialNoteData | null>(null);
  const [isCracking, setIsCracking] = useState(false);
  const [openedCapsule, setOpenedCapsule] = useState<SpecialNoteData | null>(null);

  React.useEffect(() => {
    if (initialNotes && initialNotes.length > 0) {
      setNotes(initialNotes);
      const firstJar = initialNotes.find((n) => n.type === "JAR");
      if (firstJar) {
        setCurrentJarNote((prev) => prev || firstJar);
      }
    }
  }, [initialNotes]);

  const pickRandomJarNote = () => {
    if (jarNotes.length === 0) return;
    const random = jarNotes[Math.floor(Math.random() * jarNotes.length)];
    setCurrentJarNote(random);
  };

  const crackFortuneCookie = () => {
    if (cookieNotes.length === 0) return;
    setIsCracking(true);
    setCurrentCookie(null);
    setTimeout(() => {
      const random = cookieNotes[Math.floor(Math.random() * cookieNotes.length)];
      setCurrentCookie(random);
      setIsCracking(false);
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
      });
    }, 550);
  };

  const handleOpenCapsule = async (capsule: SpecialNoteData) => {
    const isLocked =
      capsule.unlockDate && new Date(capsule.unlockDate) > new Date();
    if (isLocked) return;

    setOpenedCapsule(capsule);

    try {
      const res = await fetch(`/api/notes/${capsule.id}/open`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        const nextNotes = notes.map((n) =>
          n.id === capsule.id ? data.note : n
        );
        setNotes(nextNotes);
        updateLocalStoreSection("notes", nextNotes);
        if (data.log) {
          appendLocalLog(data.log);
        }
      } else {
        const nextNotes = notes.map((n) =>
          n.id === capsule.id ? { ...n, isOpened: true } : n
        );
        setNotes(nextNotes);
        updateLocalStoreSection("notes", nextNotes);
        await trackClientActivity({
          actionType: "CAPSULE_OPENED",
          title: `Zaman Kapsülü Açıldı: ${capsule.title || "Özel Zarf"}`,
          detail: capsule.content.slice(0, 120),
          metadata: { noteId: capsule.id, title: capsule.title },
        });
      }
    } catch {
      // Sessizce yönet
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rosewarm">
            Sürpriz Notlar & Mektuplar
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-wine">
            Sevgi Kavanozu, Kurabiye & Kapsül 🏺
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-powder/80 p-1.5 rounded-2xl border border-rosewarm/25">
          <button
            type="button"
            onClick={() => setActiveTab("JAR")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "JAR"
                ? "bg-gradient-to-r from-rosewarm to-wine text-white shadow"
                : "text-wine hover:bg-white/50"
            }`}
          >
            🫙 &ldquo;Neden Sen?&rdquo; Kavanozu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("COOKIE")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "COOKIE"
                ? "bg-gradient-to-r from-rosewarm to-wine text-white shadow"
                : "text-wine hover:bg-white/50"
            }`}
          >
            🥠 Şans Kurabiyesi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CAPSULE")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "CAPSULE"
                ? "bg-gradient-to-r from-rosewarm to-wine text-white shadow"
                : "text-wine hover:bg-white/50"
            }`}
          >
            ⏳ Zaman Kapsülü
          </button>
        </div>
      </div>

      {/* 1. KAVANOZ SEKMESİ */}
      {activeTab === "JAR" && (
        <div className="text-center py-4 space-y-5">
          <p className="text-sm text-[#6D2E46] max-w-lg mx-auto">
            Seni neden bu kadar çok sevdiğimi anlatan küçük kağıtlarla dolu kavanozumuz. Her dokunduğunda yeni bir sebep çek!
          </p>

          <AnimatePresence mode="wait">
            {currentJarNote && (
              <motion.div
                key={currentJarNote.id}
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
                className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-white to-powder border-2 border-rosewarm/40 shadow-md"
              >
                <Heart className="w-6 h-6 text-rosewarm fill-rosewarm mx-auto mb-2" />
                {currentJarNote.title && (
                  <h4 className="font-serif text-lg font-bold text-wine mb-1">
                    {currentJarNote.title}
                  </h4>
                )}
                <p className="text-sm sm:text-base text-[#4A1525] leading-relaxed italic">
                  &ldquo;{currentJarNote.content}&rdquo;
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={pickRandomJarNote}
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Kavanozdan Yeni Kağıt Çek 🫙</span>
          </button>
        </div>
      )}

      {/* 2. ŞANS KURABİYESİ SEKMESİ */}
      {activeTab === "COOKIE" && (
        <div className="text-center py-4 space-y-5">
          <p className="text-sm text-[#6D2E46] max-w-lg mx-auto">
            Bugünkü aşk falında neler var? Kurabiyeye dokun ve içinden çıkan şans mesajını oku:
          </p>

          <div className="py-4">
            <motion.button
              type="button"
              onClick={crackFortuneCookie}
              animate={
                isCracking
                  ? { rotate: [-12, 12, -12, 12, 0], scale: [1, 1.15, 0.9, 1] }
                  : {}
              }
              className="text-7xl select-none cursor-pointer hover:scale-110 transition-transform"
              aria-label="Şans Kurabiyesini Kır"
            >
              🥠
            </motion.button>
          </div>

          {currentCookie && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto p-5 rounded-2xl bg-white border-2 border-amber-300 shadow-md"
            >
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                ✨ Kurabiye Falın ✨
              </span>
              <p className="text-sm sm:text-base font-medium text-wine mt-2">
                {currentCookie.content}
              </p>
            </motion.div>
          )}

          <div>
            <button
              type="button"
              onClick={crackFortuneCookie}
              className="px-6 py-3 rounded-2xl bg-powder text-wine font-bold text-xs sm:text-sm hover:bg-rosewarm hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <Cookie className="w-4 h-4" />
              <span>{currentCookie ? "Yeni Bir Kurabiye Kır 🥠" : "Kurabiyeyi Kır! 🥠"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. ZAMAN KAPSÜLÜ SEKMESİ */}
      {activeTab === "CAPSULE" && (
        <div className="space-y-4">
          <p className="text-sm text-[#6D2E46]">
            Özel anlar ve gelecekteki günlerimiz için mühürlenmiş zarflar. Kilidi açık olanları hemen okuyabilirsin:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {capsuleNotes.map((cap) => {
              const isLocked =
                cap.unlockDate && new Date(cap.unlockDate) > new Date();

              return (
                <div
                  key={cap.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between ${
                    isLocked
                      ? "bg-gray-100/80 border-gray-300 text-gray-500"
                      : "bg-white/90 border-rosewarm/35 text-wine shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">
                        {isLocked ? "🔒" : cap.isOpened ? "💌" : "✉️"}
                      </span>
                      {cap.unlockDate && (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-powder text-wine">
                          {new Date(cap.unlockDate).toLocaleDateString("tr-TR")}
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-base mb-2">
                      {cap.title || "Sana Özel Zaman Kapsülü"}
                    </h4>
                  </div>

                  {isLocked ? (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <Lock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(cap.unlockDate!).toLocaleDateString("tr-TR")} tarihinde açılacak
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenCapsule(cap)}
                      className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-rosewarm to-wine text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                    >
                      <MailOpen className="w-3.5 h-3.5" />
                      <span>Mektubu Aç & Oku</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {openedCapsule && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 p-6 rounded-3xl bg-gradient-to-br from-white to-powder border-2 border-rosewarm shadow-lg relative"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-serif text-xl font-bold text-wine">
                  {openedCapsule.title}
                </h4>
                <button
                  type="button"
                  onClick={() => setOpenedCapsule(null)}
                  className="text-xs font-bold text-wine underline"
                >
                  Kapat
                </button>
              </div>
              <p className="text-sm sm:text-base text-[#4A1525] leading-relaxed whitespace-pre-line">
                {openedCapsule.content}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
