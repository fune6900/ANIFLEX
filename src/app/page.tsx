import HeroSection from "@/components/HeroSection";
import ContentRow from "@/components/ContentRow";

const popularAnime = [
  { id: 1, title: "鬼滅の刃", year: "2019", rating: "PG-12", match: 98, gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #e94560 100%)", label: "ANIFLEX" },
  { id: 2, title: "僕のヒーローアカデミア", year: "2016", rating: "PG-12", match: 95, gradient: "linear-gradient(135deg, #0f3460 0%, #533483 100%)" },
  { id: 3, title: "ワンピース", year: "1999", rating: "G", match: 97, gradient: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)" },
  { id: 4, title: "ナルト 疾風伝", year: "2007", rating: "PG-12", match: 93, gradient: "linear-gradient(135deg, #ff8c00 0%, #ff4500 100%)" },
  { id: 5, title: "進撃の巨人", year: "2013", rating: "R15+", match: 99, gradient: "linear-gradient(135deg, #2d2d2d 0%, #8b0000 100%)", label: "完結" },
  { id: 6, title: "呪術廻戦", year: "2020", rating: "R15+", match: 96, gradient: "linear-gradient(135deg, #1a1a2e 0%, #4a0080 100%)" },
  { id: 7, title: "SPY×FAMILY", year: "2022", rating: "G", match: 91, gradient: "linear-gradient(135deg, #1e3a5f 0%, #e8c84a 100%)" },
  { id: 8, title: "ダンダダン", year: "2024", rating: "PG-12", match: 94, gradient: "linear-gradient(135deg, #2c003e 0%, #11998e 100%)", label: "新着" },
];

const newAnime = [
  { id: 9, title: "マッシュル", year: "2023", rating: "G", match: 88, gradient: "linear-gradient(135deg, #1a472a 0%, #2d6a4f 100%)" },
  { id: 10, title: "薬屋のひとりごと", year: "2023", rating: "PG-12", match: 92, gradient: "linear-gradient(135deg, #4a1942 0%, #c84b31 100%)" },
  { id: 11, title: "葬送のフリーレン", year: "2023", rating: "G", match: 97, gradient: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)", label: "受賞" },
  { id: 12, title: "ダンジョン飯", year: "2024", rating: "PG-12", match: 95, gradient: "linear-gradient(135deg, #2c1810 0%, #8b5e3c 100%)" },
  { id: 13, title: "ブルーロック", year: "2022", rating: "G", match: 89, gradient: "linear-gradient(135deg, #000428 0%, #004e92 100%)" },
  { id: 14, title: "チェンソーマン", year: "2022", rating: "R15+", match: 93, gradient: "linear-gradient(135deg, #200122 0%, #6f0000 100%)" },
  { id: 15, title: "スパイファミリー S2", year: "2023", rating: "G", match: 90, gradient: "linear-gradient(135deg, #1a3a5c 0%, #d4af37 100%)", label: "新着" },
];

const voiceActors = [
  { id: 16, title: "花江夏樹", year: "代表作: 鬼滅", rating: "CV", match: 99, gradient: "linear-gradient(135deg, #141e30 0%, #243b55 100%)" },
  { id: 17, title: "悠木碧", year: "代表作: まどか", rating: "CV", match: 97, gradient: "linear-gradient(135deg, #3a1c71 0%, #d76d77 100%)" },
  { id: 18, title: "梶裕貴", year: "代表作: エレン", rating: "CV", match: 96, gradient: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)" },
  { id: 19, title: "釘宮理恵", year: "代表作: ルイズ", rating: "CV", match: 98, gradient: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)" },
  { id: 20, title: "宮野真守", year: "代表作: デスノート", rating: "CV", match: 95, gradient: "linear-gradient(135deg, #1a1a2e 0%, #ffd700 100%)" },
  { id: 21, title: "水樹奈々", year: "代表作: フェイト", rating: "CV", match: 94, gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" },
];

const aniflex = [
  { id: 22, title: "進撃の巨人 完結編", year: "2023", rating: "R15+", match: 99, gradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", label: "ANIFLEX" },
  { id: 23, title: "チェンソーマン Part2", year: "2024", rating: "R15+", match: 96, gradient: "linear-gradient(135deg, #360033 0%, #0b8793 100%)", label: "ANIFLEX" },
  { id: 24, title: "鬼滅 柱稽古編", year: "2024", rating: "PG-12", match: 98, gradient: "linear-gradient(135deg, #1a0a0a 0%, #8b0000 50%, #ff6b6b 100%)", label: "ANIFLEX" },
  { id: 25, title: "ダンジョン飯 後半", year: "2024", rating: "PG-12", match: 94, gradient: "linear-gradient(135deg, #1a0a00 0%, #7c4a03 100%)", label: "ANIFLEX" },
  { id: 26, title: "葬送のフリーレン 後半", year: "2024", rating: "G", match: 97, gradient: "linear-gradient(135deg, #16213e 0%, #0f3460 100%)", label: "ANIFLEX" },
];

export default function Home() {
  return (
    <div className="bg-[#141414] min-h-screen">
      <HeroSection />
      <div className="relative z-10 -mt-16 md:-mt-24 pb-20">
        <ContentRow title="🔥 今期人気アニメ TOP10" items={popularAnime} />
        <ContentRow title="✨ ANIFLEXオリジナル" items={aniflex} />
        <ContentRow title="🆕 新着・話題作" items={newAnime} />
        <ContentRow title="🎤 人気声優" items={voiceActors} />
        <ContentRow title="⭐ あなたへのおすすめ" items={[...popularAnime].reverse()} />
      </div>
    </div>
  );
}
