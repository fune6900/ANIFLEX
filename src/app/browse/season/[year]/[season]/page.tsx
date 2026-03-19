import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimeBySeason } from "@/lib/tmdb";
import {
  findSeason,
  getRecentSeasons,
  isValidSeason,
  SEASON_COLORS,
  type SeasonSlug,
} from "@/lib/seasons";
import InfiniteGrid from "@/components/InfiniteGrid";
import type { NormalizedGridItem } from "@/app/api/browse/route";
import type { TMDbAnime } from "@/types/tmdb";

interface SeasonPageProps {
  params: Promise<{ year: string; season: string }>;
}

export default async function SeasonPage({ params }: SeasonPageProps) {
  const { year: yearStr, season: seasonStr } = await params;

  const year = parseInt(yearStr, 10);
  if (isNaN(year) || year < 1960 || year > 2030) notFound();
  if (!isValidSeason(seasonStr)) notFound();

  const seasonSlug = seasonStr as SeasonSlug;
  const currentSeason = findSeason(year, seasonSlug);

  const data = await getAnimeBySeason(
    currentSeason.dateFrom,
    currentSeason.dateTo,
    1
  ).catch(() => null);

  const totalPages = Math.min(data?.total_pages ?? 1, 500);
  const totalResults = data?.total_results ?? 0;

  const initialItems: NormalizedGridItem[] = (data?.results ?? []).map(
    (a: TMDbAnime) => ({
      id: a.id,
      title: a.name,
      posterPath: a.poster_path,
      year: a.first_air_date?.split("-")[0] ?? "",
      score: a.vote_average ?? 0,
      href: `/anime/${a.id}`,
    })
  );

  const recentSeasons = getRecentSeasons(8);
  const gradientClass = SEASON_COLORS[seasonSlug];
  const fetchUrl = `/api/browse?type=season&year=${year}&season=${seasonSlug}`;

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

        {initialItems.length > 0 ? (
          <InfiniteGrid
            initialItems={initialItems}
            initialPage={1}
            totalPages={totalPages}
            fetchUrl={fetchUrl}
          />
        ) : (
          <div className="text-center py-20 text-gray-500">
            このシーズンのアニメが見つかりませんでした
          </div>
        )}
      </div>
    </div>
  );
}
