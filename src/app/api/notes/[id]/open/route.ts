import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const store = getStore();

    const existing = store.notes.find((n) => n.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Zaman kapsülü bulunamadı." }, { status: 404 });
    }

    if (existing.unlockDate && new Date(existing.unlockDate) > new Date()) {
      return NextResponse.json(
        { error: "Bu zaman kapsülünün açılma tarihi henüz gelmedi!" },
        { status: 403 }
      );
    }

    const updated = { ...existing, isOpened: true };
    store.notes = store.notes.map((n) => (n.id === id ? updated : n));

    let log = null;
    if (!existing.isOpened) {
      log = {
        id: generateId("log"),
        actionType: "CAPSULE_OPENED",
        title: `Zaman Kapsülü Açıldı: ${updated.title || "Özel Zarf"}`,
        detail:
          updated.content.slice(0, 120) +
          (updated.content.length > 120 ? "..." : ""),
        metadata: { noteId: updated.id, title: updated.title },
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.activityLogs = [log, ...store.activityLogs];
    }

    return NextResponse.json({ success: true, note: updated, log });
  } catch {
    return NextResponse.json(
      { error: "Zarf açılırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
