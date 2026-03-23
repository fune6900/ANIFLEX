import Link from "next/link";
import { ANIME_GENRES } from "@/lib/genres";

export default function GenresPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-24 px-4 md:px-12">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black mb-2">ジャンル別アニメ</h1>
        <p className="text-gray-400 text-sm">お好みのジャンルからアニメを探す</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {ANIME_GENRES.map((genre) => (
          <Link
            key={genre.id}
            href={`/browse/genre/${genre.id}`}
            className={`relative overflow-hidden rounded-lg h-28 md:h-32 bg-gradient-to-br ${genre.color} group`}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            <div className="relative p-4 h-full flex flex-col justify-between">
              <span className="text-3xl">{genre.emoji}</span>
              <div>
                <p className="text-white font-black text-base leading-tight">{genre.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
