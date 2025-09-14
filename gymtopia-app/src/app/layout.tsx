import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import "@/styles/material-theme.css";
<<<<<<< HEAD
import BottomNavigation from "@/components/BottomNavigation";
=======
import ConditionalLayout from "@/components/ConditionalLayout";
>>>>>>> 38df0b724fb3d2bd7e182e6009474159e417fad7
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-latin",
  weight: ["400", "500", "600", "700"]
});

const notoJP = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jp",
  weight: ["300", "400", "500", "700"],
  preload: false
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
        <AuthProvider>
<<<<<<< HEAD
          <div className="min-h-screen pb-20">
=======
          <ConditionalLayout>
>>>>>>> 38df0b724fb3d2bd7e182e6009474159e417fad7
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
