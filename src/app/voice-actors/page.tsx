import Image from "next/image";
import Link from "next/link";
import { searchPerson } from "@/lib/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import type { TMDbPerson } from "@/types/tmdb";

const PER_PAGE = 20; // TMDb は1ページ最大20件

function sanitize(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`]/g, "")
    .trim()
    .slice(0, 100);
}

interface VoiceActorsPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

function PersonGridCard({ person }: { person: TMDbPerson }) {
  const knownForTitles = person.known_for
    ?.map((k) => k.name ?? k.title)
    .filter(Boolean)
    .slice(0, 2)
    .join(" / ");

  return (
    <Link href={`/voice-actors/${person.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-sm overflow-hidden bg-gray-900">
        {person.profile_path ? (
          <Image
            src={getImageUrl(person.profile_path, "w342")}
            alt={person.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-gray-800 to-gray-900">
            <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute top-2 right-2 bg-black/70 rounded px-1.5 py-0.5">
          <span className="text-[#54b9c5] text-xs font-bold">
            ★ {person.popularity.toFixed(1)}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-semibold truncate leading-tight">{person.name}</p>
          {knownForTitles && (
            <p className="text-gray-400 text-[11px] mt-0.5 truncate">{knownForTitles}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function Pagination({
  query,
  currentPage,
  totalPages,
}: {
  query: string;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pageUrl = (p: number) =>
    `/voice-actors?q=${encodeURIComponent(query)}&page=${p}`;

  // 表示するページ番号の範囲（現在ページ周辺5件）
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
      {/* 前へ */}
      {currentPage > 1 && (
        <Link
          href={pageUrl(currentPage - 1)}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition"
        >
          ← 前へ
        </Link>
      )}

      {/* 先頭 */}
      {pages[0] > 1 && (
        <>
          <Link href={pageUrl(1)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition">1</Link>
          {pages[0] > 2 && <span className="text-gray-500 px-1">…</span>}
        </>
      )}

      {/* ページ番号 */}
      {pages.map((p) => (
        <Link
          key={p}
          href={pageUrl(p)}
          className={`px-3 py-2 rounded text-sm transition ${
            p === currentPage
              ? "bg-[#E50914] text-white font-bold"
              : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
        >
          {p}
        </Link>
      ))}

      {/* 末尾 */}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-gray-500 px-1">…</span>
          )}
          <Link href={pageUrl(totalPages)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition">
            {totalPages}
          </Link>
        </>
      )}

      {/* 次へ */}
      {currentPage < totalPages && (
        <Link
          href={pageUrl(currentPage + 1)}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition"
        >
          次へ →
        </Link>
      )}
    </div>
  );
}

export default async function VoiceActorsPage({ searchParams }: VoiceActorsPageProps) {
  const params = await searchParams;
  const rawQuery = params.q ?? "";
  const query = sanitize(rawQuery);
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  let results: TMDbPerson[] = [];
  let totalResults = 0;
  let totalPages = 0;
  let error: string | null = null;

  if (query) {
    try {
      const data = await searchPerson(query, currentPage);
      results = data.results;
      totalResults = data.total_results;
      totalPages = Math.min(data.total_pages, 500); // TMDb上限
    } catch {
      error = "検索中にエラーが発生しました";
    }
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-24 px-4 md:px-12">
      {/* ヘッダー */}
      <div className="mb-8">
        {query ? (
          <>
            <p className="text-gray-400 text-sm mb-1">「{query}」の検索結果</p>
            <h1 className="text-white text-2xl font-bold">
              {totalResults > 0
                ? `${totalResults.toLocaleString()}件の声優が見つかりました`
                : "該当する声優が見つかりませんでした"}
            </h1>
            {totalPages > 1 && (
              <p className="text-gray-500 text-sm mt-1">
                {currentPage} / {totalPages} ページ（1ページ {PER_PAGE}件）
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="text-white text-2xl font-bold">声優を検索</h1>
            <p className="text-gray-400 text-sm mt-1">声優・俳優の名前で検索できます</p>
          </>
        )}
      </div>

      {/* エラー */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      {/* 検索フォーム */}
      <form method="GET" className="mb-10 max-w-xl">
        <div className="flex items-center border border-gray-600 bg-[#1a1a1a] rounded overflow-hidden focus-within:border-white transition-colors">
          <svg className="w-5 h-5 text-gray-400 ml-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="声優・俳優名で検索（例: 花江夏樹、悠木碧）"
            maxLength={100}
            autoComplete="off"
            className="flex-1 bg-transparent text-white px-4 py-3 text-sm outline-none placeholder-gray-500"
          />
          <button
            type="submit"
            className="bg-[#E50914] text-white px-5 py-3 text-sm font-semibold hover:bg-red-700 transition"
          >
            検索
          </button>
        </div>
      </form>

      {/* 結果グリッド */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
          {results.map((person) => (
            <PersonGridCard key={person.id} person={person} />
          ))}
        </div>
      )}

      {/* ページネーション */}
      {query && totalPages > 1 && (
        <Pagination query={query} currentPage={currentPage} totalPages={totalPages} />
      )}

      {/* 結果なし */}
      {query && results.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-2">「{query}」に一致する声優は見つかりませんでした</p>
          <p className="text-gray-600 text-sm">別のキーワードで試してみてください</p>
        </div>
      )}

      {/* 初期表示 */}
      {!query && (
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-gray-400">上のフォームに声優名を入力して検索してください</p>
        </div>
      )}
    </div>
  );
}
