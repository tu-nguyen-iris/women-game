import type { Metadata } from "next";
import { Be_Vietnam_Pro, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Atmosphere } from "@/components/atmosphere";
import "./globals.css";

const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://women-game.vercel.app"),
  title: "Ngày Phụ nữ Việt Nam 20/10 — Mini game",
  description:
    "Đoán đồng nghiệp và mở quà bí mật trong buổi giao lưu 20/10 của team.",
  openGraph: {
    title: "Ngày Phụ nữ Việt Nam 20/10 — Mini game",
    description:
      "Đoán đồng nghiệp và mở quà bí mật trong buổi giao lưu 20/10 của team.",
    url: "https://women-game.vercel.app",
    siteName: "Women Game 20/10",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "https://women-game.vercel.app/og-2010.png",
        width: 1672,
        height: 941,
        alt: "RIO — Chào mừng Ngày Phụ nữ Việt Nam 20/10",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ngày Phụ nữ Việt Nam 20/10 — Mini game",
    description:
      "Đoán đồng nghiệp và mở quà bí mật trong buổi giao lưu 20/10 của team.",
    images: ["https://women-game.vercel.app/og-2010.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col font-[family-name:var(--font-body)] text-[var(--ink)]">
        <Atmosphere />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
