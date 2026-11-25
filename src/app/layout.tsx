import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  weight: ["600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FFE4EC",
};

export const metadata: Metadata = {
  title: "İyi ki Doğdun Sevgilim 🎂 | Bizim Küçük Evrenimiz",
  description: "Sana özel hazırlanmış sevgi, anı ve sürpriz dolu doğum günü evreni.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased selection:bg-rosewarm/20 selection:text-wine min-h-dvh overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
