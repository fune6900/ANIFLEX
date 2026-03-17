"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export interface HeroItem {
  id: number;
  title: string;
  overview: string;
  backdropPath: string | null;
  year?: string;
  match?: number;
  href: string;
}

interface HeroSectionProps {
  items: HeroItem[];
}

export default function HeroSection({ items }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, items.length]);

  if (items.length === 0) return null;

  const item = items[current];

  return (
    <section className="relative w-full h-[56.25vw] max-h-[85vh] min-h-[400px] overflow-hidden">
      {/* 背景: 全スライドを重ねて opacity でクロスフェード */}
      {items.map((it, i) =>
        it.backdropPath ? (
          <div
            key={it.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={`https://image.tmdb.org/t/p/original${it.backdropPath}`}
              alt={it.title}
              fill
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ) : (
          <div
            key={it.id}
            className={`absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(ellipse at 20% 50%, #7c3aed 0%, transparent 50%),
                                  radial-gradient(ellipse at 80% 20%, #1e40af 0%, transparent 50%),
                                  radial-gradient(ellipse at 60% 80%, #be185d 0%, transparent 40%)`,
              }}
            />
            <div className="absolute top-1/4 right-8 md:right-24 text-white/5 text-[120px] md:text-[200px] font-black leading-none select-none pointer-events-none">
              ANIME
            </div>
          </div>
        )
      )}

      {/* 左フェードオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
      {/* 下フェードオーバーレイ */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#141414] to-transparent" />

      {/* コンテンツ（スライドごとに再レンダリングしてアニメーション） */}
      <div
        key={current}
        className="absolute bottom-[20%] md:bottom-[30%] left-4 md:left-16 max-w-xs sm:max-w-md md:max-w-xl animate-fade-in"
      >
        {/* バッジ */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#E50914] text-white text-xs font-bold px-2 py-0.5 tracking-widest">
            ANIFLEX
          </span>
          {item.year && (
            <span className="text-gray-300 text-xs">{item.year}</span>
          )}
        </div>

        {/* タイトル */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-xl mb-3">
          {item.title}
        </h1>

        {/* スコア */}
        <div className="flex items-center gap-3 mb-3">
          {item.match !== undefined && (
            <span className="text-green-400 font-bold text-sm">
              {item.match}%一致
            </span>
          )}
          <span className="border border-gray-500 text-gray-400 text-xs px-1.5 py-0.5">
            HD
          </span>
        </div>

        {/* あらすじ */}
        {item.overview && (
          <p className="hidden sm:block text-gray-200 text-sm md:text-base leading-relaxed line-clamp-3 mb-5 drop-shadow">
            {item.overview}
          </p>
        )}

        {/* ボタン */}
        <div className="flex items-center gap-3">
          <Link
            href={item.href}
            className="flex items-center gap-2 bg-white text-black font-bold px-5 md:px-8 py-2 md:py-3 rounded text-sm md:text-base hover:bg-white/80 transition-colors"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            再生
          </Link>
          <Link
            href={item.href}
            className="flex items-center gap-2 bg-gray-500/60 text-white font-bold px-5 md:px-8 py-2 md:py-3 rounded text-sm md:text-base hover:bg-gray-500/40 transition-colors backdrop-blur-sm"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="hidden sm:inline">詳細情報</span>
          </Link>
        </div>
      </div>

      {/* ミュートボタン */}
      <button
        onClick={() => setMuted(!muted)}
        className="absolute bottom-[22%] right-4 md:right-16 w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-gray-400 text-gray-300 flex items-center justify-center hover:border-white hover:text-white transition"
      >
        {muted ? (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0-12L8 9H5a1 1 0 00-1 1v4a1 1 0 001 1h3l4 3"
            />
          </svg>
        )}
      </button>

      {/* スライドドット */}
      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-white w-6"
                  : "bg-white/40 hover:bg-white/70 w-2"
              }`}
            />
          ))}
        </div>
      )}

      {/* 左右の矢印 */}
      {items.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrent((c) => (c - 1 + items.length) % items.length)
            }
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition opacity-0 hover:opacity-100 focus:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition opacity-0 hover:opacity-100 focus:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}
