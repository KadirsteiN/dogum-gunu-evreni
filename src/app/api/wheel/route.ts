import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = getStore();
  return NextResponse.json({ items: store.wheelItems });
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { label, color, category, isActive } = body;

    if (!label || typeof label !== "string") {
      return NextResponse.json({ error: "Dilim adı zorunludur." }, { status: 400 });
    }

    const store = getStore();
    const item = {
      id: generateId("wheel"),
      label: label.trim(),
      color: color || "#FF8FA3",
      category: category || "FOOD",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    store.wheelItems.push(item);
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Çark dilimi eklenemedi." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, label, color, category, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Dilim ID zorunludur." }, { status: 400 });
    }

    const store = getStore();
    let updatedItem = null;

    store.wheelItems = store.wheelItems.map((w) => {
      if (w.id === id) {
        updatedItem = {
          ...w,
          ...(label !== undefined && { label }),
          ...(color !== undefined && { color }),
          ...(category !== undefined && { category }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        };
        return updatedItem;
      }
      return w;
    });

    return NextResponse.json({ item: updatedItem });
  } catch {
    return NextResponse.json({ error: "Çark dilimi güncellenemedi." }, { status: 500 });
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
      return NextResponse.json({ error: "Dilim ID zorunludur." }, { status: 400 });
    }

    const store = getStore();
    store.wheelItems = store.wheelItems.filter((w) => w.id !== id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Çark dilimi silinemedi." }, { status: 500 });
  }
}
