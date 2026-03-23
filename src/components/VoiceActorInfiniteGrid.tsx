"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TMDbPerson } from "@/types/tmdb";

function getImageUrl(path: string | null, size = "w342"): string {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

function hasJapaneseName(name: string): boolean {
  return /[\u3040-\u30ff\u4e00-\u9faf]/.test(name);
}

function isJapaneseVoiceActor(p: TMDbPerson): boolean {
  return (
    p.known_for_department === "Acting" &&
    (
      hasJapaneseName(p.name) ||
      p.known_for?.some(
        (k) =>
          (k.origin_country as string[] | undefined)?.includes("JP") ||
          (k.genre_ids as number[] | undefined)?.includes(16)
      ) === true
    )
  );
}

function PersonGridCard({ person }: { person: TMDbPerson }) {
  const knownForTitles = person.known_for
    ?.map((k) => k.name ?? k.title)
    .filter(Boolean)
    .slice(0, 2)
    .join(" / ");

  return (
    <Link href={`/voice-actors/${person.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-sm overflow-hidden bg-gray-900">
        {person.profile_path ? (
          <Image
            src={getImageUrl(person.profile_path, "w342")}
            alt={person.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-gray-800 to-gray-900">
            <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute top-2 right-2 bg-black/70 rounded px-1.5 py-0.5">
          <span className="text-[#54b9c5] text-xs font-bold">★ {person.popularity.toFixed(1)}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-semibold truncate leading-tight">{person.name}</p>
          {knownForTitles && (
            <p className="text-gray-400 text-[11px] mt-0.5 truncate">{knownForTitles}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

interface VoiceActorInfiniteGridProps {
  initialItems: TMDbPerson[];
  initialPage: number;
  totalPages: number;
}

export default function VoiceActorInfiniteGrid({
  initialItems,
  initialPage,
  totalPages,
}: VoiceActorInfiniteGridProps) {
  const [items, setItems] = useState<TMDbPerson[]>(initialItems);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPage < totalPages);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const res = await fetch(`/api/voice-actors?page=${nextPage}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const newItems = (data.results as TMDbPerson[]).filter(isJapaneseVoiceActor);
      setItems((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        return [...prev, ...newItems.filter((p) => !existingIds.has(p.id))];
      });
      setPage(nextPage);
      setHasMore(nextPage < (data.total_pages ?? totalPages));
    } catch (e) {
      console.error("VoiceActorInfiniteGrid load error:", e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, totalPages]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "300px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
        {items.map((person) => (
          <PersonGridCard key={person.id} person={person} />
        ))}
      </div>

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
