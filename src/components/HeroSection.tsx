"use client";

import { useState } from "react";

export default function HeroSection() {
  const [muted, setMuted] = useState(true);

  return (
    <section className="relative w-full h-[56.25vw] max-h-[85vh] min-h-[400px] overflow-hidden">
      {/* 背景グラデーション（疑似ビジュアル） */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
        {/* アニメ風装飾 */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(ellipse at 20% 50%, #7c3aed 0%, transparent 50%),
                              radial-gradient(ellipse at 80% 20%, #1e40af 0%, transparent 50%),
                              radial-gradient(ellipse at 60% 80%, #be185d 0%, transparent 40%)`,
          }}
        />
        {/* 日本語タイポグラフィ装飾 */}
        <div className="absolute top-1/4 right-8 md:right-24 text-white/5 text-[120px] md:text-[200px] font-black leading-none select-none pointer-events-none">
          ANIME
        </div>
      </div>

      {/* 左フェードオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
      {/* 下フェードオーバーレイ */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#141414] to-transparent" />

      {/* コンテンツ */}
      <div className="absolute bottom-[20%] md:bottom-[30%] left-4 md:left-16 max-w-xs sm:max-w-md md:max-w-xl">
        {/* バッジ */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#E50914] text-white text-xs font-bold px-2 py-0.5 tracking-widest">
            ANIFLEX オリジナル
          </span>
          <span className="text-gray-300 text-xs">第1話 配信中</span>
        </div>

        {/* タイトル */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-xl mb-3">
          進撃の巨人
          <br />
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-200">
            The Final Season
          </span>
        </h1>

        {/* スコア */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-green-400 font-bold text-sm">97%一致</span>
          <span className="border border-gray-400 text-gray-300 text-xs px-1">PG-12</span>
          <span className="text-gray-300 text-sm">2023</span>
          <span className="border border-gray-500 text-gray-400 text-xs px-1.5 py-0.5">HD</span>
        </div>

        {/* あらすじ */}
        <p className="hidden sm:block text-gray-200 text-sm md:text-base leading-relaxed line-clamp-3 mb-5 drop-shadow">
          壁の外の世界へ踏み出したエレンたちが直面する、壮大な真実と選択。人類の命運をかけた最終決戦が幕を開ける。
        </p>

        {/* ボタン */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white text-black font-bold px-5 md:px-8 py-2 md:py-3 rounded text-sm md:text-base hover:bg-white/80 transition-colors">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            再生
          </button>
          <button className="flex items-center gap-2 bg-gray-500/60 text-white font-bold px-5 md:px-8 py-2 md:py-3 rounded text-sm md:text-base hover:bg-gray-500/40 transition-colors backdrop-blur-sm">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">詳細情報</span>
          </button>
        </div>
      </div>

      {/* ミュートボタン */}
      <button
        onClick={() => setMuted(!muted)}
        className="absolute bottom-[22%] right-4 md:right-16 w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-gray-400 text-gray-300 flex items-center justify-center hover:border-white hover:text-white transition"
      >
        {muted ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0-12L8 9H5a1 1 0 00-1 1v4a1 1 0 001 1h3l4 3" />
          </svg>
        )}
      </button>

      {/* 年齢レーティング */}
      <div className="absolute bottom-[22%] right-16 md:right-28 bg-gray-800/80 border-l-4 border-gray-400 text-white text-xs md:text-sm px-3 py-1 font-semibold">
        PG-12
      </div>
    </section>
  );
}
