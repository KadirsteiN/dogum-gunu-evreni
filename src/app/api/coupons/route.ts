import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = getStore();
  return NextResponse.json({ coupons: store.coupons });
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, emoji } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Kupon başlığı ve açıklaması zorunludur." },
        { status: 400 }
      );
    }

    const store = getStore();
    const coupon = {
      id: generateId("coupon"),
      title: title.trim(),
      description: description.trim(),
      emoji: emoji || "🎟️",
      isUsed: false,
      usedAt: null,
    };

    store.coupons.push(coupon);
    return NextResponse.json({ coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Kupon oluşturulamadı." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, isUsed, title, description, emoji } = body;

    if (!id) {
      return NextResponse.json({ error: "Kupon ID gerekli." }, { status: 400 });
    }

    const store = getStore();
    let updated = null;

    store.coupons = store.coupons.map((c) => {
      if (c.id === id) {
        updated = {
          ...c,
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(emoji !== undefined && { emoji }),
          ...(isUsed !== undefined && {
            isUsed: Boolean(isUsed),
            usedAt: isUsed ? new Date().toISOString() : null,
          }),
        };
        return updated;
      }
      return c;
    });

    return NextResponse.json({ coupon: updated });
  } catch {
    return NextResponse.json({ error: "Kupon güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Kupon ID gerekli." }, { status: 400 });
    }

    const store = getStore();
    store.coupons = store.coupons.filter((c) => c.id !== id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Kupon silinemedi." }, { status: 500 });
  }
}
