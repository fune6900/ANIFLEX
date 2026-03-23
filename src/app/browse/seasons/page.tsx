import Link from "next/link";
import { getRecentSeasons } from "@/lib/seasons";
import { SEASON_COLORS } from "@/lib/seasons";

const ALL_SEASONS = getRecentSeasons(20);

export default function SeasonsPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-24 px-4 md:px-12">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black mb-2">シーズン別アニメ</h1>
        <p className="text-gray-400 text-sm">放送シーズンごとにアニメを探す</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {ALL_SEASONS.map((season) => (
          <Link
            key={season.href}
            href={season.href}
            className={`relative overflow-hidden rounded-lg h-28 md:h-32 bg-gradient-to-br ${SEASON_COLORS[season.season]} group`}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            <div className="absolute bottom-2 right-3 text-white/10 font-black text-5xl leading-none select-none">
              {season.year}
            </div>
            <div className="relative p-4 h-full flex flex-col justify-between">
              <span className="text-3xl">{season.emoji}</span>
              <div>
                <p className="text-white font-black text-base leading-tight">{season.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
