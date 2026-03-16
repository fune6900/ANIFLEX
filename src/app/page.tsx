import HeroSection from "@/components/HeroSection";
import ContentRow from "@/components/ContentRow";
import type { ContentRowItem } from "@/components/ContentRow";
import { getPopularAnime, getNewAnime, getTrendingAnime } from "@/lib/tmdb";
import type { TMDbAnime } from "@/types/tmdb";

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
    href: `/anime/${anime.id}`,
  };
}

// 声優セクション（ハードコード維持）
const voiceActors: ContentRowItem[] = [
  { id: 9001, title: "花江夏樹", year: "代表作: 鬼滅", rating: "CV", gradient: "linear-gradient(135deg, #141e30 0%, #243b55 100%)" },
  { id: 9002, title: "悠木碧", year: "代表作: まどか", rating: "CV", gradient: "linear-gradient(135deg, #3a1c71 0%, #d76d77 100%)" },
  { id: 9003, title: "梶裕貴", year: "代表作: エレン", rating: "CV", gradient: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)" },
  { id: 9004, title: "釘宮理恵", year: "代表作: ルイズ", rating: "CV", gradient: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)" },
  { id: 9005, title: "宮野真守", year: "代表作: デスノート", rating: "CV", gradient: "linear-gradient(135deg, #1a1a2e 0%, #ffd700 100%)" },
  { id: 9006, title: "水樹奈々", year: "代表作: フェイト", rating: "CV", gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" },
];

export default async function Home() {
  // TMDb API から並行フェッチ
  const [popularData, newData, trendingData] = await Promise.allSettled([
    getPopularAnime(),
    getNewAnime(),
    getTrendingAnime(),
  ]);

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

  return (
    <div className="bg-[#141414] min-h-screen">
      <HeroSection />
      <div className="relative z-10 -mt-16 md:-mt-24 pb-20">
        {popularAnime.length > 0 && (
          <ContentRow title="🔥 今期人気アニメ TOP10" items={popularAnime} />
        )}
        {trendingAnime.length > 0 && (
          <ContentRow title="📈 今週のトレンド" items={trendingAnime} />
        )}
        {newAnime.length > 0 && (
          <ContentRow title="🆕 新着アニメ" items={newAnime} />
        )}
        <ContentRow title="🎤 人気声優" items={voiceActors} />
      </div>
    </div>
  );
}
