import { NextRequest, NextResponse } from "next/server";
import { getStore, resetStore, replaceStore } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const actionType = searchParams.get("actionType");

    const store = getStore();
    const logs =
      actionType && actionType !== "ALL"
        ? store.activityLogs.filter((l) => l.actionType === actionType)
        : store.activityLogs;

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: "Günlükler alınamadı." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (body && body.importStore) {
      const updated = replaceStore(body.importStore);
      return NextResponse.json({ success: true, store: updated });
    }
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Veri içe aktarılamadı." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, markAll } = body;
    const store = getStore();

    if (markAll) {
      store.activityLogs = store.activityLogs.map((l) => ({
        ...l,
        isRead: true,
      }));
      return NextResponse.json({
        success: true,
        message: "Tümü okundu işaretlendi.",
      });
    }

    if (!id) {
      return NextResponse.json({ error: "Log ID gerekli." }, { status: 400 });
    }

    let updatedLog = null;
    store.activityLogs = store.activityLogs.map((l) => {
      if (l.id === id) {
        updatedLog = { ...l, isRead: true };
        return updatedLog;
      }
      return l;
    });

    return NextResponse.json({ success: true, log: updatedLog });
  } catch {
    return NextResponse.json({ error: "Log güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll");
    const resetAllContent = searchParams.get("resetAllContent") === "true";

    const store = getStore();

    if (clearAll === "true") {
      const reset = resetStore(resetAllContent);
      return NextResponse.json({
        success: true,
        message: "Tüm loglar ve etkileşim verileri temizlendi.",
        store: reset,
      });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Silinecek log ID gerekli." },
        { status: 400 }
      );
    }

    store.activityLogs = store.activityLogs.filter((l) => l.id !== id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Log silinemedi." }, { status: 500 });
  }
}
