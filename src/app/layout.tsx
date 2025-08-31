import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import "@/styles/material-theme.css";
import BottomNavigation from "@/components/BottomNavigation";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-latin",
  weight: ["400", "500", "600", "700"]
});

const notoJP = Noto_Sans_JP({
  subsets: ["japanese"],
  display: "swap",
  variable: "--font-jp",
  weight: ["300", "400", "500", "700"]
});

export const metadata: Metadata = {
  title: "ジムトピア",
  description: "理想のジムを見つけよう - あなたのフィットネスライフをサポート",
  keywords: ["ジム", "フィットネス", "トレーニング", "筋トレ", "ワークアウト"],
  openGraph: {
    title: "ジムトピア",
    description: "理想のジムを見つけよう - あなたのフィットネスライフをサポート",
    siteName: "ジムトピア",
    locale: "ja_JP",
    type: "website",
    url: "https://gymtopia.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "ジムトピア",
    description: "理想のジムを見つけよう - あなたのフィットネスライフをサポート",
    site: "@gymtopia",
  },
  alternates: {
    canonical: "https://gymtopia.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoJP.variable}`}>
      <body className="antialiased">
        <div className="min-h-screen pb-20">
          {children}
        </div>
        <BottomNavigation />
      </body>
    </html>
  );
}
