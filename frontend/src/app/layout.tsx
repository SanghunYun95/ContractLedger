import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { TenantProvider } from "@/context/TenantContext";
import { AuthProvider } from "@/context/AuthContext";
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
  title: "Contract Ledger | Audit & AI Webhooks",
  description: "The Sovereign Vault - Contract Ledger Platform",
  icons: {
    icon: "/icon.png",
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
            <LayoutContent>{children}</LayoutContent>
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
