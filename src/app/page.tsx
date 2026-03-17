import HeroSection from "@/components/HeroSection";
import type { HeroItem } from "@/components/HeroSection";
import ContentRow from "@/components/ContentRow";
import type { ContentRowItem } from "@/components/ContentRow";
import { getPopularAnime, getNewAnime, getTrendingAnime, getPopularVoiceActors } from "@/lib/tmdb";
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
    posterPath: person.profile_path,   // 縦長プロフィール写真
    backdropPath: null,
    isPortrait: true,
    href: `/voice-actors/${person.id}`,
  };
}

export default async function Home() {
  // TMDb API から並行フェッチ
  const [popularData, newData, trendingData, voiceActorData] = await Promise.allSettled([
    getPopularAnime(),
    getNewAnime(),
    getTrendingAnime(),
    getPopularVoiceActors(),
  ]);

  // ヒーロースライダー用: backdrop_path がある人気アニメ6件
  const heroAnime: HeroItem[] =
    popularData.status === "fulfilled"
      ? popularData.value.results
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
    popularData.status === "fulfilled"
      ? popularData.value.results.slice(0, 10).map(toCardItem)
      : [];

  const newAnime =
    newData.status === "fulfilled"
      ? newData.value.results.slice(0, 10).map(toCardItem)
      : [];

  // トレンドから日本アニメっぽいものを抽出
  const trendingAnime =
    trendingData.status === "fulfilled"
      ? trendingData.value.results
          .filter((a) => a.genre_ids.includes(16) || a.origin_country.includes("JP"))
          .slice(0, 10)
          .map(toCardItem)
      : [];

  // 週間トレンド人物から Acting 部門を優先して声優カードを生成
  const voiceActors =
    voiceActorData.status === "fulfilled"
      ? voiceActorData.value.results
          .filter((p) => p.known_for_department === "Acting")
          .slice(0, 10)
          .map(toPersonCardItem)
      : [];

  return (
    <div className="bg-[#141414] min-h-screen">
      <HeroSection items={heroAnime} />
      <div className="relative z-10 -mt-16 md:-mt-24 pb-20">
        {popularAnime.length > 0 && (
          <ContentRow title="🔥 今期人気アニメ TOP10" items={popularAnime} allHref="/browse/popular" />
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
      </div>
    </div>
  );
}
