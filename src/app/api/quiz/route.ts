import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = getStore();
  return NextResponse.json({ questions: store.quizQuestions });
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { question, options, correctIndex, rewardMessage, order } = body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "Soru metni ve en az 2 şık gereklidir." },
        { status: 400 }
      );
    }

    const store = getStore();
    const created = {
      id: generateId("quiz"),
      question: question.trim(),
      options: options.map((o: string) => o.trim()),
      correctIndex: Number(correctIndex) || 0,
      rewardMessage: rewardMessage || null,
      order: Number(order) || store.quizQuestions.length + 1,
    };

    store.quizQuestions.push(created);
    return NextResponse.json({ question: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Soru eklenemedi." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, question, options, correctIndex, rewardMessage, order } = body;

    if (!id) {
      return NextResponse.json({ error: "Soru ID zorunludur." }, { status: 400 });
    }

    const store = getStore();
    let updated = null;

    store.quizQuestions = store.quizQuestions.map((q) => {
      if (q.id === id) {
        updated = {
          ...q,
          ...(question !== undefined && { question }),
          ...(options !== undefined && { options }),
          ...(correctIndex !== undefined && { correctIndex: Number(correctIndex) }),
          ...(rewardMessage !== undefined && { rewardMessage }),
          ...(order !== undefined && { order: Number(order) }),
        };
        return updated;
      }
      return q;
    });

    return NextResponse.json({ question: updated });
  } catch {
    return NextResponse.json({ error: "Soru güncellenemedi." }, { status: 500 });
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
      return NextResponse.json({ error: "Soru ID zorunludur." }, { status: 400 });
    }

    const store = getStore();
    store.quizQuestions = store.quizQuestions.filter((q) => q.id !== id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Soru silinemedi." }, { status: 500 });
  }
}
