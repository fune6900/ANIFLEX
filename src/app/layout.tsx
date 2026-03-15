import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANIFLEX - アニメ・声優検索",
  description: "TMDb APIを使ったアニメと声優の検索アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <header className="bg-gray-900 text-white px-6 py-4 shadow-md">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold tracking-wide">
              🎌 ANIFLEX
            </h1>
            <p className="text-sm text-gray-400 mt-1">アニメ・声優検索アプリ</p>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
