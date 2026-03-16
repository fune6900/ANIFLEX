"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { TMDbAnime } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";

interface SearchDropdownProps {
  onClose: () => void;
}

export default function SearchDropdown({ onClose }: SearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDbAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 外側クリックで閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length === 0) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) throw new Error("search failed");
      const data = await res.json();
      setResults((data.results ?? []).slice(0, 8));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  const handleCardClick = (id: number) => {
    router.push(`/anime/${id}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 検索フォーム */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center border border-white bg-black/90 px-3 py-1.5"
      >
        <svg
          className="w-4 h-4 text-white mr-2 shrink-0"
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
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="タイトル、ジャンルで検索"
          autoComplete="off"
          maxLength={100}
          className="bg-transparent text-white text-sm outline-none w-52 md:w-72 placeholder-gray-400"
        />
        {loading && (
          <svg
            className="w-4 h-4 text-gray-400 animate-spin ml-2 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        )}
      </form>

      {/* 候補ドロップダウン */}
      {results.length > 0 && (
        <div className="absolute top-full right-0 mt-1 w-80 md:w-96 bg-[#181818] border border-gray-700 shadow-2xl z-50 max-h-[70vh] overflow-y-auto">
          {results.map((anime) => (
            <button
              key={anime.id}
              onClick={() => handleCardClick(anime.id)}
              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-[#2a2a2a] transition text-left"
            >
              {/* ポスター */}
              <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-800">
                {anime.poster_path ? (
                  <Image
                    src={getImageUrl(anime.poster_path, "w185")}
                    alt={anime.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* テキスト */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {anime.name}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {anime.original_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {anime.first_air_date && (
                    <span className="text-gray-500 text-xs">
                      {anime.first_air_date.split("-")[0]}
                    </span>
                  )}
                  {anime.vote_average > 0 && (
                    <span className="text-green-400 text-xs font-bold">
                      ★ {anime.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* すべての結果を見る */}
          {query.trim() && (
            <button
              onClick={handleSubmit as unknown as React.MouseEventHandler}
              className="w-full px-4 py-3 text-center text-[#54b9c5] text-sm hover:bg-[#2a2a2a] transition border-t border-gray-700"
            >
              「{query}」のすべての結果を見る →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
