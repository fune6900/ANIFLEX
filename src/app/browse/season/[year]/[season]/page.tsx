import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimeBySeason } from "@/lib/tmdb";
import {
  findSeason,
  getRecentSeasons,
  isValidSeason,
  SEASON_COLORS,
  SEASON_LABELS,
  type SeasonSlug,
} from "@/lib/seasons";
import type { TMDbAnime } from "@/types/tmdb";

interface SeasonPageProps {
  params: Promise<{ year: string; season: string }>;
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
            src={`https://image.tmdb.org/t/p/w342${anime.poster_path}`}
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
        {score && parseFloat(score) > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-black/70 rounded px-1.5 py-0.5">
            <span className="text-green-400 text-[11px] font-bold">★ {score}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-semibold truncate leading-tight">{anime.name}</p>
          {year && month && (
            <p className="text-gray-400 text-[11px]">{year}年{parseInt(month)}月</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function Pagination({
  year,
  season,
  currentPage,
  totalPages,
}: {
  year: number;
  season: SeasonSlug;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pageUrl = (p: number) =>
    `/browse/season/${year}/${season}?page=${p}`;

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

export default async function SeasonPage({ params, searchParams }: SeasonPageProps) {
  const { year: yearStr, season: seasonStr } = await params;
  const { page: pageStr } = await searchParams;

  const year = parseInt(yearStr, 10);
  if (isNaN(year) || year < 1960 || year > 2030) notFound();
  if (!isValidSeason(seasonStr)) notFound();

  const seasonSlug = seasonStr as SeasonSlug;
  const currentSeason = findSeason(year, seasonSlug);
  const currentPage = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const data = await getAnimeBySeason(
    currentSeason.dateFrom,
    currentSeason.dateTo,
    currentPage
  ).catch(() => null);

  const anime: TMDbAnime[] = data?.results ?? [];
  const totalPages = Math.min(data?.total_pages ?? 1, 500);
  const totalResults = data?.total_results ?? 0;

  // 直近8クールをナビゲーション用に取得
  const recentSeasons = getRecentSeasons(8);

  const gradientClass = SEASON_COLORS[seasonSlug];

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* ヘッダー */}
      <div className={`relative bg-gradient-to-b ${gradientClass} pt-28 pb-10 px-4 md:px-12`}>
        <div className="relative z-10">
          <p className="text-gray-400 text-sm mb-1">シーズン別アニメ</p>
          <h1 className="text-4xl md:text-5xl font-black mb-2 flex items-center gap-3">
            <span>{currentSeason.emoji}</span>
            {currentSeason.label}アニメ
          </h1>
          <p className="text-gray-300 text-sm">
            {currentSeason.dateFrom} 〜 {currentSeason.dateTo}
            {totalResults > 0 && (
              <span className="ml-3 text-gray-400">{totalResults.toLocaleString()}件</span>
            )}
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent opacity-40" />
      </div>

      <div className="px-4 md:px-12 pb-24">
        {/* シーズンナビゲーション */}
        <div className="flex gap-2 overflow-x-auto py-4 mb-6" style={{ scrollbarWidth: "none" }}>
          {recentSeasons.map((s) => {
            const isCurrentSeason = s.year === year && s.season === seasonSlug;
            return (
              <Link
                key={s.href}
                href={s.href}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                  isCurrentSeason
                    ? "bg-white text-black"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <span>{s.emoji}</span>
                {s.label}
              </Link>
            );
          })}
        </div>

        {/* グリッド */}
        {anime.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
            {anime.map((a) => (
              <AnimeCard key={a.id} anime={a} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            このシーズンのアニメが見つかりませんでした
          </div>
        )}

        <Pagination
          year={year}
          season={seasonSlug}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
