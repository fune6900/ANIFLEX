import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimeDetail, getAnimeVideos, getImageUrl } from "@/lib/tmdb";
import type { TMDbCastMember, TMDbVideo } from "@/types/tmdb";

interface AnimeDetailPageProps {
  params: Promise<{ id: string }>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    "Returning Series": { label: "放送中", color: "text-green-400 border-green-600" },
    "Ended":            { label: "完結",   color: "text-gray-400 border-gray-600" },
    "Canceled":         { label: "打ち切り", color: "text-red-400 border-red-700" },
    "In Production":    { label: "制作中", color: "text-yellow-400 border-yellow-600" },
  };
  const s = map[status] ?? { label: status, color: "text-gray-400 border-gray-600" };
  return (
    <span className={`border text-xs px-2 py-0.5 rounded ${s.color}`}>{s.label}</span>
  );
}

function VideoTypeLabel({ type, official }: { type: string; official: boolean }) {
  const labels: Record<string, string> = {
    Trailer: "予告編",
    Teaser: "ティーザー",
    "Opening Credits": "オープニング",
    Clip: "クリップ",
    Featurette: "特別映像",
  };
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-gray-400">
      {official && (
        <span className="bg-blue-900/60 text-blue-300 border border-blue-700/50 px-1.5 py-0.5 rounded font-semibold">
          公式
        </span>
      )}
      <span>{labels[type] ?? type}</span>
    </span>
  );
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) notFound();

  let anime;
  let videos: TMDbVideo[] = [];
  try {
    [anime, videos] = await Promise.all([
      getAnimeDetail(numId),
      getAnimeVideos(numId).catch(() => []),
    ]);
  } catch {
    notFound();
  }

  const year = anime.first_air_date?.split("-")[0];
  const score = anime.vote_average?.toFixed(1);
  const cast: TMDbCastMember[] = anime.credits?.cast?.slice(0, 12) ?? [];

  // 先頭が一番優先度の高い動画（トレーラー等）
  const mainVideo = videos[0] ?? null;
  const extraVideos = videos.slice(1, 5); // 最大4件追加表示

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* ヒーローバックドロップ */}
      <div className="relative w-full h-[55vw] max-h-[70vh] overflow-hidden">
        {anime.backdrop_path ? (
          <Image
            src={getImageUrl(anime.backdrop_path, "original")}
            alt={anime.name}
            fill priority
            sizes="100vw"
            className="object-cover object-top"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/70 via-transparent to-transparent" />
      </div>

      {/* コンテンツ */}
      <div className="relative -mt-32 md:-mt-48 px-4 md:px-12 pb-20">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* ポスター */}
          <div className="flex-shrink-0 w-36 md:w-48 lg:w-56 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] rounded-md overflow-hidden shadow-2xl border border-gray-700/50">
              {anime.poster_path ? (
                <Image
                  src={getImageUrl(anime.poster_path, "w342")}
                  alt={anime.name}
                  fill
                  sizes="(max-width: 768px) 144px, 224px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center p-4">
                  <span className="text-white text-sm text-center font-bold">{anime.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* 情報パネル */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-1 leading-tight">
              {anime.name}
            </h1>
            {anime.original_name && anime.original_name !== anime.name && (
              <p className="text-gray-400 text-base mb-3">{anime.original_name}</p>
            )}
            {anime.tagline && (
              <p className="text-gray-300 italic text-sm mb-4">"{anime.tagline}"</p>
            )}

            {/* メタバッジ */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {score && parseFloat(score) > 0 && (
                <span className="flex items-center gap-1 text-green-400 font-bold text-base">
                  ★ {score}
                  <span className="text-gray-500 text-xs font-normal">
                    ({anime.vote_count?.toLocaleString()}件)
                  </span>
                </span>
              )}
              {year && <span className="text-gray-400 text-sm">{year}</span>}
              {anime.status && <StatusBadge status={anime.status} />}
              {anime.number_of_seasons > 0 && (
                <span className="text-gray-400 text-sm">{anime.number_of_seasons}シーズン</span>
              )}
              {anime.number_of_episodes > 0 && (
                <span className="text-gray-400 text-sm">全{anime.number_of_episodes}話</span>
              )}
            </div>

            {/* ジャンル */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {anime.genres.map((g) => (
                  <span key={g.id} className="border border-gray-600 text-gray-300 text-xs px-2 py-0.5 rounded">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {mainVideo ? (
                <a
                  href={`https://www.youtube.com/watch?v=${mainVideo.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded hover:bg-gray-200 transition text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  トレーラーを見る
                </a>
              ) : (
                <button className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded hover:bg-gray-200 transition text-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  再生
                </button>
              )}
              <button className="flex items-center gap-2 bg-gray-600/70 text-white font-semibold px-6 py-2.5 rounded hover:bg-gray-500/70 transition text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                マイリストに追加
              </button>
              {/* ② 公式サイトリンク */}
              {anime.homepage && (
                <a
                  href={anime.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-700/60 text-gray-200 font-semibold px-5 py-2.5 rounded hover:bg-gray-600/60 transition text-sm border border-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  公式サイト
                </a>
              )}
            </div>

            {/* あらすじ */}
            {anime.overview && (
              <div className="mb-6">
                <h2 className="text-white font-semibold mb-2">あらすじ</h2>
                <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">{anime.overview}</p>
              </div>
            )}

            {/* ネットワーク */}
            {anime.networks && anime.networks.length > 0 && (
              <p className="text-gray-500 text-xs mb-1">
                <span className="text-gray-400 font-semibold">放送局: </span>
                {anime.networks.map((n) => n.name).join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* ③ 動画セクション */}
        {videos.length > 0 && (
          <section className="mt-12">
            <h2 className="text-white font-bold text-lg mb-5">動画・トレーラー</h2>

            {/* メイン動画（大） */}
            {mainVideo && (
              <div className="mb-5">
                <div className="relative w-full max-w-3xl aspect-video rounded-lg overflow-hidden bg-black shadow-2xl">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${mainVideo.key}?rel=0&modestbranding=1`}
                    title={mainVideo.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="mt-2 max-w-3xl flex items-center justify-between">
                  <p className="text-gray-300 text-sm font-medium truncate">{mainVideo.name}</p>
                  <VideoTypeLabel type={mainVideo.type} official={mainVideo.official} />
                </div>
              </div>
            )}

            {/* サブ動画（小サムネ一覧） */}
            {extraVideos.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {extraVideos.map((v) => (
                  <a
                    key={v.id}
                    href={`https://www.youtube.com/watch?v=${v.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 group"
                  >
                    <div className="relative w-48 aspect-video rounded overflow-hidden bg-gray-900">
                      {/* YouTube サムネイル */}
                      <Image
                        src={`https://img.youtube.com/vi/${v.key}/mqdefault.jpg`}
                        alt={v.name}
                        fill
                        sizes="192px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* 再生アイコンオーバーレイ */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                          <svg className="w-4 h-4 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-[11px] mt-1.5 w-48 truncate">{v.name}</p>
                    <VideoTypeLabel type={v.type} official={v.official} />
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ① キャスト・声優（クリックで声優詳細へ） */}
        {cast.length > 0 && (
          <section className="mt-10">
            <h2 className="text-white font-bold text-lg mb-4">キャスト・声優</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {cast.map((member) => (
                <Link
                  key={member.id}
                  href={`/voice-actors/${member.id}`}
                  className="text-center group"
                >
                  <div className="relative w-full aspect-square rounded-full overflow-hidden bg-gray-800 mb-2 mx-auto max-w-[72px] ring-2 ring-transparent group-hover:ring-[#54b9c5] transition-all duration-200">
                    {member.profile_path ? (
                      <Image
                        src={getImageUrl(member.profile_path, "w185")}
                        alt={member.name}
                        fill
                        sizes="72px"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-white text-[11px] font-semibold truncate group-hover:text-[#54b9c5] transition-colors">
                    {member.name}
                  </p>
                  {member.character && (
                    <p className="text-gray-500 text-[10px] truncate">{member.character}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* シーズン一覧 */}
        {anime.seasons && anime.seasons.filter((s) => s.season_number > 0).length > 0 && (
          <section className="mt-10">
            <h2 className="text-white font-bold text-lg mb-4">シーズン</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {anime.seasons
                .filter((s) => s.season_number > 0)
                .map((season) => (
                  <div key={season.id} className="bg-[#1a1a1a] rounded overflow-hidden">
                    <div className="relative aspect-[2/3] bg-gray-900">
                      {season.poster_path ? (
                        <Image
                          src={getImageUrl(season.poster_path, "w342")}
                          alt={season.name}
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-3">
                          <span className="text-gray-500 text-xs text-center">{season.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-white text-xs font-semibold truncate">{season.name}</p>
                      <p className="text-gray-500 text-[11px]">
                        {season.episode_count}話
                        {season.air_date && ` · ${season.air_date.split("-")[0]}`}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* 戻るボタン */}
        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
