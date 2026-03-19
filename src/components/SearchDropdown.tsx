"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { TMDbAnime, TMDbMovie, TMDbPerson } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";

type SearchMode = "anime" | "movie" | "voice-actor";

const RECENT_KEY = "aniflex-recent-searches";
const MAX_RECENT = 5;

interface RecentSearch {
  query: string;
  mode: SearchMode;
}

function getRecentSearches(): RecentSearch[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function addRecentSearch(query: string, mode: SearchMode) {
  try {
    const recent = getRecentSearches().filter(
      (r) => !(r.query === query && r.mode === mode)
    );
    recent.unshift({ query, mode });
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

interface SearchDropdownProps {
  onClose: () => void;
}

export default function SearchDropdown({ onClose }: SearchDropdownProps) {
  const [mode, setMode] = useState<SearchMode>("anime");
  const [query, setQuery] = useState("");
  const [animeResults, setAnimeResults] = useState<TMDbAnime[]>([]);
  const [movieResults, setMovieResults] = useState<TMDbMovie[]>([]);
  const [personResults, setPersonResults] = useState<TMDbPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    if (query.trim()) fetchResults(query, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // 外側クリックで閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const fetchResults = useCallback(async (q: string, currentMode: SearchMode) => {
    if (q.length === 0) {
      setAnimeResults([]);
      setMovieResults([]);
      setPersonResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    setFocusedIndex(-1);
    try {
      const endpoints: Record<SearchMode, string> = {
        anime: `/api/search?q=${encodeURIComponent(q)}`,
        movie: `/api/search/movies?q=${encodeURIComponent(q)}`,
        "voice-actor": `/api/voice-actors?q=${encodeURIComponent(q)}`,
      };
      const res = await fetch(endpoints[currentMode], { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (currentMode === "anime") {
        setAnimeResults((data.results ?? []).slice(0, 8));
        setMovieResults([]);
        setPersonResults([]);
      } else if (currentMode === "movie") {
        setMovieResults((data.results ?? []).slice(0, 8));
        setAnimeResults([]);
        setPersonResults([]);
      } else {
        setPersonResults((data.results ?? []).slice(0, 8));
        setAnimeResults([]);
        setMovieResults([]);
      }
    } catch (err) {
      setAnimeResults([]);
      setMovieResults([]);
      setPersonResults([]);
      setError(err instanceof Error ? err.message : "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setFocusedIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value, mode), 300);
  };

  const currentResults: Array<{ label: string; href: string }> = (() => {
    if (mode === "anime") return animeResults.map((a) => ({ label: a.name, href: `/anime/${a.id}` }));
    if (mode === "movie") return movieResults.map((m) => ({ label: m.title, href: `/movie/${m.id}` }));
    return personResults.map((p) => ({ label: p.name, href: `/voice-actors/${p.id}` }));
  })();

  const navigateToResult = useCallback(
    (href: string, q: string) => {
      addRecentSearch(q, mode);
      router.push(href);
      onClose();
    },
    [mode, router, onClose]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    if (focusedIndex >= 0 && focusedIndex < currentResults.length) {
      navigateToResult(currentResults[focusedIndex].href, q);
      return;
    }

    addRecentSearch(q, mode);
    const paths: Record<SearchMode, string> = {
      anime: `/search?q=${encodeURIComponent(q)}`,
      movie: `/browse/movies`,
      "voice-actor": `/voice-actors?q=${encodeURIComponent(q)}`,
    };
    router.push(paths[mode]);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (!hasResults) return;
    const total = currentResults.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, total - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, -1));
    }
  };

  const hasResults =
    animeResults.length > 0 || movieResults.length > 0 || personResults.length > 0;
  const showRecent = !query && recentSearches.length > 0;

  const TABS: { key: SearchMode; label: string; color: string }[] = [
    { key: "anime", label: "📺 アニメ", color: "border-[#E50914]" },
    { key: "movie", label: "🎬 映画", color: "border-yellow-400" },
    { key: "voice-actor", label: "🎤 声優", color: "border-[#54b9c5]" },
  ];

  return (
    <div ref={containerRef} className="relative">
      {/* タブ */}
      <div className="flex border-b border-gray-700 bg-black/90">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setMode(tab.key)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
              mode === tab.key
                ? `text-white border-b-2 ${tab.color}`
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 検索フォーム */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center border-b border-gray-700 bg-black/90 px-3 py-1.5"
      >
        <svg className="w-4 h-4 text-white mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "anime" ? "タイトル、ジャンルで検索" :
            mode === "movie" ? "映画タイトルで検索" :
            "声優・俳優名で検索（例: 花江夏樹）"
          }
          autoComplete="off"
          maxLength={100}
          className="bg-transparent text-white text-sm outline-none w-52 md:w-72 placeholder-gray-400"
        />
        {loading && (
          <svg className="w-4 h-4 text-gray-400 animate-spin ml-2 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
      </form>

      {/* エラー */}
      {error && query && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-[#181818] border border-red-800 px-4 py-3 z-50">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* 最近の検索 */}
      {showRecent && !error && (
        <div className="absolute top-full right-0 mt-1 w-80 md:w-96 bg-[#181818] border border-gray-700 shadow-2xl z-50">
          <p className="text-gray-500 text-[11px] font-semibold px-4 pt-3 pb-1 uppercase tracking-wider">最近の検索</p>
          {recentSearches.map((r, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMode(r.mode);
                setQuery(r.query);
                fetchResults(r.query, r.mode);
              }}
              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-[#2a2a2a] transition text-left"
            >
              <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-300 text-sm truncate">{r.query}</span>
              <span className="text-gray-600 text-[10px] ml-auto shrink-0">
                {r.mode === "anime" ? "📺" : r.mode === "movie" ? "🎬" : "🎤"}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 候補ドロップダウン */}
      {hasResults && !error && (
        <div className="absolute top-full right-0 mt-1 w-80 md:w-96 bg-[#181818] border border-gray-700 shadow-2xl z-50 max-h-[70vh] overflow-y-auto">

          {/* アニメ検索結果 */}
          {mode === "anime" && animeResults.map((anime, idx) => (
            <button
              key={anime.id}
              onClick={() => navigateToResult(`/anime/${anime.id}`, query)}
              className={`flex items-center gap-3 w-full px-3 py-2 transition text-left ${
                idx === focusedIndex ? "bg-[#3a3a3a]" : "hover:bg-[#2a2a2a]"
              }`}
            >
              <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-800">
                {anime.poster_path ? (
                  <Image src={getImageUrl(anime.poster_path, "w185")} alt={anime.name} fill sizes="48px" className="object-cover" />
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
                    <span className="text-gray-500 text-xs">{anime.first_air_date.split("-")[0]}</span>
                  )}
                  {anime.vote_average > 0 && (
                    <span className="text-green-400 text-xs font-bold">★ {anime.vote_average.toFixed(1)}</span>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* 映画検索結果 */}
          {mode === "movie" && movieResults.map((movie, idx) => (
            <button
              key={movie.id}
              onClick={() => navigateToResult(`/movie/${movie.id}`, query)}
              className={`flex items-center gap-3 w-full px-3 py-2 transition text-left ${
                idx === focusedIndex ? "bg-[#3a3a3a]" : "hover:bg-[#2a2a2a]"
              }`}
            >
              <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-800">
                {movie.poster_path ? (
                  <Image src={getImageUrl(movie.poster_path, "w185")} alt={movie.title} fill sizes="48px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{movie.title}</p>
                <p className="text-gray-400 text-xs truncate">{movie.original_title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {movie.release_date && (
                    <span className="text-gray-500 text-xs">{movie.release_date.split("-")[0]}</span>
                  )}
                  {movie.vote_average > 0 && (
                    <span className="text-green-400 text-xs font-bold">★ {movie.vote_average.toFixed(1)}</span>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* 声優検索結果 */}
          {mode === "voice-actor" && personResults.map((person, idx) => {
            const knownFor = person.known_for
              ?.map((k) => k.name ?? k.title)
              .filter(Boolean)
              .slice(0, 2)
              .join(" / ");
            return (
              <button
                key={person.id}
                onClick={() => navigateToResult(`/voice-actors/${person.id}`, query)}
                className={`flex items-center gap-3 w-full px-3 py-2 transition text-left ${
                  idx === focusedIndex ? "bg-[#3a3a3a]" : "hover:bg-[#2a2a2a]"
                }`}
              >
                <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-800">
                  {person.profile_path ? (
                    <Image src={getImageUrl(person.profile_path, "w185")} alt={person.name} fill sizes="48px" className="object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </div>
                  )}
                </div>
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
                addRecentSearch(query.trim(), mode);
                const paths: Record<SearchMode, string> = {
                  anime: `/search?q=${encodeURIComponent(query.trim())}`,
                  movie: `/browse/movies`,
                  "voice-actor": `/voice-actors?q=${encodeURIComponent(query.trim())}`,
                };
                router.push(paths[mode]);
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
