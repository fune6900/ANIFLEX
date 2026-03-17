"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

export interface ContentRowItem {
  id: number;
  title: string;
  year?: string;
  rating?: string;
  match?: number;
  gradient?: string;
  label?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  overview?: string;
  genres?: string[];
  href?: string;
  isPortrait?: boolean; // 声優など縦長ポスター用
}

interface ContentRowProps {
  title: string;
  items: ContentRowItem[];
  allHref?: string;
}

function AnimeCard({ item }: { item: ContentRowItem }) {
  const [hovered, setHovered] = useState(false);

  const cardInner = (
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
          className="w-full aspect-[2/3] md:aspect-video relative overflow-hidden"
          style={
            !item.posterPath && !item.backdropPath
              ? { background: item.gradient ?? "linear-gradient(135deg,#1a1a2e,#16213e)" }
              : undefined
          }
        >
          {/* TMDb画像 */}
          {(item.backdropPath || item.posterPath) ? (
            <Image
              src={`https://image.tmdb.org/t/p/${item.backdropPath ? "w500" : "w342"}${item.backdropPath ?? item.posterPath}`}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 140px, (max-width: 768px) 170px, (max-width: 1024px) 200px, 230px"
              className="object-cover"
              loading="lazy"
            />
          ) : (
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
          )}

          {/* 画像上のラベルオーバーレイ */}
          {(item.posterPath || item.backdropPath) && item.label && (
            <div className="absolute top-1 left-1">
              <span className="bg-[#E50914] text-white text-[9px] font-bold px-1 py-0.5 tracking-widest">
                {item.label}
              </span>
            </div>
          )}

          {/* 画像がある場合の下グラデーション */}
          {(item.posterPath || item.backdropPath) && (
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
          )}
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
              <button className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition text-white ml-auto">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* メタ情報 */}
            <div className="flex items-center gap-2 text-xs mb-1">
              {item.match != null && item.match > 0 && (
                <span className="text-green-400 font-bold">{item.match}%一致</span>
              )}
              {item.rating && (
                <span className="border border-gray-500 text-gray-400 px-1">{item.rating}</span>
              )}
              {item.year && <span className="text-gray-400">{item.year}</span>}
            </div>

            {/* タイトル（画像があるカードのみ） */}
            {(item.posterPath || item.backdropPath) && (
              <p className="text-white text-xs font-semibold truncate mb-1">{item.title}</p>
            )}

            {/* あらすじ */}
            {item.overview && (
              <p className="text-xs text-gray-300 line-clamp-2 mt-1 leading-relaxed">
                {item.overview}
              </p>
            )}

            {/* ジャンルタグ */}
            {!item.overview && (
              <div className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
                {item.genres && item.genres.length > 0 ? (
                  item.genres.slice(0, 3).map((g, i) => (
                    <span key={g}>
                      {i > 0 && <span className="w-1 h-1 rounded-full bg-gray-500 inline-block mr-1" />}
                      {g}
                    </span>
                  ))
                ) : (
                  <>
                    <span>アクション</span>
                    <span className="w-1 h-1 rounded-full bg-gray-500 inline-block" />
                    <span>ファンタジー</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (item.href) {
    return <Link href={item.href}>{cardInner}</Link>;
  }
  return cardInner;
}

export default function ContentRow({ title, items, allHref }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (!rowRef.current) return;
    setShowLeftArrow(rowRef.current.scrollLeft > 0);
    setShowRightArrow(
      rowRef.current.scrollLeft + rowRef.current.clientWidth <
        rowRef.current.scrollWidth - 10
    );
  };

  return (
    <div className="relative group/row mb-6 md:mb-8">
      {/* タイトル */}
      <h2 className="text-white font-bold text-base md:text-lg mb-2 md:mb-3 px-4 md:px-12 flex items-center gap-2">
        {title}
        {allHref && (
          <Link
            href={allHref}
            className="text-[#54b9c5] text-sm font-semibold opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-1"
          >
            すべて見る
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
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
