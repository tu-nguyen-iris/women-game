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
  title: "Ngày Phụ nữ Việt Nam 20/10 — Mini game",
  description:
    "Đoán đồng nghiệp và mở quà bí mật trong buổi giao lưu 20/10 của team.",
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
