"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SearchDropdown from "@/components/SearchDropdown";
import { ANIME_GENRES } from "@/lib/genres";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#141414]"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        {/* ロゴ */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/">
            <span className="text-[#E50914] font-extrabold text-2xl md:text-3xl tracking-widest select-none cursor-pointer">
              ANIFLEX
            </span>
          </Link>

          {/* デスクトップナビ */}
          <nav className="hidden md:flex items-center gap-5 text-sm text-gray-300">
            <Link href="/" className="text-white font-semibold hover:text-gray-300 transition">
              ホーム
            </Link>
            <Link href="/search?q=アニメ" className="hover:text-white transition">
              アニメ
            </Link>
            {/* ジャンルドロップダウン */}
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-white transition py-1">
                ジャンル
                <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {/* ホバーで表示されるパネル */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-[#141414] border border-gray-700 shadow-2xl rounded-sm py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#141414] border-l border-t border-gray-700 rotate-45" />
                <div className="grid grid-cols-2 gap-0.5 px-2">
                  {ANIME_GENRES.map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/browse/genre/${genre.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded transition text-xs"
                    >
                      <span className="text-base leading-none">{genre.emoji}</span>
                      <span className="truncate">{genre.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/voice-actors" className="hover:text-white transition">
              声優
            </Link>
          </nav>

          {/* モバイルハンバーガー */}
          <div className="md:hidden relative">
            <button
              className="flex items-center gap-1 text-sm text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ブラウズ
              <svg
                className={`w-4 h-4 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute top-8 left-0 bg-[#141414] border border-gray-600 shadow-xl w-52 py-2 z-50">
                <div className="absolute -top-2 left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-600" />
                <Link
                  href="/"
                  className="block px-5 py-2 text-sm text-gray-200 hover:text-white hover:underline"
                  onClick={() => setMenuOpen(false)}
                >
                  ホーム
                </Link>
                <Link
                  href="/search?q=アニメ"
                  className="block px-5 py-2 text-sm text-gray-200 hover:text-white hover:underline"
                  onClick={() => setMenuOpen(false)}
                >
                  アニメ
                </Link>
                {/* ジャンル折りたたみ */}
                <button
                  className="w-full flex items-center justify-between px-5 py-2 text-sm text-gray-200 hover:text-white"
                  onClick={() => setGenreMenuOpen(!genreMenuOpen)}
                >
                  ジャンル
                  <svg className={`w-3.5 h-3.5 transition-transform ${genreMenuOpen ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {genreMenuOpen && (
                  <div className="border-t border-gray-700 pt-1 pb-1">
                    {ANIME_GENRES.map((genre) => (
                      <Link
                        key={genre.id}
                        href={`/browse/genre/${genre.id}`}
                        className="flex items-center gap-2 px-7 py-1.5 text-xs text-gray-400 hover:text-white hover:underline"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>{genre.emoji}</span>
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  href="/voice-actors"
                  className="block px-5 py-2 text-sm text-gray-200 hover:text-white hover:underline"
                  onClick={() => setMenuOpen(false)}
                >
                  声優
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 右側アイコン */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* 検索 */}
          <div className="flex items-center">
            {searchOpen ? (
              <SearchDropdown onClose={() => setSearchOpen(false)} />
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="text-white hover:text-gray-300 transition"
                aria-label="検索を開く"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* 通知 */}
          <button
            className="hidden md:block text-white hover:text-gray-300 transition"
            aria-label="通知"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {/* プロフィール */}
          <div className="flex items-center gap-1 cursor-pointer group">
            <div className="w-8 h-8 rounded bg-[#E50914] flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <svg
              className="w-4 h-4 text-white transition-transform group-hover:rotate-180"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
