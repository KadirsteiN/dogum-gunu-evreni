import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_ACTIONS = [
  "LOGIN",
  "MOOD",
  "TRIP",
  "WHEEL_SPIN",
  "COUPON_USED",
  "MESSAGE",
  "WISH",
  "QUIZ_COMPLETED",
  "CAPSULE_OPENED",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actionType, title, detail, metadata } = body;

    if (!actionType || !VALID_ACTIONS.includes(actionType)) {
      return NextResponse.json(
        { error: "Geçersiz veya eksik aksiyon tipi." },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Başlık alanı zorunludur." },
        { status: 400 }
      );
    }

    const store = getStore();
    const log = {
      id: generateId("log"),
      actionType,
      title,
      detail: detail || null,
      metadata: metadata ?? null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    store.activityLogs = [log, ...store.activityLogs].slice(0, 500);

    return NextResponse.json({ success: true, log }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Etkileşim kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
