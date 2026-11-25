import { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "admin_token";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "degistirilecek-admin-sifresi";
}

export function getAdminSecretToken(): string {
  return (
    process.env.ADMIN_SECRET_TOKEN ||
    "dogum-gunu-evreni-varsayilan-guvenlik-anahtari-2026"
  );
}

export function verifyAdmin(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const secret = getAdminSecretToken();

  if (!token) {
    return false;
  }

  return token === secret;
}
