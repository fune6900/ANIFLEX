"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { TMDbAnime, TMDbPerson } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";

type SearchMode = "anime" | "voice-actor";

interface SearchDropdownProps {
  onClose: () => void;
}

export default function SearchDropdown({ onClose }: SearchDropdownProps) {
  const [mode, setMode] = useState<SearchMode>("anime");
  const [query, setQuery] = useState("");
  const [animeResults, setAnimeResults] = useState<TMDbAnime[]>([]);
  const [personResults, setPersonResults] = useState<TMDbPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // モード切替時に検索し直す
  useEffect(() => {
    if (query.trim()) {
      fetchResults(query, mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

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

  const fetchResults = useCallback(async (q: string, currentMode: SearchMode) => {
    if (q.length === 0) {
      setAnimeResults([]);
      setPersonResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        currentMode === "anime"
          ? `/api/search?q=${encodeURIComponent(q)}`
          : `/api/voice-actors?q=${encodeURIComponent(q)}`;

      const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (currentMode === "anime") {
        setAnimeResults((data.results ?? []).slice(0, 8));
        setPersonResults([]);
      } else {
        setPersonResults((data.results ?? []).slice(0, 8));
        setAnimeResults([]);
      }
    } catch (err) {
      setAnimeResults([]);
      setPersonResults([]);
      setError(err instanceof Error ? err.message : "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value, mode), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const path =
      mode === "anime"
        ? `/search?q=${encodeURIComponent(query.trim())}`
        : `/voice-actors?q=${encodeURIComponent(query.trim())}`;
    router.push(path);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  const placeholder =
    mode === "anime"
      ? "タイトル、ジャンルで検索"
      : "声優・俳優名で検索（例: 花江夏樹）";

  const hasResults =
    mode === "anime" ? animeResults.length > 0 : personResults.length > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* タブ（検索バー内上部） */}
      <div className="flex border-b border-gray-700 bg-black/90">
        <button
          type="button"
          onClick={() => setMode("anime")}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            mode === "anime"
              ? "text-white border-b-2 border-[#E50914]"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          アニメ
        </button>
        <button
          type="button"
          onClick={() => setMode("voice-actor")}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            mode === "voice-actor"
              ? "text-white border-b-2 border-[#54b9c5]"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          🎤 声優
        </button>
      </div>

      {/* 検索フォーム */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center border-b border-gray-700 bg-black/90 px-3 py-1.5"
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
          placeholder={placeholder}
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

      {/* エラー表示 */}
      {error && query && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-[#181818] border border-red-800 px-4 py-3 z-50">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* 候補ドロップダウン */}
      {hasResults && !error && (
        <div className="absolute top-full right-0 mt-1 w-80 md:w-96 bg-[#181818] border border-gray-700 shadow-2xl z-50 max-h-[70vh] overflow-y-auto">

          {/* アニメ検索結果 */}
          {mode === "anime" &&
            animeResults.map((anime) => (
              <button
                key={anime.id}
                onClick={() => {
                  router.push(`/anime/${anime.id}`);
                  onClose();
                }}
                className="flex items-center gap-3 w-full px-3 py-2 hover:bg-[#2a2a2a] transition text-left"
              >
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
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{anime.name}</p>
                  <p className="text-gray-400 text-xs truncate">{anime.original_name}</p>
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

          {/* 声優検索結果 */}
          {mode === "voice-actor" &&
            personResults.map((person) => {
              const knownFor = person.known_for
                ?.map((k) => k.name ?? k.title)
                .filter(Boolean)
                .slice(0, 2)
                .join(" / ");
              return (
                <button
                  key={person.id}
                  onClick={() => {
                    router.push(`/voice-actors/${person.id}`);
                    onClose();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 hover:bg-[#2a2a2a] transition text-left"
                >
                  {/* プロフィール写真 */}
                  <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-800">
                    {person.profile_path ? (
                      <Image
                        src={getImageUrl(person.profile_path, "w185")}
                        alt={person.name}
                        fill
                        sizes="48px"
                        className="object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* テキスト */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{person.name}</p>
                    <p className="text-gray-400 text-xs truncate">{person.original_name}</p>
                    {knownFor && (
                      <p className="text-[#54b9c5] text-xs truncate mt-0.5">{knownFor}</p>
                    )}
                  </div>
                  <span className="text-gray-600 text-[10px] shrink-0">🎤</span>
                </button>
              );
            })}

          {/* すべての結果を見る */}
          {query.trim() && (
            <button
              onClick={() => {
                const path =
                  mode === "anime"
                    ? `/search?q=${encodeURIComponent(query.trim())}`
                    : `/voice-actors?q=${encodeURIComponent(query.trim())}`;
                router.push(path);
                onClose();
              }}
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
