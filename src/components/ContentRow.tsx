"use client";

import { useRef, useState } from "react";

interface Anime {
  id: number;
  title: string;
  year: string;
  rating: string;
  match: number;
  gradient: string;
  label?: string;
}

interface ContentRowProps {
  title: string;
  items: Anime[];
}

function AnimeCard({ item }: { item: Anime }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex-shrink-0 w-[140px] sm:w-[170px] md:w-[200px] lg:w-[230px] cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* サムネイル */}
      <div
        className={`relative rounded-sm overflow-hidden transition-all duration-200 ${
          hovered ? "scale-105 md:scale-110 z-10 shadow-2xl" : ""
        }`}
      >
        {/* ポスタービジュアル */}
        <div
          className="w-full aspect-[2/3] md:aspect-video"
          style={{ background: item.gradient }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-3">
            {item.label && (
              <span className="bg-[#E50914] text-white text-[10px] font-bold px-1.5 py-0.5 mb-2 tracking-widest">
                {item.label}
              </span>
            )}
            <span className="text-white font-black text-sm md:text-base text-center leading-tight drop-shadow-lg">
              {item.title}
            </span>
          </div>
        </div>

        {/* ホバー時の詳細パネル */}
        {hovered && (
          <div className="hidden md:block absolute top-full left-0 right-0 bg-[#181818] rounded-b-md p-3 shadow-2xl z-20 border-t-0">
            {/* ボタン群 */}
            <div className="flex items-center gap-2 mb-2">
              <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition">
                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <button className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
              <button className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition text-white ml-auto">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* メタ情報 */}
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="text-green-400 font-bold">{item.match}%一致</span>
              <span className="border border-gray-500 text-gray-400 px-1">{item.rating}</span>
              <span className="text-gray-400">{item.year}</span>
            </div>

            {/* ジャンルタグ */}
            <div className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
              <span>アクション</span>
              <span className="w-1 h-1 rounded-full bg-gray-500 inline-block" />
              <span>ファンタジー</span>
              <span className="w-1 h-1 rounded-full bg-gray-500 inline-block" />
              <span>アドベンチャー</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContentRow({ title, items }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!rowRef.current) return;
    setShowLeftArrow(rowRef.current.scrollLeft > 0);
    setShowRightArrow(
      rowRef.current.scrollLeft + rowRef.current.clientWidth < rowRef.current.scrollWidth - 10
    );
  };

  return (
    <div className="relative group/row mb-6 md:mb-8">
      {/* タイトル */}
      <h2 className="text-white font-bold text-base md:text-lg mb-2 md:mb-3 px-4 md:px-12 flex items-center gap-2">
        {title}
        <span className="text-[#54b9c5] text-sm font-semibold opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer">
          すべて見る
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </h2>

      {/* スクロールコンテナ */}
      <div className="relative">
        {/* 左矢印 */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-10 items-center justify-center bg-black/50 hover:bg-black/70 transition text-white opacity-0 group-hover/row:opacity-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* カードリスト */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-1 md:gap-2 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item) => (
            <AnimeCard key={item.id} item={item} />
          ))}
        </div>

        {/* 右矢印 */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-10 items-center justify-center bg-black/50 hover:bg-black/70 transition text-white opacity-0 group-hover/row:opacity-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
