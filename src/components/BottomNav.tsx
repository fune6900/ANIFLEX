"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getRecentSeasons } from "@/lib/seasons";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const currentSeason = getRecentSeasons(1)[0];

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#141414]/95 backdrop-blur-sm border-t border-gray-800 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {/* 戻る */}
        <button
          onClick={() => router.back()}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-gray-400 hover:text-white transition min-w-[48px]"
          aria-label="戻る"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-[10px]">戻る</span>
        </button>

        {/* ホーム */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 px-2 py-1.5 transition min-w-[48px] ${
            pathname === "/" ? "text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5" fill={pathname === "/" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px]">ホーム</span>
        </Link>

        {/* 検索 */}
        <Link
          href="/search"
          className={`flex flex-col items-center gap-0.5 px-2 py-1.5 transition min-w-[48px] ${
            isActive("/search") ? "text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px]">検索</span>
        </Link>

        {/* 映画 */}
        <Link
          href="/browse/movies"
          className={`flex flex-col items-center gap-0.5 px-2 py-1.5 transition min-w-[48px] ${
            isActive("/browse/movies") ? "text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          <span className="text-[10px]">映画</span>
        </Link>

        {/* シーズン */}
        <Link
          href={currentSeason.href}
          className={`flex flex-col items-center gap-0.5 px-2 py-1.5 transition min-w-[48px] ${
            isActive("/browse/season") ? "text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px]">シーズン</span>
        </Link>

        {/* 声優 */}
        <Link
          href="/voice-actors"
          className={`flex flex-col items-center gap-0.5 px-2 py-1.5 transition min-w-[48px] ${
            isActive("/voice-actors") ? "text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px]">声優</span>
        </Link>
      </div>
    </nav>
  );
}
