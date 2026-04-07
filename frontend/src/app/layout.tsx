import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { TenantProvider } from "@/context/TenantContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import LayoutContent from "@/components/layout/LayoutContent";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contract Ledger | AI 기반 계약 분석 플랫폼",
  description: "AI를 활용한 영문 계약서 요약 및 리스크 분석 - 스마트 계약 관리 데이터베이스",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} dark`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface font-body text-on-surface overflow-hidden">
        <AuthProvider>
          <TenantProvider>
            <NotificationProvider>
              <LayoutContent>{children}</LayoutContent>
            </NotificationProvider>
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
