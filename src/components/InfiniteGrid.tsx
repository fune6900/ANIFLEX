"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NormalizedGridItem } from "@/app/api/browse/route";

interface InfiniteGridProps {
  initialItems: NormalizedGridItem[];
  initialPage: number;
  totalPages: number;
  fetchUrl: string; // ベースURL。?page=N が追記される
}

function GridCard({ item }: { item: NormalizedGridItem }) {
  return (
    <Link href={item.href} className="group block">
      <div className="relative aspect-[2/3] rounded-sm overflow-hidden bg-gray-900">
        {item.posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3 bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="text-gray-400 text-xs text-center font-semibold leading-tight">
              {item.title}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 to-transparent" />
        {item.score > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-black/70 rounded px-1.5 py-0.5">
            <span className="text-green-400 text-[11px] font-bold">★ {item.score.toFixed(1)}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-semibold truncate leading-tight">{item.title}</p>
          {item.year && <p className="text-gray-400 text-[11px]">{item.year}年</p>}
        </div>
      </div>
    </Link>
  );
}

export default function InfiniteGrid({
  initialItems,
  initialPage,
  totalPages,
  fetchUrl,
}: InfiniteGridProps) {
  const [items, setItems] = useState<NormalizedGridItem[]>(initialItems);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPage < totalPages);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const separator = fetchUrl.includes("?") ? "&" : "?";
      const res = await fetch(`${fetchUrl}${separator}page=${nextPage}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setItems((prev) => {
        // 重複排除
        const existingIds = new Set(prev.map((i) => i.id));
        const newItems = (data.items as NormalizedGridItem[]).filter(
          (i) => !existingIds.has(i.id)
        );
        return [...prev, ...newItems];
      });
      setPage(nextPage);
      setHasMore(nextPage < data.totalPages);
    } catch (e) {
      console.error("InfiniteGrid load error:", e);
    } finally {
      setLoading(false);
    }
  }, [fetchUrl, loading, hasMore, page]);

  // Intersection Observer でセンチネルを監視
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div>
      <div className="max-w-[1920px] mx-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 3xl:grid-cols-9 gap-3 md:gap-4 xl:gap-5">
        {items.map((item) => (
          <GridCard key={`${item.id}-${item.href}`} item={item} />
        ))}
      </div>

      {/* センチネル（ローディングトリガー） */}
      <div ref={sentinelRef} className="mt-10 flex justify-center">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            読み込み中…
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-gray-600 text-sm py-6">— 全 {items.length} 件表示済み —</p>
        )}
      </div>
    </div>
  );
}
