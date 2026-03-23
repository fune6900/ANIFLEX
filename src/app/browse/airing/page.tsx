import Image from "next/image";
import Link from "next/link";
import { getAnimeBySeason, getImageUrl } from "@/lib/tmdb";
import { getRecentSeasons } from "@/lib/seasons";
import type { TMDbAnime } from "@/types/tmdb";

interface AiringPageProps {
  searchParams: Promise<{ page?: string }>;
}

function AnimeCard({ anime }: { anime: TMDbAnime }) {
  const year = anime.first_air_date?.split("-")[0];
  const month = anime.first_air_date?.split("-")[1];
  const score = anime.vote_average?.toFixed(1);

  return (
    <Link href={`/anime/${anime.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-sm overflow-hidden bg-gray-900">
        {anime.poster_path ? (
          <Image
            src={getImageUrl(anime.poster_path, "w342")}
            alt={anime.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3 bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="text-gray-400 text-xs text-center font-semibold">{anime.name}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 to-transparent" />
        {/* 放送中バッジ */}
        <div className="absolute top-1.5 left-1.5 bg-red-600 rounded-full px-2 py-0.5">
          <span className="text-white text-[9px] font-bold tracking-wider">ON AIR</span>
        </div>
        {score && parseFloat(score) > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-black/70 rounded px-1.5 py-0.5">
            <span className="text-green-400 text-[11px] font-bold">★ {score}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-semibold truncate leading-tight">{anime.name}</p>
          {year && month && (
            <p className="text-gray-400 text-[11px]">{year}年{parseInt(month)}月〜</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pageUrl = (p: number) => `/browse/airing?page=${p}`;

  const range = 2;
  const pages: number[] = [];
  for (
    let i = Math.max(1, currentPage - range);
    i <= Math.min(totalPages, currentPage + range);
    i++
  ) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10 flex-wrap">
      {currentPage > 1 && (
        <Link href={pageUrl(currentPage - 1)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition">
          ← 前へ
        </Link>
      )}
      {pages[0] > 1 && (
        <>
          <Link href={pageUrl(1)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition">1</Link>
          {pages[0] > 2 && <span className="text-gray-500 px-1">…</span>}
        </>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={pageUrl(p)}
          className={`px-3 py-2 rounded text-sm transition ${
            p === currentPage ? "bg-[#E50914] text-white font-bold" : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
        >
          {p}
        </Link>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="text-gray-500 px-1">…</span>}
          <Link href={pageUrl(totalPages)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition">
            {totalPages}
          </Link>
        </>
      )}
      {currentPage < totalPages && (
        <Link href={pageUrl(currentPage + 1)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition">
          次へ →
        </Link>
      )}
    </div>
  );
}

export default async function AiringPage({ searchParams }: AiringPageProps) {
  const { page: pageStr } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  // アクセス日時から現在のシーズンを取得
  const currentSeason = getRecentSeasons(1)[0];

  const data = await getAnimeBySeason(currentSeason.dateFrom, currentSeason.dateTo, currentPage).catch(() => null);
  const anime: TMDbAnime[] = data?.results ?? [];
  const totalPages = Math.min(data?.total_pages ?? 1, 500);
  const totalResults = data?.total_results ?? 0;

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* ヘッダー */}
      <div className="relative bg-gradient-to-b from-red-950 to-[#141414] pt-28 pb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-sm font-bold tracking-widest">ON AIR</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-2">{currentSeason.label}アニメ</h1>
        <p className="text-gray-400 text-sm">
          {currentSeason.label}（{currentSeason.dateFrom} 〜 {currentSeason.dateTo}）放送・配信の日本アニメ
          {totalResults > 0 && (
            <span className="ml-3">{totalResults.toLocaleString()}件</span>
          )}
          {totalPages > 1 && (
            <span className="ml-2 text-gray-500">· {currentPage} / {totalPages} ページ</span>
          )}
        </p>
      </div>

      <div className="px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pb-24">
        <div className="max-w-[1920px] mx-auto">
        {anime.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 3xl:grid-cols-9 gap-3 md:gap-4 xl:gap-5">
            {anime.map((a) => (
              <AnimeCard key={a.id} anime={a} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">データを取得できませんでした</div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
