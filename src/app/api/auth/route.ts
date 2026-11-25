import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminPassword,
  getAdminSecretToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = getAdminPassword();
    const secretToken = getAdminSecretToken();

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Hatalı şifre! Lütfen tekrar dene." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Giriş başarılı!",
    });
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: secretToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 gün
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Giriş işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Çıkış yapıldı.",
    });
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Çıkış yapılırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
