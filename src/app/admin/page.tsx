"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Trash2,
  Plus,
  LogOut,
  RefreshCw,
  Flame,
  Smile,
  Ticket,
  Utensils,
  HelpCircle,
  BookHeart,
  Settings,
  Check,
  RotateCcw,
  ExternalLink,
  Database,
  Download,
  Upload,
  AlertTriangle,
} from "lucide-react";
import {
  ActivityLogData,
  WheelItemData,
  QuizQuestionData,
  CouponData,
  SpecialNoteData,
  MemoryData,
  SiteConfigData,
  PlaylistItem,
} from "@/types";
import {
  getOrInitLocalStore,
  saveLocalStore,
  updateLocalStoreSection,
  clearLocalLogsAndResetCoupons,
  getLocalStoreStats,
} from "@/lib/client-storage";
import { UniverseDatabase } from "@/lib/db";

export default function AdminDashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<
    "FEED" | "WHEEL" | "QUIZ" | "COUPONS" | "NOTES" | "MEMORIES_CONFIG"
  >("FEED");

  const [logs, setLogs] = useState<ActivityLogData[]>([]);
  const [logFilter, setLogFilter] = useState<string>("ALL");

  const [wheelItems, setWheelItems] = useState<WheelItemData[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionData[]>([]);
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [notes, setNotes] = useState<SpecialNoteData[]>([]);
  const [memories, setMemories] = useState<MemoryData[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfigData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmClearModal, setConfirmClearModal] = useState(false);

  // Form states - Wheel
  const [newWheelLabel, setNewWheelLabel] = useState("");
  const [newWheelColor, setNewWheelColor] = useState("#FF6B8B");

  // Form states - Quiz
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizQuestionText, setQuizQuestionText] = useState("");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [quizCorrectIdx, setQuizCorrectIdx] = useState(0);
  const [quizReward, setQuizReward] = useState("");

  // Form states - Coupon
  const [couponTitle, setCouponTitle] = useState("");
  const [couponDesc, setCouponDesc] = useState("");
  const [couponEmoji, setCouponEmoji] = useState("🎟️");

  // Form states - Note
  const [noteType, setNoteType] = useState<"JAR" | "COOKIE" | "CAPSULE">("JAR");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteUnlockDate, setNoteUnlockDate] = useState("");

  // Form states - Memory
  const [memTitle, setMemTitle] = useState("");
  const [memStory, setMemStory] = useState("");
  const [memUrl, setMemUrl] = useState("");
  const [memLocation, setMemLocation] = useState("");
  const [memDate, setMemDate] = useState("");

  // Form states - Playlist Song
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [songNote, setSongNote] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const fetchAllAdminData = useCallback(async () => {
    setIsLoading(true);
    const local = getOrInitLocalStore();

    try {
      const [lRes, wRes, qRes, cRes, nRes, mRes, cfgRes] = await Promise.all([
        fetch("/api/logs"),
        fetch("/api/wheel"),
        fetch("/api/quiz"),
        fetch("/api/coupons"),
        fetch("/api/notes"),
        fetch("/api/memories"),
        fetch("/api/config"),
      ]);

      if (lRes.status === 401) {
        router.push("/admin/login");
        return;
      }

      const serverLogs: ActivityLogData[] = lRes.ok
        ? (await lRes.json()).logs || []
        : [];
      // Sunucu ve yerel tarayıcı loglarını tekilleştirerek birleştir
      const logMap = new Map<string, ActivityLogData>();
      [...serverLogs, ...(local.activityLogs || [])].forEach((item) => {
        if (!logMap.has(item.id)) {
          logMap.set(item.id, item);
        }
      });
      const mergedLogs = Array.from(logMap.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLogs(mergedLogs);

      const nextWheel = wRes.ok
        ? (await wRes.json()).items || local.wheelItems
        : local.wheelItems;
      const nextQuiz = qRes.ok
        ? (await qRes.json()).questions || local.quizQuestions
        : local.quizQuestions;
      const nextCoupons = cRes.ok
        ? (await cRes.json()).coupons || local.coupons
        : local.coupons;
      const nextNotes = nRes.ok
        ? (await nRes.json()).notes || local.notes
        : local.notes;
      const nextMemories = mRes.ok
        ? (await mRes.json()).memories || local.memories
        : local.memories;
      const nextConfig = cfgRes.ok
        ? (await cfgRes.json()).config || local.siteConfig
        : local.siteConfig;

      setWheelItems(nextWheel);
      setQuizQuestions(nextQuiz);
      setCoupons(nextCoupons);
      setNotes(nextNotes);
      setMemories(nextMemories);
      setSiteConfig(nextConfig);

      saveLocalStore({
        siteConfig: nextConfig,
        wheelItems: nextWheel,
        quizQuestions: nextQuiz,
        coupons: nextCoupons,
        notes: nextNotes,
        memories: nextMemories,
        activityLogs: mergedLogs,
      });
    } catch {
      // Çevrimdışı veya serverless cold-start durumunda yerel depodan devam et
      setLogs(local.activityLogs || []);
      setWheelItems(local.wheelItems || []);
      setQuizQuestions(local.quizQuestions || []);
      setCoupons(local.coupons || []);
      setNotes(local.notes || []);
      setMemories(local.memories || []);
      setSiteConfig(local.siteConfig || null);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAllAdminData();
  }, [fetchAllAdminData]);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  // KPI ve Depolama Boyutu Hesaplamaları
  const unreadCount = logs.filter((l) => !l.isRead).length;
  const latestMoodLog = logs.find((l) => l.actionType === "MOOD");
  const latestTripLog = logs.find((l) => l.actionType === "TRIP");
  const usedCouponsCount = coupons.filter((c) => c.isUsed).length;
  const storageStats = getLocalStoreStats(
    logs,
    wheelItems,
    quizQuestions,
    coupons,
    notes,
    memories,
    siteConfig
  );

  // Tek Tıkla Tüm Logları ve Etkileşim Verilerini Temizle
  const handleClearAllLogsAndData = async () => {
    try {
      await fetch("/api/logs?clearAll=true", { method: "DELETE" });
    } catch {
      // Sessizce yönet
    }
    const updatedStore = clearLocalLogsAndResetCoupons(false);
    setLogs([]);
    setCoupons(updatedStore.coupons);
    setNotes(updatedStore.notes);
    setConfirmClearModal(false);
    showToast("Tüm etkileşim günlükleri temizlendi ve kuponlar sıfırlandı! ✨");
  };

  // JSON Yedek İndir (Export)
  const handleExportJson = () => {
    const payload: UniverseDatabase = {
      siteConfig: siteConfig || getOrInitLocalStore().siteConfig,
      wheelItems,
      quizQuestions,
      coupons,
      notes,
      memories,
      activityLogs: logs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dogum-gunu-evreni-yedek-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Yedek dosyası (.json) indirildi! 💾");
  };

  // JSON Yedek Yükle (Import)
  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<UniverseDatabase>;

      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importStore: parsed }),
      });

      const current = getOrInitLocalStore();
      const merged: UniverseDatabase = {
        siteConfig: parsed.siteConfig || current.siteConfig,
        wheelItems: Array.isArray(parsed.wheelItems)
          ? parsed.wheelItems
          : current.wheelItems,
        quizQuestions: Array.isArray(parsed.quizQuestions)
          ? parsed.quizQuestions
          : current.quizQuestions,
        coupons: Array.isArray(parsed.coupons)
          ? parsed.coupons
          : current.coupons,
        notes: Array.isArray(parsed.notes) ? parsed.notes : current.notes,
        memories: Array.isArray(parsed.memories)
          ? parsed.memories
          : current.memories,
        activityLogs: Array.isArray(parsed.activityLogs)
          ? parsed.activityLogs
          : current.activityLogs,
      };

      saveLocalStore(merged);
      setSiteConfig(merged.siteConfig);
      setWheelItems(merged.wheelItems);
      setQuizQuestions(merged.quizQuestions);
      setCoupons(merged.coupons);
      setNotes(merged.notes);
      setMemories(merged.memories);
      setLogs(merged.activityLogs);

      if (res.ok) {
        showToast("JSON yedeği başarıyla geri yüklendi! 🎉");
      } else {
        showToast("JSON yedeği yerel depoya yüklendi!");
      }
    } catch {
      showToast("Geçersiz JSON dosyası!");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Log İşlemleri
  const markLogRead = async (id: string) => {
    await fetch("/api/logs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
    const next = logs.map((l) => (l.id === id ? { ...l, isRead: true } : l));
    setLogs(next);
    updateLocalStoreSection("activityLogs", next);
  };

  const markAllLogsRead = async () => {
    await fetch("/api/logs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    }).catch(() => {});
    const next = logs.map((l) => ({ ...l, isRead: true }));
    setLogs(next);
    updateLocalStoreSection("activityLogs", next);
    showToast("Tüm bildirimler okundu işaretlendi!");
  };

  const deleteLog = async (id: string) => {
    await fetch(`/api/logs?id=${id}`, { method: "DELETE" }).catch(() => {});
    const next = logs.filter((l) => l.id !== id);
    setLogs(next);
    updateLocalStoreSection("activityLogs", next);
  };

  // Çark İşlemleri
  const handleAddWheel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWheelLabel.trim()) return;
    const res = await fetch("/api/wheel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newWheelLabel, color: newWheelColor }),
    });
    if (res.ok) {
      const data = await res.json();
      const next = [...wheelItems, data.item];
      setWheelItems(next);
      updateLocalStoreSection("wheelItems", next);
      setNewWheelLabel("");
      showToast("Yeni çark dilimi eklendi!");
    }
  };

  const toggleWheelActive = async (item: WheelItemData) => {
    const res = await fetch("/api/wheel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
    });
    if (res.ok) {
      const data = await res.json();
      const next = wheelItems.map((w) => (w.id === item.id ? data.item : w));
      setWheelItems(next);
      updateLocalStoreSection("wheelItems", next);
    }
  };

  const deleteWheelItem = async (id: string) => {
    const res = await fetch(`/api/wheel?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      const next = wheelItems.filter((w) => w.id !== id);
      setWheelItems(next);
      updateLocalStoreSection("wheelItems", next);
      showToast("Çark dilimi silindi.");
    }
  };

  // Quiz İşlemleri
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizQuestionText.trim()) return;

    const method = editingQuizId ? "PUT" : "POST";
    const res = await fetch("/api/quiz", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingQuizId,
        question: quizQuestionText,
        options: quizOptions,
        correctIndex: quizCorrectIdx,
        rewardMessage: quizReward,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const next = editingQuizId
        ? quizQuestions.map((q) => (q.id === editingQuizId ? data.question : q))
        : [...quizQuestions, data.question];
      setQuizQuestions(next);
      updateLocalStoreSection("quizQuestions", next);
      showToast(
        editingQuizId ? "Quiz sorusu güncellendi!" : "Yeni quiz sorusu eklendi!"
      );
      setEditingQuizId(null);
      setQuizQuestionText("");
      setQuizOptions(["", "", "", ""]);
      setQuizCorrectIdx(0);
      setQuizReward("");
    }
  };

  const startEditQuiz = (q: QuizQuestionData) => {
    setEditingQuizId(q.id);
    setQuizQuestionText(q.question);
    setQuizOptions([
      q.options[0] || "",
      q.options[1] || "",
      q.options[2] || "",
      q.options[3] || "",
    ]);
    setQuizCorrectIdx(q.correctIndex);
    setQuizReward(q.rewardMessage || "");
  };

  const deleteQuiz = async (id: string) => {
    const res = await fetch(`/api/quiz?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      const next = quizQuestions.filter((q) => q.id !== id);
      setQuizQuestions(next);
      updateLocalStoreSection("quizQuestions", next);
      showToast("Soru silindi.");
    }
  };

  // Kupon İşlemleri
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponTitle.trim() || !couponDesc.trim()) return;
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: couponTitle,
        description: couponDesc,
        emoji: couponEmoji,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const next = [...coupons, data.coupon];
      setCoupons(next);
      updateLocalStoreSection("coupons", next);
      setCouponTitle("");
      setCouponDesc("");
      showToast("Yeni kupon oluşturuldu!");
    }
  };

  const resetCoupon = async (id: string) => {
    const res = await fetch("/api/coupons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isUsed: false }),
    });
    if (res.ok) {
      const data = await res.json();
      const next = coupons.map((c) => (c.id === id ? data.coupon : c));
      setCoupons(next);
      updateLocalStoreSection("coupons", next);
      showToast("Kupon tekrar aktif edildi!");
    }
  };

  const deleteCoupon = async (id: string) => {
    const res = await fetch(`/api/coupons?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      const next = coupons.filter((c) => c.id !== id);
      setCoupons(next);
      updateLocalStoreSection("coupons", next);
      showToast("Kupon silindi.");
    }
  };

  // Not / Kapsül İşlemleri
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: noteType,
        title: noteTitle || null,
        content: noteContent,
        unlockDate:
          noteType === "CAPSULE" && noteUnlockDate ? noteUnlockDate : null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const next = [...notes, data.note];
      setNotes(next);
      updateLocalStoreSection("notes", next);
      setNoteTitle("");
      setNoteContent("");
      setNoteUnlockDate("");
      showToast("Yeni not/kapsül eklendi!");
    }
  };

  const deleteNote = async (id: string) => {
    const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      const next = notes.filter((n) => n.id !== id);
      setNotes(next);
      updateLocalStoreSection("notes", next);
      showToast("Not silindi.");
    }
  };

  // Anı & Site Ayarları İşlemleri
  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memTitle.trim() || !memStory.trim() || !memUrl.trim() || !memDate)
      return;
    const res = await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: memTitle,
        story: memStory,
        mediaUrl: memUrl,
        location: memLocation,
        date: memDate,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const next = [...memories, data.memory];
      setMemories(next);
      updateLocalStoreSection("memories", next);
      setMemTitle("");
      setMemStory("");
      setMemUrl("");
      setMemLocation("");
      setMemDate("");
      showToast("Yeni anı zaman tüneline eklendi!");
    }
  };

  const deleteMemory = async (id: string) => {
    const res = await fetch(`/api/memories?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      const next = memories.filter((m) => m.id !== id);
      setMemories(next);
      updateLocalStoreSection("memories", next);
      showToast("Anı silindi.");
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteConfig) return;
    const res = await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteConfig),
    });
    if (res.ok) {
      const data = await res.json();
      setSiteConfig(data.config);
      updateLocalStoreSection("siteConfig", data.config);
      showToast("Site ayarları ve şarkı listesi kaydedildi!");
    }
  };

  const addSongToPlaylist = () => {
    if (!siteConfig || !songTitle.trim() || !songUrl.trim()) return;
    const newSong: PlaylistItem = {
      title: songTitle.trim(),
      artist: songArtist.trim() || "Bizim Şarkımız",
      url: songUrl.trim(),
      note: songNote.trim(),
    };
    const nextConfig = {
      ...siteConfig,
      playlist: [...(siteConfig.playlist || []), newSong],
    };
    setSiteConfig(nextConfig);
    updateLocalStoreSection("siteConfig", nextConfig);
    setSongTitle("");
    setSongArtist("");
    setSongUrl("");
    setSongNote("");
  };

  const removeSongFromPlaylist = (index: number) => {
    if (!siteConfig) return;
    const updated = siteConfig.playlist.filter((_, i) => i !== index);
    const nextConfig = { ...siteConfig, playlist: updated };
    setSiteConfig(nextConfig);
    updateLocalStoreSection("siteConfig", nextConfig);
  };

  // Filtrelenmiş Loglar
  const filteredLogs = logs.filter((l) => {
    if (logFilter === "ALL") return true;
    if (logFilter === "MESSAGE_WISH")
      return l.actionType === "MESSAGE" || l.actionType === "WISH";
    return l.actionType === logFilter;
  });

  return (
    <div className="min-h-dvh pb-20 overflow-x-hidden">
      {/* Bildirim Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 px-5 py-3.5 rounded-2xl bg-wine text-white text-xs sm:text-sm font-bold shadow-2xl flex items-center justify-center sm:justify-start gap-2">
          <Check className="w-4 h-4 text-pink-200 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Tüm Verileri / Logları Temizle Onay Modalı */}
      {confirmClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="bg-[#FFF8F5] border-2 border-rosewarm rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h4 className="font-serif text-xl font-bold text-wine">
              Tüm Logları ve Etkileşimleri Temizle?
            </h4>
            <p className="text-xs sm:text-sm text-[#6D2E46] leading-relaxed">
              Bu işlem kayıtlı <strong>{logs.length} etkileşim günlüğünü</strong> tamamen
              silecek ve kullanılmış kuponları/zarfları tekrar sıfırlayacaktır.
              Onaylıyor musun?
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleClearAllLogsAndData}
                className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md"
              >
                Evet, Tümünü Temizle 🗑️
              </button>
              <button
                type="button"
                onClick={() => setConfirmClearModal(false)}
                className="flex-1 py-3 px-4 rounded-2xl bg-powder text-wine font-bold text-xs sm:text-sm"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Üst Bar */}
      <header className="glass-card sticky top-0 z-30 border-b border-rosewarm/25 px-3 sm:px-8 py-3.5 sm:py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-rosewarm to-wine text-white flex items-center justify-center font-serif font-bold text-base sm:text-lg shadow shrink-0">
              ♥
            </div>
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                <h1 className="font-serif text-base sm:text-xl font-bold text-wine truncate">
                  Doğum Günü Evreni — Yönetim Paneli
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rosewarm text-white text-[11px] font-extrabold animate-pulse shrink-0">
                    {unreadCount} Yeni
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-[#6D2E46] truncate">
                Sevgilinin tüm etkileşimlerini canlı takip et ve içerikleri yönet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            <button
              type="button"
              onClick={fetchAllAdminData}
              className="min-w-[40px] min-h-[40px] p-2.5 rounded-xl bg-powder text-wine hover:bg-rosewarm hover:text-white flex items-center justify-center transition-colors"
              title="Verileri Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-powder text-wine text-xs font-bold hover:bg-rosewarm hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>Siteyi Gör</span>
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold hover:bg-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Çıkış</span>
            </button>
          </div>
        </div>

        {/* Modül Sekmeleri */}
        <div className="max-w-6xl mx-auto mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            {
              id: "FEED",
              label: "Canlı Günlük & Bildirimler",
              icon: Bell,
              badge: unreadCount,
            },
            { id: "WHEEL", label: "Çark Yöneticisi", icon: Utensils },
            { id: "QUIZ", label: "Quiz Yöneticisi", icon: HelpCircle },
            { id: "COUPONS", label: "Kupon Yöneticisi", icon: Ticket },
            { id: "NOTES", label: "Kavanoz & Kapsül", icon: BookHeart },
            { id: "MEMORIES_CONFIG", label: "Anılar & Site Ayarları", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-rosewarm to-wine text-white shadow"
                    : "bg-white/80 text-wine hover:bg-powder"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? "bg-white text-wine" : "bg-rosewarm text-white"
                    }`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        {/* Veri Depolama Durumu, Tek Tıkla Temizleme & JSON Yedekleme Kartı */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-rosewarm/30">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-powder text-wine flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-rosewarm" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base text-wine">
                  Hafif Bulut & Tarayıcı Depolama Durumu
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Harici Veritabanı Gerektirmez ✓
                </span>
              </div>
              <p className="text-xs text-[#6D2E46] mt-0.5">
                Toplam <strong>{storageStats.totalRecords} kayıt</strong> ({logs.length} etkileşim logu) • Veri Boyutu:{" "}
                <strong>{storageStats.sizeKB} KB</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-powder hover:bg-rosewarm hover:text-white text-wine text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>JSON Yedek İndir</span>
            </button>

            <label className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/90 hover:bg-powder text-wine border border-rosewarm/25 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>Yedek Yükle</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Tüm etkileşim loglarını temizlemek ve kuponları sıfırlamak istediğine emin misin?"
                  )
                ) {
                  handleClearAllLogsAndData();
                }
              }}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Verileri Temizle</span>
            </button>
          </div>
        </div>

        {/* 1. GENEL BAKIŞ & CANLI GÜNLÜK (ACTIVITY FEED) */}
        {activeTab === "FEED" && (
          <div className="space-y-6">
            {/* 4 KPI Kartı */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card rounded-3xl p-5">
                <div className="flex items-center justify-between text-rosewarm mb-2">
                  <span className="text-xs font-bold uppercase">Okunmamış Bildirim</span>
                  <Bell className="w-5 h-5" />
                </div>
                <p className="font-serif text-3xl font-bold text-wine">
                  {unreadCount} Adet
                </p>
                <p className="text-xs text-[#6D2E46] mt-1">
                  Toplam {logs.length} etkileşim kaydı var
                </p>
              </div>

              <div className="glass-card rounded-3xl p-5">
                <div className="flex items-center justify-between text-rosewarm mb-2">
                  <span className="text-xs font-bold uppercase">Son Ruh Hali</span>
                  <Smile className="w-5 h-5" />
                </div>
                <p className="font-serif text-lg font-bold text-wine truncate">
                  {latestMoodLog
                    ? latestMoodLog.title.replace("Ruh Hali Seçti: ", "")
                    : "Henüz Seçilmedi"}
                </p>
                <p className="text-xs text-[#6D2E46] mt-1">
                  {latestMoodLog
                    ? new Date(latestMoodLog.createdAt).toLocaleTimeString("tr-TR")
                    : "Seçtiğinde burada görünür"}
                </p>
              </div>

              <div className="glass-card rounded-3xl p-5">
                <div className="flex items-center justify-between text-rosewarm mb-2">
                  <span className="text-xs font-bold uppercase">Son Trip Seviyesi</span>
                  <Flame className="w-5 h-5" />
                </div>
                <p className="font-serif text-lg font-bold text-wine truncate">
                  {latestTripLog
                    ? latestTripLog.title.replace("Trip Atıldı! ", "")
                    : "Trip Yok (%0) 😇"}
                </p>
                <p className="text-xs text-[#6D2E46] mt-1 truncate">
                  {latestTripLog?.detail || "Şu an her şey süt liman"}
                </p>
              </div>

              <div className="glass-card rounded-3xl p-5">
                <div className="flex items-center justify-between text-rosewarm mb-2">
                  <span className="text-xs font-bold uppercase">Kullanılan Kupon</span>
                  <Ticket className="w-5 h-5" />
                </div>
                <p className="font-serif text-3xl font-bold text-wine">
                  {usedCouponsCount} / {coupons.length}
                </p>
                <p className="text-xs text-[#6D2E46] mt-1">
                  Kupon cüzdanı kullanım oranı
                </p>
              </div>
            </div>

            {/* Filtreler ve Tümünü Okundu İşaretle */}
            <div className="glass-card rounded-3xl p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: "ALL", label: "Tümü" },
                    { id: "TRIP", label: "😤 Trip" },
                    { id: "MOOD", label: "🥰 Ruh Hali" },
                    { id: "MESSAGE_WISH", label: "💌 Mesaj & Dilek" },
                    { id: "WHEEL_SPIN", label: "🍕 Çark" },
                    { id: "COUPON_USED", label: "🎟️ Kuponlar" },
                    { id: "QUIZ_COMPLETED", label: "🏆 Quiz" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setLogFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        logFilter === f.id
                          ? "bg-wine text-white"
                          : "bg-powder/80 text-wine hover:bg-rosewarm/20"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllLogsRead}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rosewarm to-wine text-white text-xs font-bold shadow"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Tümünü Okundu İşaretle ({unreadCount})</span>
                  </button>
                )}
              </div>

              {/* Log Akışı */}
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-sm text-[#6D2E46]">
                  Bu filtrede henüz bir etkileşim kaydı bulunmuyor 🌸
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        log.isRead
                          ? "bg-white/70 border-rosewarm/20"
                          : "bg-powder/90 border-rosewarm shadow-sm"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {!log.isRead && (
                            <span className="px-2.5 py-0.5 rounded-full bg-wine text-white text-[10px] font-extrabold uppercase">
                              Yeni / Okunmadı
                            </span>
                          )}
                          <span className="text-xs font-bold text-rosewarm uppercase">
                            [{log.actionType}]
                          </span>
                          <span className="text-xs text-[#6D2E46]">
                            {new Date(log.createdAt).toLocaleString("tr-TR")}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-wine break-words">
                          {log.title}
                        </h4>
                        {log.detail && (
                          <p className="text-xs sm:text-sm text-[#4A1525] bg-white/80 p-2.5 rounded-xl border border-rosewarm/15 break-words">
                            {log.detail}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {!log.isRead && (
                          <button
                            type="button"
                            onClick={() => markLogRead(log.id)}
                            className="px-3 py-1.5 rounded-xl bg-white text-wine border border-rosewarm/30 text-xs font-bold hover:bg-wine hover:text-white transition-colors"
                          >
                            Okundu İşaretle
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteLog(log.id)}
                          className="p-2 rounded-xl text-rose-700 hover:bg-rose-100"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. ÇARK YÖNETİCİSİ */}
        {activeTab === "WHEEL" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleAddWheel}
              className="lg:col-span-4 glass-card rounded-3xl p-6 space-y-4 h-fit"
            >
              <h3 className="font-serif text-xl font-bold text-wine">
                Yeni Çark Seçeneği Ekle 🍕
              </h3>
              <div>
                <label className="block text-xs font-bold text-wine uppercase mb-1">
                  Yemek / Aktivite Adı
                </label>
                <input
                  type="text"
                  required
                  value={newWheelLabel}
                  onChange={(e) => setNewWheelLabel(e.target.value)}
                  placeholder="Örn: Bol Soslu İskender 🥙"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-rosewarm/30 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-wine uppercase mb-1">
                  Dilim Rengi
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newWheelColor}
                    onChange={(e) => setNewWheelColor(e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono text-wine">{newWheelColor}</span>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Çarka Ekle</span>
              </button>
            </form>

            <div className="lg:col-span-8 glass-card rounded-3xl p-6">
              <h3 className="font-serif text-xl font-bold text-wine mb-4">
                Mevcut Çark Dilimleri ({wheelItems.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wheelItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white/90 border border-rosewarm/25 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-5 h-5 rounded-full shrink-0 border border-black/10"
                        style={{ backgroundColor: item.color }}
                      />
                      <span
                        className={`text-sm font-bold truncate ${
                          item.isActive ? "text-wine" : "text-gray-400 line-through"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleWheelActive(item)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          item.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {item.isActive ? "Aktif" : "Pasif"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteWheelItem(item.id)}
                        className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. QUİZ YÖNETİCİSİ */}
        {activeTab === "QUIZ" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleSaveQuiz}
              className="lg:col-span-5 glass-card rounded-3xl p-6 space-y-4 h-fit"
            >
              <h3 className="font-serif text-xl font-bold text-wine">
                {editingQuizId ? "Soruyu Düzenle ✏️" : "Yeni Quiz Sorusu Ekle 💕"}
              </h3>
              <div>
                <label className="block text-xs font-bold text-wine uppercase mb-1">
                  Soru Metni
                </label>
                <textarea
                  rows={2}
                  required
                  value={quizQuestionText}
                  onChange={(e) => setQuizQuestionText(e.target.value)}
                  placeholder="Örn: İlk buluşmamızda ne içmiştik?"
                  className="w-full p-3 rounded-xl bg-white border border-rosewarm/30 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-wine uppercase">
                  4 Şık (ve Doğru Şıkkı Seç)
                </label>
                {quizOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctIdx"
                      checked={quizCorrectIdx === idx}
                      onChange={() => setQuizCorrectIdx(idx)}
                      className="accent-wine"
                    />
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const copy = [...quizOptions];
                        copy[idx] = e.target.value;
                        setQuizOptions(copy);
                      }}
                      placeholder={`${idx + 1}. Şık`}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-rosewarm/30 text-xs"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-wine uppercase mb-1">
                  Ödül / Cevap Sonrası Tatlı Mesaj
                </label>
                <input
                  type="text"
                  value={quizReward}
                  onChange={(e) => setQuizReward(e.target.value)}
                  placeholder="Örn: Harikasın, o günü unutamam 🥰"
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-rosewarm/30 text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-xs shadow"
                >
                  {editingQuizId ? "Güncelle" : "Soruyu Ekle"}
                </button>
                {editingQuizId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuizId(null);
                      setQuizQuestionText("");
                      setQuizOptions(["", "", "", ""]);
                      setQuizReward("");
                    }}
                    className="px-4 py-3 rounded-xl bg-powder text-wine text-xs font-bold"
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>

            <div className="lg:col-span-7 glass-card rounded-3xl p-6 space-y-3">
              <h3 className="font-serif text-xl font-bold text-wine mb-2">
                Kayıtlı Quiz Soruları ({quizQuestions.length})
              </h3>
              {quizQuestions.map((q, i) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-white/90 border border-rosewarm/25 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-wine">
                      {i + 1}. {q.question}
                    </h4>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditQuiz(q)}
                        className="px-2.5 py-1 rounded-lg bg-powder text-wine text-xs font-bold"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteQuiz(q.id)}
                        className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {q.options.map((o, idx) => (
                      <div
                        key={idx}
                        className={`px-2.5 py-1.5 rounded-lg ${
                          idx === q.correctIndex
                            ? "bg-emerald-100 text-emerald-900 font-bold"
                            : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {o}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. KUPON YÖNETİCİSİ */}
        {activeTab === "COUPONS" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleAddCoupon}
              className="lg:col-span-4 glass-card rounded-3xl p-6 space-y-4 h-fit"
            >
              <h3 className="font-serif text-xl font-bold text-wine">
                Yeni Hediye Kuponu 🎟️
              </h3>
              <div>
                <label className="block text-xs font-bold text-wine uppercase mb-1">
                  Emoji
                </label>
                <input
                  type="text"
                  value={couponEmoji}
                  onChange={(e) => setCouponEmoji(e.target.value)}
                  className="w-20 px-3 py-2 rounded-xl bg-white border border-rosewarm/30 text-center text-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-wine uppercase mb-1">
                  Kupon Başlığı
                </label>
                <input
                  type="text"
                  required
                  value={couponTitle}
                  onChange={(e) => setCouponTitle(e.target.value)}
                  placeholder="Örn: 30 Dk VIP Masaj Hakkı"
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-rosewarm/30 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-wine uppercase mb-1">
                  Açıklama
                </label>
                <textarea
                  rows={3}
                  required
                  value={couponDesc}
                  onChange={(e) => setCouponDesc(e.target.value)}
                  placeholder="Kuponun sağladığı ayrıcalık..."
                  className="w-full p-3 rounded-xl bg-white border border-rosewarm/30 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-xs shadow"
              >
                Kuponu Oluştur
              </button>
            </form>

            <div className="lg:col-span-8 glass-card rounded-3xl p-6">
              <h3 className="font-serif text-xl font-bold text-wine mb-4">
                Tüm Kuponlar ({coupons.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-white/90 border border-rosewarm/25 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{c.emoji}</span>
                      <div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-1 ${
                            c.isUsed
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {c.isUsed ? "KULLANILDI" : "AKTİF"}
                        </span>
                        <h4 className="font-bold text-sm text-wine">{c.title}</h4>
                        <p className="text-xs text-[#6D2E46] mt-0.5">{c.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-rosewarm/15">
                      {c.isUsed && (
                        <button
                          type="button"
                          onClick={() => resetCoupon(c.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-powder text-wine text-xs font-bold hover:bg-rosewarm hover:text-white transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Sıfırla (Tekrar Aktif Et)</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteCoupon(c.id)}
                        className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. KAVANOZ, KURABİYE & ZAMAN KAPSÜLÜ YÖNETİCİSİ */}
        {activeTab === "NOTES" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleAddNote}
              className="lg:col-span-4 glass-card rounded-3xl p-6 space-y-4 h-fit"
            >
              <h3 className="font-serif text-xl font-bold text-wine">
                Yeni Not / Kapsül Ekle 💌
              </h3>
              <div>
                <label className="block text-xs font-bold text-wine uppercase mb-1">
                  Kategori Tipi
                </label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as typeof noteType)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-rosewarm/30 text-xs font-bold text-wine"
                >
                  <option value="JAR">🫙 &ldquo;Neden Sen?&rdquo; Kavanoz Notu</option>
                  <option value="COOKIE">🥠 Şans Kurabiyesi Falı</option>
                  <option value="CAPSULE">⏳ Zaman Kapsülü Mektubu</option>
                </select>
              </div>

              {noteType !== "COOKIE" && (
                <div>
                  <label className="block text-xs font-bold text-wine uppercase mb-1">
                    Başlık
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Örn: Gülüşün..."
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-rosewarm/30 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-wine uppercase mb-1">
                  İçerik / Mesaj
                </label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Sevgi dolu mesajını buraya yaz..."
                  className="w-full p-3 rounded-xl bg-white border border-rosewarm/30 text-xs"
                />
              </div>

              {noteType === "CAPSULE" && (
                <div>
                  <label className="block text-xs font-bold text-wine uppercase mb-1">
                    Kilit Açılma Tarihi (Boş bırakılırsa hemen açılabilir)
                  </label>
                  <input
                    type="date"
                    value={noteUnlockDate}
                    onChange={(e) => setNoteUnlockDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-rosewarm/30 text-xs"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-xs shadow"
              >
                Kaydet & Ekle
              </button>
            </form>

            <div className="lg:col-span-8 glass-card rounded-3xl p-6 space-y-4">
              <h3 className="font-serif text-xl font-bold text-wine">
                Kayıtlı Notlar & Zarflar ({notes.length})
              </h3>
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-2xl bg-white/90 border border-rosewarm/25 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-powder text-wine text-[10px] font-bold">
                          {n.type === "JAR"
                            ? "🫙 Kavanoz"
                            : n.type === "COOKIE"
                            ? "🥠 Kurabiye"
                            : "⏳ Zaman Kapsülü"}
                        </span>
                        {n.unlockDate && (
                          <span className="text-[11px] text-rosewarm font-semibold">
                            Kilit: {new Date(n.unlockDate).toLocaleDateString("tr-TR")}
                          </span>
                        )}
                      </div>
                      {n.title && (
                        <h4 className="font-bold text-sm text-wine">{n.title}</h4>
                      )}
                      <p className="text-xs text-[#6D2E46] mt-0.5">{n.content}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteNote(n.id)}
                      className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. ANILAR & SİTE AYARLARI */}
        {activeTab === "MEMORIES_CONFIG" && (
          <div className="space-y-8">
            {/* SiteConfig Formu */}
            {siteConfig && (
              <form
                onSubmit={handleSaveConfig}
                className="glass-card rounded-3xl p-6 sm:p-8 space-y-6"
              >
                <h3 className="font-serif text-2xl font-bold text-wine">
                  Genel Site Ayarları & Müzik Listesi ⚙️🎵
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-wine uppercase mb-1">
                      Sevgilinin Adı / Hitabın
                    </label>
                    <input
                      type="text"
                      value={siteConfig.partnerName}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, partnerName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-rosewarm/30 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-wine uppercase mb-1">
                      İlişki Başlangıç Tarihi
                    </label>
                    <input
                      type="datetime-local"
                      value={
                        siteConfig.relationshipDate
                          ? new Date(siteConfig.relationshipDate)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          relationshipDate: new Date(e.target.value).toISOString(),
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-rosewarm/30 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-wine uppercase mb-1">
                      Ana Karşılama Başlığı (Hero Title)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.heroTitle}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, heroTitle: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-rosewarm/30 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-wine uppercase mb-1">
                      Alt Karşılama Metni (Hero Subtitle)
                    </label>
                    <textarea
                      rows={2}
                      value={siteConfig.heroSubtitle}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, heroSubtitle: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-white border border-rosewarm/30 text-sm"
                    />
                  </div>
                </div>

                {/* Müzik Listesi Yönetimi */}
                <div className="pt-4 border-t border-rosewarm/20 space-y-4">
                  <h4 className="font-serif text-lg font-bold text-wine">
                    Arka Plan Müzik Çalma Listesi ({siteConfig.playlist?.length || 0} Şarkı)
                  </h4>

                  <div className="space-y-2">
                    {(siteConfig.playlist || []).map((song, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white/90 border border-rosewarm/25 flex items-center justify-between gap-3"
                      >
                        <div className="text-xs min-w-0">
                          <p className="font-bold text-wine truncate">
                            {song.title} — <span className="font-normal">{song.artist}</span>
                          </p>
                          <p className="text-[#6D2E46] italic truncate">{song.note}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSongFromPlaylist(idx)}
                          className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Yeni Şarkı Ekleme Alanı */}
                  <div className="p-4 rounded-2xl bg-powder/60 border border-rosewarm/25 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="Şarkı Adı"
                      className="px-3 py-2 rounded-xl bg-white text-xs"
                    />
                    <input
                      type="text"
                      value={songArtist}
                      onChange={(e) => setSongArtist(e.target.value)}
                      placeholder="Sanatçı"
                      className="px-3 py-2 rounded-xl bg-white text-xs"
                    />
                    <input
                      type="text"
                      value={songUrl}
                      onChange={(e) => setSongUrl(e.target.value)}
                      placeholder="MP3 URL Adresi (https://...)"
                      className="px-3 py-2 rounded-xl bg-white text-xs sm:col-span-2"
                    />
                    <input
                      type="text"
                      value={songNote}
                      onChange={(e) => setSongNote(e.target.value)}
                      placeholder="Bu şarkıya özel romantik notun..."
                      className="px-3 py-2 rounded-xl bg-white text-xs sm:col-span-2"
                    />
                    <button
                      type="button"
                      onClick={addSongToPlaylist}
                      className="sm:col-span-2 py-2.5 rounded-xl bg-wine text-white text-xs font-bold"
                    >
                      + Şarkıyı Listeye Ekle
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-sm shadow-lg"
                >
                  Tüm Site Ayarlarını Kaydet 💾
                </button>
              </form>
            )}

            {/* Anı Zaman Tüneli Yönetimi */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleAddMemory}
                className="lg:col-span-4 glass-card rounded-3xl p-6 space-y-4 h-fit"
              >
                <h3 className="font-serif text-xl font-bold text-wine">
                  Yeni Anı Ekle 📸
                </h3>
                <div>
                  <label className="block text-xs font-bold text-wine uppercase mb-1">
                    Anı Başlığı
                  </label>
                  <input
                    type="text"
                    required
                    value={memTitle}
                    onChange={(e) => setMemTitle(e.target.value)}
                    placeholder="Örn: İlk Tatilimiz 🌊"
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-rosewarm/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-wine uppercase mb-1">
                    Fotoğraf URL
                  </label>
                  <input
                    type="url"
                    required
                    value={memUrl}
                    onChange={(e) => setMemUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-rosewarm/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-wine uppercase mb-1">
                    Konum
                  </label>
                  <input
                    type="text"
                    value={memLocation}
                    onChange={(e) => setMemLocation(e.target.value)}
                    placeholder="Örn: Sahil Kahvecisi ☕"
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-rosewarm/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-wine uppercase mb-1">
                    Tarih
                  </label>
                  <input
                    type="date"
                    required
                    value={memDate}
                    onChange={(e) => setMemDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-rosewarm/30 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-wine uppercase mb-1">
                    Anının Hikayesi
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={memStory}
                    onChange={(e) => setMemStory(e.target.value)}
                    placeholder="O gün neler hissetmiştin..."
                    className="w-full p-3 rounded-xl bg-white border border-rosewarm/30 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rosewarm to-wine text-white font-bold text-xs shadow"
                >
                  Zaman Tüneline Ekle
                </button>
              </form>

              <div className="lg:col-span-8 glass-card rounded-3xl p-6 space-y-4">
                <h3 className="font-serif text-xl font-bold text-wine">
                  Zaman Tünelindeki Anılar ({memories.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {memories.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-2xl bg-white/90 border border-rosewarm/25 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.mediaUrl}
                          alt={m.title}
                          className="w-full h-36 object-cover"
                        />
                        <div className="p-4">
                          <span className="text-[11px] font-bold text-rosewarm">
                            {new Date(m.date).toLocaleDateString("tr-TR")} • {m.location}
                          </span>
                          <h4 className="font-bold text-sm text-wine mt-0.5">
                            {m.title}
                          </h4>
                          <p className="text-xs text-[#6D2E46] mt-1 line-clamp-3">
                            {m.story}
                          </p>
                        </div>
                      </div>
                      <div className="px-4 pb-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => deleteMemory(m.id)}
                          className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
