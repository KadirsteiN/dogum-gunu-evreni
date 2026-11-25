import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = getStore();
  return NextResponse.json({ notes: store.notes });
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, title, content, unlockDate } = body;

    if (!type || !["JAR", "COOKIE", "CAPSULE"].includes(type)) {
      return NextResponse.json({ error: "Geçersiz not tipi." }, { status: 400 });
    }

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Not içeriği zorunludur." }, { status: 400 });
    }

    const store = getStore();
    const note = {
      id: generateId("note"),
      type: type as "JAR" | "COOKIE" | "CAPSULE",
      title: title ? title.trim() : null,
      content: content.trim(),
      unlockDate: unlockDate ? new Date(unlockDate).toISOString() : null,
      isOpened: false,
      createdAt: new Date().toISOString(),
    };

    store.notes.push(note);
    return NextResponse.json({ note }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Not eklenemedi." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, content, unlockDate, isOpened } = body;

    if (!id) {
      return NextResponse.json({ error: "Not ID gerekli." }, { status: 400 });
    }

    const store = getStore();
    let updated = null;

    store.notes = store.notes.map((n) => {
      if (n.id === id) {
        updated = {
          ...n,
          ...(title !== undefined && { title }),
          ...(content !== undefined && { content }),
          ...(unlockDate !== undefined && {
            unlockDate: unlockDate ? new Date(unlockDate).toISOString() : null,
          }),
          ...(isOpened !== undefined && { isOpened: Boolean(isOpened) }),
        };
        return updated;
      }
      return n;
    });

    return NextResponse.json({ note: updated });
  } catch {
    return NextResponse.json({ error: "Not güncellenemedi." }, { status: 500 });
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
      return NextResponse.json({ error: "Not ID gerekli." }, { status: 400 });
    }

    const store = getStore();
    store.notes = store.notes.filter((n) => n.id !== id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not silinemedi." }, { status: 500 });
  }
}
