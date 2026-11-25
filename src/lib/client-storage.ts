import {
  ActivityLogData,
  WheelItemData,
  QuizQuestionData,
  CouponData,
  SpecialNoteData,
  MemoryData,
  SiteConfigData,
} from "@/types";
import { UniverseDatabase, createInitialSeedData } from "./db";

export const LOCAL_STORAGE_KEY = "dogum_gunu_evreni_store_v1";

export function loadLocalStore(): UniverseDatabase | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UniverseDatabase;
  } catch {
    return null;
  }
}

export function saveLocalStore(store: UniverseDatabase): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Sessizce yönet
  }
}

export function getOrInitLocalStore(): UniverseDatabase {
  const existing = loadLocalStore();
  if (existing) return existing;
  const seed = createInitialSeedData();
  saveLocalStore(seed);
  return seed;
}

export function appendLocalLog(log: ActivityLogData): void {
  const store = getOrInitLocalStore();
  const exists = store.activityLogs.some((l) => l.id === log.id);
  if (!exists) {
    store.activityLogs = [log, ...store.activityLogs];
    saveLocalStore(store);
  }
}

export async function trackClientActivity(payload: {
  actionType: string;
  title: string;
  detail?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.log) {
        appendLocalLog(data.log);
        return;
      }
    }
  } catch {
    // Sunucu erişilemezse doğrudan yerel depoya kaydet
  }

  appendLocalLog({
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    actionType: payload.actionType,
    title: payload.title,
    detail: payload.detail || null,
    metadata: payload.metadata || null,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
}

export function updateLocalStoreSection<K extends keyof UniverseDatabase>(
  key: K,
  value: UniverseDatabase[K]
): void {
  const store = getOrInitLocalStore();
  store[key] = value;
  saveLocalStore(store);
}

export function clearLocalLogsAndResetCoupons(resetAll = false): UniverseDatabase {
  if (resetAll) {
    const seed = createInitialSeedData();
    saveLocalStore(seed);
    return seed;
  }
  const store = getOrInitLocalStore();
  store.activityLogs = [];
  store.coupons = store.coupons.map((c: CouponData) => ({
    ...c,
    isUsed: false,
    usedAt: null,
  }));
  store.notes = store.notes.map((n: SpecialNoteData) => ({
    ...n,
    isOpened: false,
  }));
  saveLocalStore(store);
  return store;
}

export function getLocalStoreStats(
  logs: ActivityLogData[],
  wheelItems: WheelItemData[],
  quizQuestions: QuizQuestionData[],
  coupons: CouponData[],
  notes: SpecialNoteData[],
  memories: MemoryData[],
  siteConfig: SiteConfigData | null
): { totalRecords: number; sizeKB: string } {
  const payload = {
    siteConfig,
    wheelItems,
    quizQuestions,
    coupons,
    notes,
    memories,
    activityLogs: logs,
  };
  const jsonStr = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(jsonStr).length;
  const sizeKB = (bytes / 1024).toFixed(2);
  const totalRecords =
    logs.length +
    wheelItems.length +
    quizQuestions.length +
    coupons.length +
    notes.length +
    memories.length;

  return { totalRecords, sizeKB };
}
