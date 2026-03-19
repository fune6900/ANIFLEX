import Image from "next/image";
import Link from "next/link";
import { getAnimeMovies } from "@/lib/tmdb";
import type { TMDbMovie } from "@/types/tmdb";

interface MoviesPageProps {
  searchParams: Promise<{ page?: string; sort?: string }>;
}

type SortOption = "popularity.desc" | "release_date.desc" | "vote_average.desc";

const SORT_LABELS: Record<SortOption, string> = {
  "popularity.desc": "人気順",
  "release_date.desc": "公開日順",
  "vote_average.desc": "評価順",
};

function MovieCard({ movie }: { movie: TMDbMovie }) {
  const year = movie.release_date?.split("-")[0];
  const score = movie.vote_average?.toFixed(1);

  return (
    <Link href={`/movie/${movie.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-sm overflow-hidden bg-gray-900">
        {movie.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3 bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="text-gray-400 text-xs text-center font-semibold">{movie.title}</span>
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
          <p className="text-white text-xs font-semibold truncate leading-tight">{movie.title}</p>
          {year && <p className="text-gray-400 text-[11px]">{year}年</p>}
        </div>
      </div>
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  sort,
}: {
  currentPage: number;
  totalPages: number;
  sort: string;
}) {
  if (totalPages <= 1) return null;

  const pageUrl = (p: number) =>
    `/browse/movies?page=${p}${sort !== "popularity.desc" ? `&sort=${sort}` : ""}`;

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

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const data = await getAnimeMovies(currentPage).catch(() => null);
  const movies: TMDbMovie[] = data?.results ?? [];
  const totalPages = Math.min(data?.total_pages ?? 1, 500);
  const totalResults = data?.total_results ?? 0;

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-24 px-4 md:px-12">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🎬</span>
          <div>
            <h1 className="text-white text-3xl font-black">アニメ映画</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {totalResults > 0
                ? `${totalResults.toLocaleString()}件の作品`
                : ""}
              {totalPages > 1 && ` · ${currentPage} / ${totalPages} ページ`}
            </p>
          </div>
        </div>
        <div className="h-0.5 w-16 bg-[#E50914] mt-3" />
      </div>

      {/* グリッド */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">データを取得できませんでした</div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} sort="popularity.desc" />
    </div>
  );
}
