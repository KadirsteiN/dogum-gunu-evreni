"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartHandshake, Sparkles, X, CheckCircle2 } from "lucide-react";
import { trackClientActivity } from "@/lib/client-storage";

interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  needsKit: boolean;
  kitTitle?: string;
  kitPrescription?: string[];
  sweetNote: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "HAPPY",
    label: "Mutlu",
    emoji: "🥰",
    needsKit: false,
    sweetNote: "Senin mutlu olman benim dünyadaki en büyük mutluluğum! Hep böyle gül sevgilim 🌸",
  },
  {
    id: "MISSED",
    label: "Özlemiş",
    emoji: "🥺",
    needsKit: true,
    kitTitle: "Acil Özlem Giderme & Kavuşma Kiti 🫂",
    kitPrescription: [
      "1. Sevgiline anında 'Seni çok özledim!' bildirimi gönderildi bile.",
      "2. İlk buluşmada en az 5 dakika boyunca hiç bırakmadan sarılma hakkı kazandın.",
      "3. Şimdi gözlerini kapat ve seni ne kadar çok sevdiğimi hisset 💕",
    ],
    sweetNote: "Ben de seni çok ama çok özledim! Yanında olamadığım her saniye aklımdasın.",
  },
  {
    id: "TIRED",
    label: "Yorgun",
    emoji: "😴",
    needsKit: true,
    kitTitle: "Acil Dinlenme & Şımartılma Kiti 💆‍♀️",
    kitPrescription: [
      "1. Bugün hiçbir şeyi kafana takmama ve tamamen dinlenme izni verildi.",
      "2. Sevgilinden 30 dakikalık VIP omuz/saç masajı alacaklısın.",
      "3. Sıcak bir içecek al, battaniyene sarıl ve gerisini bana bırak 🌸",
    ],
    sweetNote: "Kıyamam sana, bütün yorgunluğunu unutturmak için hemen yanındayım.",
  },
  {
    id: "HUNGRY",
    label: "Çok Aç",
    emoji: "🍔",
    needsKit: true,
    kitTitle: "Acil Karnını Doyurma & Tatlı Operasyonu 🍕🍫",
    kitPrescription: [
      "1. Acil durum sinyali alındı! Açlık kaynaklı sinir krizi önleme protokolü devrede.",
      "2. Hemen aşağıdaki 'Bugün Ne Yesek?' çarkını çevirip menüyü seçiyorsun.",
      "3. Üzerine en sevdiğin tatlı da benden hediye! 🍰",
    ],
    sweetNote: "Sen acıkınca çok tatlı oluyorsun ama hemen seni doyurmamız lazım!",
  },
  {
    id: "ANGRY",
    label: "Biraz Sinirli",
    emoji: "😤",
    needsKit: true,
    kitTitle: "Acil Sakinleştirme & Gönül Alma Kiti 🕊️",
    kitPrescription: [
      "1. Derin bir nefes alıyorsun: Konu ne olursa olsun %100 SEN HAKLISIN!",
      "2. Seni kızdıran her kimse veya neyse hemen icabına bakılacak.",
      "3. İstersen hemen yan taraftaki Trip Metresi'nden bana trip de atabilirsin 🙈",
    ],
    sweetNote: "Sinirlenince bile dünyanın en tatlı insanı olmayı nasıl başarıyorsun?",
  },
  {
    id: "PAMPER",
    label: "Şımartılmak İstiyor",
    emoji: "🎀",
    needsKit: false,
    sweetNote: "Prenses modu aktif! Bugün her nazın, her isteğin emirdir sevgilim 👑💖",
  },
];

export default function MoodPicker() {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [showKitModal, setShowKitModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSelectMood = async (mood: MoodOption) => {
    setSelectedMood(mood);
    if (mood.needsKit) {
      setShowKitModal(true);
    }

    setIsSending(true);
    try {
      await trackClientActivity({
        actionType: "MOOD",
        title: `Ruh Hali Seçti: ${mood.emoji} ${mood.label}`,
        detail: mood.sweetNote,
        metadata: { moodId: mood.id, label: mood.label, emoji: mood.emoji },
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rosewarm">
            Ruh Hali & İyileştirme Kiti
          </span>
          <h3 className="font-serif text-2xl font-bold text-wine">
            Şu An Nasıl Hissediyorsun? 🌸
          </h3>
        </div>
        {isSending && (
          <span className="text-xs text-rosewarm animate-pulse">
            Bana haber veriliyor... 💌
          </span>
        )}
      </div>

      <p className="text-sm text-[#6D2E46] mb-5">
        Modunu seç, anında bana bildirim düşsün ve sana özel reçeteni açalım:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selectedMood?.id === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => handleSelectMood(mood)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center ${
                isSelected
                  ? "bg-gradient-to-br from-rosewarm to-wine text-white border-transparent shadow-lg scale-[1.02]"
                  : "bg-white/80 hover:bg-powder/70 text-wine border-rosewarm/25"
              }`}
            >
              <span className="text-3xl mb-1.5">{mood.emoji}</span>
              <span className="text-sm font-bold">{mood.label}</span>
            </button>
          );
        })}
      </div>

      {selectedMood && !selectedMood.needsKit && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 p-4 rounded-2xl bg-powder/80 border border-rosewarm/30 flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-wine shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-wine uppercase">
              Modun Bana İletildi ({selectedMood.emoji} {selectedMood.label})
            </p>
            <p className="text-sm text-[#6D2E46] mt-0.5">{selectedMood.sweetNote}</p>
          </div>
        </motion.div>
      )}

      {/* Acil Durum İyileştirme Kiti Modalı */}
      <AnimatePresence>
        {showKitModal && selectedMood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#FFF8F5] border-2 border-rosewarm rounded-3xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowKitModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-powder text-wine"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-powder flex items-center justify-center text-3xl mb-4">
                {selectedMood.emoji}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rosewarm/15 text-wine text-xs font-bold mb-2">
                <HeartHandshake className="w-3.5 h-3.5 text-rosewarm" />
                <span>Acil Durum İyileştirme Kiti</span>
              </div>

              <h4 className="font-serif text-2xl font-bold text-wine mb-2">
                {selectedMood.kitTitle}
              </h4>
              <p className="text-sm text-[#6D2E46] mb-4">{selectedMood.sweetNote}</p>

              <div className="bg-white rounded-2xl p-4 border border-rosewarm/25 space-y-2.5 mb-5">
                {selectedMood.kitPrescription?.map((step, i) => (
                  <p key={i} className="text-xs sm:text-sm text-wine font-medium leading-relaxed">
                    {step}
                  </p>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowKitModal(false)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-sm shadow-md hover:opacity-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Reçeteyi Kabul Ediyorum 💖</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
