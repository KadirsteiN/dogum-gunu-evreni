import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = getStore();
  const sorted = [...store.memories].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return NextResponse.json({ memories: sorted });
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, story, mediaUrl, mediaType, location, date } = body;

    if (!title || !story || !mediaUrl || !date) {
      return NextResponse.json(
        { error: "Başlık, hikaye, görsel URL ve tarih alanları zorunludur." },
        { status: 400 }
      );
    }

    const store = getStore();
    const memory = {
      id: generateId("mem"),
      title: title.trim(),
      story: story.trim(),
      mediaUrl: mediaUrl.trim(),
      mediaType: mediaType || "IMAGE",
      location: location ? location.trim() : null,
      date: new Date(date).toISOString(),
    };

    store.memories.push(memory);
    return NextResponse.json({ memory }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Anı eklenemedi." }, { status: 500 });
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
      return NextResponse.json({ error: "Anı ID gerekli." }, { status: 400 });
    }

    const store = getStore();
    store.memories = store.memories.filter((m) => m.id !== id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Anı silinemedi." }, { status: 500 });
  }
}
