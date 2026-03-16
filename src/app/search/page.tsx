import Image from "next/image";
import Link from "next/link";
import { searchAnime } from "@/lib/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import type { TMDbAnime } from "@/types/tmdb";

// 入力サニタイズ（サーバーサイド）
function sanitize(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`]/g, "")
    .trim()
    .slice(0, 100);
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

function AnimeGridCard({ anime }: { anime: TMDbAnime }) {
  const year = anime.first_air_date?.split("-")[0];
  const match = Math.round(anime.vote_average * 10);

  return (
    <Link href={`/anime/${anime.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-sm overflow-hidden bg-gray-900">
        {anime.poster_path ? (
          <Image
            src={getImageUrl(anime.poster_path, "w342")}
            alt={anime.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="text-white text-sm font-bold text-center leading-tight">
              {anime.name}
            </span>
          </div>
        )}

        {/* ホバーオーバーレイ */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 pointer-events-none" />

        {/* 下グラデーション */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 to-transparent" />

        {/* スコア */}
        {match > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 rounded px-1.5 py-0.5">
            <span className="text-green-400 text-xs font-bold">★ {anime.vote_average.toFixed(1)}</span>
          </div>
        )}

        {/* タイトル・年 */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-semibold truncate leading-tight">
            {anime.name}
          </p>
          {year && (
            <p className="text-gray-400 text-[11px] mt-0.5">{year}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = params.q ?? "";
  const query = sanitize(rawQuery);

  let results: TMDbAnime[] = [];
  let totalResults = 0;
  let error: string | null = null;

  if (query) {
    try {
      const data = await searchAnime(query);
      results = data.results;
      totalResults = data.total_results;
    } catch {
      error = "検索中にエラーが発生しました";
    }
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-20 px-4 md:px-12">
      {/* ヘッダー */}
      <div className="mb-8">
        {query ? (
          <>
            <p className="text-gray-400 text-sm mb-1">
              「{query}」の検索結果
            </p>
            <h1 className="text-white text-2xl font-bold">
              {totalResults > 0
                ? `${totalResults.toLocaleString()}件のアニメが見つかりました`
                : "該当するアニメが見つかりませんでした"}
            </h1>
          </>
        ) : (
          <h1 className="text-white text-2xl font-bold">アニメを検索</h1>
        )}
      </div>

      {/* エラー */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      {/* 検索フォーム */}
      <form method="GET" className="mb-10 max-w-xl">
        <div className="flex items-center border border-gray-600 bg-[#1a1a1a] rounded overflow-hidden focus-within:border-white transition-colors">
          <svg
            className="w-5 h-5 text-gray-400 ml-4 shrink-0"
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
            type="search"
            name="q"
            defaultValue={query}
            placeholder="タイトル、ジャンルで検索"
            maxLength={100}
            autoComplete="off"
            className="flex-1 bg-transparent text-white px-4 py-3 text-sm outline-none placeholder-gray-500"
          />
          <button
            type="submit"
            className="bg-[#E50914] text-white px-5 py-3 text-sm font-semibold hover:bg-red-700 transition"
          >
            検索
          </button>
        </div>
      </form>

      {/* 結果グリッド */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {results.map((anime) => (
            <AnimeGridCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}

      {/* 結果なし */}
      {query && results.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-2">
            「{query}」に一致するアニメは見つかりませんでした
          </p>
          <p className="text-gray-600 text-sm">
            別のキーワードで試してみてください
          </p>
        </div>
      )}

      {/* 初期表示 */}
      {!query && (
        <div className="text-center py-20">
          <svg
            className="w-16 h-16 text-gray-700 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-400">上のフォームにキーワードを入力して検索してください</p>
        </div>
      )}
    </div>
  );
}
