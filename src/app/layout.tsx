import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/material-theme.css";
import BottomNavigation from "@/components/BottomNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ジムトピア",
  description: "理想のジムを見つけよう - あなたのフィットネスライフをサポート",
  openGraph: {
    title: "ジムトピア",
    description: "理想のジムを見つけよう - あなたのフィットネスライフをサポート",
    siteName: "ジムトピア",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ジムトピア",
    description: "理想のジムを見つけよう - あなたのフィットネスライフをサポート",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen pb-20">
          {children}
        </div>
        <BottomNavigation />
      </body>
    </html>
  );
}
