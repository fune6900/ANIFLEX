import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import type { HeroItem } from "@/components/HeroSection";
import ContentRow from "@/components/ContentRow";
import type { ContentRowItem } from "@/components/ContentRow";
import {
  getNewAnime,
  getTrendingAnime,
  getPopularVoiceActors,
  getAnimeByGenre,
  getAnimeByKeywords,
  getAnimeBySeason,
} from "@/lib/tmdb";
import { ANIME_GENRES } from "@/lib/genres";
import type { AnimeGenre } from "@/lib/genres";
import { ANIME_ERAS } from "@/lib/eras";
import { getRecentSeasons } from "@/lib/seasons";
import type { TMDbAnime, TMDbPerson } from "@/types/tmdb";

// TMDb アニメデータを ContentRowItem に変換
function toCardItem(anime: TMDbAnime): ContentRowItem {
  const year = anime.first_air_date?.split("-")[0];
  const match = anime.vote_average > 0 ? Math.round(anime.vote_average * 10) : undefined;
  return {
    id: anime.id,
    title: anime.name,
    year,
    match,
    posterPath: anime.poster_path,
    backdropPath: anime.backdrop_path,
    overview: anime.overview,
    href: `/anime/${anime.id}`,
  };
}

// TMDb 人物データを ContentRowItem に変換（声優カード）
function toPersonCardItem(person: TMDbPerson): ContentRowItem {
  const knownFor = person.known_for
    ?.map((k) => k.name ?? k.title)
    .filter(Boolean)
    .slice(0, 2)
    .join(" / ");
  return {
    id: person.id,
    title: person.name,
    year: knownFor ? `代表作: ${knownFor}` : undefined,
    rating: "CV",
    match: Math.min(99, Math.round(person.popularity)),
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #243b55 100%)",
    posterPath: person.profile_path,
    backdropPath: null,
    isPortrait: true,
    href: `/voice-actors/${person.id}`,
  };
}

// ジャンル1件分のアイテムを取得（genre/keyword どちらにも対応）
async function fetchGenreItems(genre: AnimeGenre): Promise<ContentRowItem[]> {
  try {
    if (genre.filterType === "keyword" && genre.keyword) {
      const allKeywords = [genre.keyword, ...(genre.extraKeywords ?? [])];
      const data = await getAnimeByKeywords(allKeywords);
      return data.results.slice(0, 10).map(toCardItem);
    } else {
      const data = await getAnimeByGenre(genre.id);
      return data.results.slice(0, 10).map(toCardItem);
    }
  } catch {
    return [];
  }
}

// 日本語名かどうか（ひらがな・カタカナ・漢字を含む）
function hasJapaneseName(name: string): boolean {
  return /[\u3040-\u30ff\u4e00-\u9faf]/.test(name);
}

export default async function Home() {
  // 現在のシーズンを取得
  const currentSeason = getRecentSeasons(1)[0];

  // 既存4列 + 全ジャンル を並列フェッチ
  const [currentSeasonData, newData, trendingData, voiceActorData, ...genreResults] =
    await Promise.allSettled([
      getAnimeBySeason(currentSeason.dateFrom, currentSeason.dateTo),
      getNewAnime(),
      getTrendingAnime(),
      getPopularVoiceActors(),
      ...ANIME_GENRES.map((g) => fetchGenreItems(g)),
    ]);

  // ヒーロースライダー用: backdrop_path がある今期アニメ6件
  const heroAnime: HeroItem[] =
    currentSeasonData.status === "fulfilled"
      ? currentSeasonData.value.results
          .filter((a) => a.backdrop_path)
          .slice(0, 6)
          .map((a) => ({
            id: a.id,
            title: a.name,
            overview: a.overview,
            backdropPath: a.backdrop_path,
            year: a.first_air_date?.split("-")[0],
            match: a.vote_average > 0 ? Math.round(a.vote_average * 10) : undefined,
            href: `/anime/${a.id}`,
          }))
      : [];

  const popularAnime =
    currentSeasonData.status === "fulfilled"
      ? currentSeasonData.value.results.slice(0, 10).map(toCardItem)
      : [];

  const newAnime =
    newData.status === "fulfilled"
      ? newData.value.results.slice(0, 10).map(toCardItem)
      : [];

  const trendingAnime =
    trendingData.status === "fulfilled"
      ? trendingData.value.results
          .filter((a) => a.genre_ids.includes(16) || a.origin_country.includes("JP"))
          .slice(0, 10)
          .map(toCardItem)
      : [];

  const voiceActors =
    voiceActorData.status === "fulfilled"
      ? voiceActorData.value.results
          .filter((p) =>
            p.known_for_department === "Acting" &&
            (
              hasJapaneseName(p.name) ||
              p.known_for?.some(
                (k) =>
                  (k.origin_country as string[] | undefined)?.includes("JP") ||
                  (k.genre_ids as number[] | undefined)?.includes(16)
              )
            )
          )
          .slice(0, 10)
          .map(toPersonCardItem)
      : [];

  // ジャンル別アイテム（ANIME_GENRES と同順）
  const genreItems = genreResults.map((r) =>
    r.status === "fulfilled" ? (r.value as ContentRowItem[]) : []
  );

  return (
    <div className="bg-[#141414] min-h-screen">
      <HeroSection items={heroAnime} />
      <div className="relative z-10 -mt-16 md:-mt-24 pb-20">
        {/* 既存ランキング・トレンド列 */}
        {popularAnime.length > 0 && (
          <ContentRow title={`🔥 ${currentSeason.label}アニメ TOP10`} items={popularAnime} allHref={currentSeason.href} />
        )}
        {trendingAnime.length > 0 && (
          <ContentRow title="📈 今週のトレンド" items={trendingAnime} allHref="/browse/trending" />
        )}
        {newAnime.length > 0 && (
          <ContentRow title="🆕 新着アニメ" items={newAnime} allHref="/browse/new" />
        )}
        {voiceActors.length > 0 && (
          <ContentRow title="🎤 人気声優" items={voiceActors} />
        )}

        {/* 年代別セクション */}
        <div className="px-4 md:px-12 mt-6 mb-4 flex items-center gap-3">
          <h2 className="text-white font-black text-lg md:text-xl">年代で探す</h2>
          <div className="flex-1 h-px bg-gray-800" />
        </div>
        <div className="flex gap-3 px-4 md:px-12 mb-8 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}>
          {ANIME_ERAS.map((era) => (
            <Link
              key={era.decade}
              href={`/browse/era/${era.decade}`}
              className={`flex-shrink-0 relative overflow-hidden rounded-lg w-36 md:w-44 h-24 md:h-28 bg-gradient-to-br ${era.color} group`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              <div className="absolute bottom-2 right-3 text-white/10 font-black text-5xl leading-none select-none">
                {era.shortLabel}
              </div>
              <div className="relative p-3 h-full flex flex-col justify-between">
                <span className="text-2xl">{era.emoji}</span>
                <div>
                  <p className="text-white font-black text-base leading-tight">{era.label}</p>
                  <p className="text-gray-300 text-[10px] mt-0.5 line-clamp-1">{era.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ジャンル別セクション */}
        <div className="px-4 md:px-12 mt-6 mb-4 flex items-center gap-3">
          <h2 className="text-white font-black text-lg md:text-xl">ジャンルで探す</h2>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {ANIME_GENRES.map((genre, i) => {
          const items = genreItems[i] ?? [];
          if (items.length === 0) return null;
          return (
            <ContentRow
              key={genre.id}
              title={`${genre.emoji} ${genre.name}`}
              items={items}
              allHref={`/browse/genre/${genre.id}`}
            />
          );
        })}
      </div>
    </div>
  );
}
