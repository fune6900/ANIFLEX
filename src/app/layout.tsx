import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ANIFLEX - アニメ・声優検索",
  description: "TMDb APIを使ったアニメと声優の検索アプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ANIFLEX",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-[#141414] text-white overflow-x-hidden">
        <Navbar />
        <main>{children}</main>
        {/* フッター */}
        <footer className="px-4 md:px-16 py-10 text-gray-500 text-xs">
          <div className="max-w-4xl">
            <div className="flex gap-5 mb-4 flex-wrap">
              {["音声説明", "ヘルプセンター", "ギフトカード", "メディアセンター", "投資家向け情報", "採用情報", "利用規約", "プライバシー", "法的事項", "Cookie設定", "会社概要", "お問い合わせ"].map((item) => (
                <a key={item} href="#" className="hover:underline">{item}</a>
              ))}
            </div>
            <button className="border border-gray-500 text-gray-400 px-4 py-2 text-sm hover:text-white hover:border-white transition mb-4">
              サービスコード
            </button>
            <p>© 2025 ANIFLEX. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
