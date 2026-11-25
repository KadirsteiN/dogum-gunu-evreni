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

    const existing = store.coupons.find((c) => c.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Kupon bulunamadı." }, { status: 404 });
    }

    if (existing.isUsed) {
      return NextResponse.json(
        { error: "Bu kupon zaten kullanılmış!" },
        { status: 400 }
      );
    }

    const updated = {
      ...existing,
      isUsed: true,
      usedAt: new Date().toISOString(),
    };

    store.coupons = store.coupons.map((c) => (c.id === id ? updated : c));

    const log = {
      id: generateId("log"),
      actionType: "COUPON_USED",
      title: `Kupon Kullanıldı: ${updated.emoji} ${updated.title}`,
      detail: updated.description,
      metadata: { couponId: updated.id, title: updated.title },
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    store.activityLogs = [log, ...store.activityLogs];

    return NextResponse.json({ success: true, coupon: updated, log });
  } catch {
    return NextResponse.json(
      { error: "Kupon kullanılırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
