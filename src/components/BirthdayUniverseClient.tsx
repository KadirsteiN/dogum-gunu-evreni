"use client";

import React, { useState, useEffect } from "react";
import { Moon, Heart, Sparkles } from "lucide-react";
import BirthdayIntro from "./BirthdayIntro";
import MusicPlayer from "./MusicPlayer";
import LoveCounter from "./LoveCounter";
import MoodPicker from "./MoodPicker";
import TripMeter from "./TripMeter";
import FoodWheel from "./FoodWheel";
import MessageWishBox from "./MessageWishBox";
import CouponWallet from "./CouponWallet";
import CoupleQuiz from "./CoupleQuiz";
import NotesHub from "./NotesHub";
import MemoryTimeline from "./MemoryTimeline";
import {
  SiteConfigData,
  WheelItemData,
  QuizQuestionData,
  CouponData,
  SpecialNoteData,
  MemoryData,
} from "@/types";
import {
  getOrInitLocalStore,
  trackClientActivity,
} from "@/lib/client-storage";

export default function BirthdayUniverseClient() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isNightTime, setIsNightTime] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("ALL");

  const [config, setConfig] = useState<SiteConfigData>({
    id: "default",
    partnerName: "Güzel Sevgilim",
    heroTitle: "İyi ki Doğdun, İyi ki Benimlesin! 🎂✨",
    heroSubtitle:
      "Seninle geçen her saniye hayatımın en güzel hediyesi. Bu küçük evreni sadece senin yüzünde tatlı bir tebessüm görmek için hazırladım...",
    relationshipDate: "2023-06-15T14:30:00.000Z",
    playlist: [
      {
        title: "Romantik Melodiler (Akustik)",
        artist: "Bizim Şarkımız",
        url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
        note: "Gözlerinin içine her baktığımda kalbimde çalan o tatlı ritim... 💕",
      },
    ],
  });

  const [wheelItems, setWheelItems] = useState<WheelItemData[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionData[]>([]);
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [notes, setNotes] = useState<SpecialNoteData[]>([]);
  const [memories, setMemories] = useState<MemoryData[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      setIsNightTime(true);
    }

    const fetchAllData = async () => {
      // 1. Önce tarayıcı tabanlı yerel depodan (veya varsayılan seed'den) anında yükle
      const local = getOrInitLocalStore();
      setConfig(local.siteConfig);
      setWheelItems(local.wheelItems);
      setQuizQuestions(local.quizQuestions);
      setCoupons(local.coupons);
      setNotes(local.notes);
      setMemories(local.memories);

      // 2. Ardından sunucu belleğiyle senkronize et
      try {
        const [cfgRes, wheelRes, quizRes, coupRes, noteRes, memRes] =
          await Promise.all([
            fetch("/api/config"),
            fetch("/api/wheel"),
            fetch("/api/quiz"),
            fetch("/api/coupons"),
            fetch("/api/notes"),
            fetch("/api/memories"),
          ]);

        if (cfgRes.ok) {
          const d = await cfgRes.json();
          if (d.config) setConfig(d.config);
        }
        if (wheelRes.ok) {
          const d = await wheelRes.json();
          if (d.items?.length) setWheelItems(d.items);
        }
        if (quizRes.ok) {
          const d = await quizRes.json();
          if (d.questions?.length) setQuizQuestions(d.questions);
        }
        if (coupRes.ok) {
          const d = await coupRes.json();
          if (d.coupons?.length) setCoupons(d.coupons);
        }
        if (noteRes.ok) {
          const d = await noteRes.json();
          if (d.notes?.length) setNotes(d.notes);
        }
        if (memRes.ok) {
          const d = await memRes.json();
          if (d.memories?.length) setMemories(d.memories);
        }
      } catch {
        // Yerel depo değerleri aktif
      }
    };

    fetchAllData();
  }, []);

  const handleEnterUniverse = async () => {
    setHasEntered(true);
    await trackClientActivity({
      actionType: "LOGIN",
      title: `${config.partnerName} Mumları Üfledi ve Evrene Giriş Yaptı! 🎂✨`,
      detail: "Doğum günü pastası mumları söndürüldü, arka plan müziği başlatıldı.",
    });
  };

  const navItems = [
    { id: "ALL", label: "✨ Tüm Evren" },
    { id: "MOOD_TRIP", label: "🥰 Ruh Hali & Trip" },
    { id: "WHEEL", label: "🍕 Yemek Çarkı" },
    { id: "COUPONS", label: "🎟️ Kuponlarım" },
    { id: "NOTES", label: "🫙 Kavanoz & Kapsül" },
    { id: "QUIZ", label: "💕 İlişki Quizi" },
    { id: "MEMORIES", label: "📸 Anılarımız" },
  ];

  return (
    <div className="min-h-dvh pb-28 overflow-x-hidden">
      {!hasEntered && (
        <BirthdayIntro
          partnerName={config.partnerName}
          onEnterUniverse={handleEnterUniverse}
        />
      )}

      {/* Gece Atmosferi Karşılama Bandı (22:00 - 06:00) */}
      {isNightTime && (
        <div className="bg-gradient-to-r from-[#2E1035] via-[#581C4A] to-[#2E1035] text-pink-100 py-2.5 px-4 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow">
          <Moon className="w-4 h-4 text-amber-300 shrink-0" />
          <span>
            Gece oldu, uykun gelmedi mi? 🌙 Seni rüyalarımda bile çok seviyorum sevgilim...
          </span>
        </div>
      )}

      {/* Üst Hero Alanı */}
      <header className="max-w-5xl mx-auto px-4 pt-8 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-wine text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-rosewarm" />
          <span>Sadece {config.partnerName} İçin Hazırlandı</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-wine leading-tight mb-3">
          {config.heroTitle}
        </h1>
        <p className="text-sm sm:text-base text-[#6D2E46] max-w-2xl mx-auto leading-relaxed">
          {config.heroSubtitle}
        </p>

        {/* Hızlı Gezinme Sekmeleri */}
        <div className="mt-7 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {navItems.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                activeSection === tab.id
                  ? "bg-gradient-to-r from-rosewarm to-wine text-white shadow-md scale-105"
                  : "glass-card text-wine hover:bg-powder/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Ana İçerik Modülleri */}
      <main className="max-w-5xl mx-auto px-4 space-y-8">
        {/* Canlı İlişki Sayacı */}
        {activeSection === "ALL" && (
          <LoveCounter relationshipDate={config.relationshipDate} />
        )}

        {/* Ruh Hali Seçici ve Trip Metresi */}
        {(activeSection === "ALL" || activeSection === "MOOD_TRIP") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MoodPicker />
            <TripMeter />
          </div>
        )}

        {/* Yemek Çarkı & Mesaj/Dilek Kutusu */}
        {(activeSection === "ALL" || activeSection === "WHEEL") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <FoodWheel items={wheelItems} />
            <MessageWishBox />
          </div>
        )}

        {/* İlişki Kuponları Cüzdanı */}
        {(activeSection === "ALL" || activeSection === "COUPONS") && (
          <CouponWallet initialCoupons={coupons} />
        )}

        {/* Kavanoz, Şans Kurabiyesi ve Zaman Kapsülü */}
        {(activeSection === "ALL" || activeSection === "NOTES") && (
          <NotesHub initialNotes={notes} />
        )}

        {/* Mini İlişki Quizi */}
        {(activeSection === "ALL" || activeSection === "QUIZ") && (
          <CoupleQuiz questions={quizQuestions} />
        )}

        {/* Anı Zaman Tüneli */}
        {(activeSection === "ALL" || activeSection === "MEMORIES") && (
          <MemoryTimeline memories={memories} />
        )}
      </main>

      {/* Alt Bilgi */}
      <footer className="max-w-5xl mx-auto px-4 mt-16 text-center text-xs text-wine/70 space-y-1">
        <p className="inline-flex items-center gap-1 font-semibold">
          <span>Seni çok seven sevgilin tarafından</span>
          <Heart className="w-3.5 h-3.5 text-rosewarm fill-rosewarm" />
          <span>ile hazırlandı.</span>
        </p>
      </footer>

      {/* Yüzen Mini Müzik Çalar */}
      <MusicPlayer playlist={config.playlist} autoStart={hasEntered} />
    </div>
  );
}
