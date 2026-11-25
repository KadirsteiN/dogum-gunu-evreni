import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = getStore();
  return NextResponse.json({ config: store.siteConfig });
}

export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { partnerName, heroTitle, heroSubtitle, relationshipDate, playlist } = body;

    const store = getStore();
    store.siteConfig = {
      ...store.siteConfig,
      ...(partnerName !== undefined && { partnerName }),
      ...(heroTitle !== undefined && { heroTitle }),
      ...(heroSubtitle !== undefined && { heroSubtitle }),
      ...(relationshipDate !== undefined && {
        relationshipDate: new Date(relationshipDate).toISOString(),
      }),
      ...(playlist !== undefined && { playlist }),
    };

    return NextResponse.json({ config: store.siteConfig });
  } catch {
    return NextResponse.json({ error: "Ayarlar güncellenemedi." }, { status: 500 });
  }
}
