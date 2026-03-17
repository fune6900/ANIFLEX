// TMDb API クライアント

import type {
  TMDbAnime,
  TMDbPerson,
  TMDbPersonDetail,
  TMDbSearchResponse,
  TMDbTVDetail,
} from "@/types/tmdb";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// アニメーションジャンルID
const ANIMATION_GENRE_ID = 16;

// 認証情報を解決する
// TMDB_ACCESS_TOKEN があれば Bearer（優先）
// TMDB_API_KEY が JWT (eyJ...) ならそれも Bearer として扱う
// それ以外は api_key クエリパラメータ
function resolveAuth(): { headers: Record<string, string>; apiKeyParam?: string } {
  const bearerToken = process.env.TMDB_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  if (bearerToken) {
    return { headers: { Authorization: `Bearer ${bearerToken}` } };
  }
  if (apiKey) {
    // JWT 形式（eyJ で始まる）なら Bearer トークンとして使用
    if (apiKey.startsWith("eyJ")) {
      return { headers: { Authorization: `Bearer ${apiKey}` } };
    }
    // 従来の v3 API キー
    return { headers: {}, apiKeyParam: apiKey };
  }
  throw new Error(
    "TMDb認証情報が未設定です。TMDB_ACCESS_TOKEN または TMDB_API_KEY を .env.local に設定してください。"
  );
}

export function getImageUrl(
  path: string | null,
  size: "w185" | "w342" | "w500" | "w780" | "original" = "w342"
): string {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export async function fetchTMDb<T>(
  endpoint: string,
  params: Record<string, string> = {},
  cacheTime: number = 3600
): Promise<T> {
  const { headers: authHeaders, apiKeyParam } = resolveAuth();
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  // v3 API キーの場合はクエリパラメータに付加
  if (apiKeyParam) {
    url.searchParams.set("api_key", apiKeyParam);
  }

  url.searchParams.set("language", "ja-JP");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const fetchOptions: RequestInit = {
    headers: authHeaders,
    ...(cacheTime === 0
      ? { cache: "no-store" }
      : { next: { revalidate: cacheTime } }),
  };

  const response = await fetch(url.toString(), fetchOptions);

  if (!response.ok) {
    throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// アニメ検索（サーバーサイド用）
export async function searchAnime(
  query: string
): Promise<TMDbSearchResponse<TMDbAnime>> {
  return fetchTMDb<TMDbSearchResponse<TMDbAnime>>(
    "/search/tv",
    { query, include_adult: "false" },
    0
  );
}

// アニメ詳細取得
export async function getAnimeDetail(id: number): Promise<TMDbTVDetail> {
  return fetchTMDb<TMDbTVDetail>(`/tv/${id}`, {
    append_to_response: "credits",
  });
}

// 人気アニメ（日本アニメーション）
export async function getPopularAnime(page = 1): Promise<TMDbSearchResponse<TMDbAnime>> {
  return fetchTMDb<TMDbSearchResponse<TMDbAnime>>("/discover/tv", {
    with_genres: String(ANIMATION_GENRE_ID),
    with_origin_country: "JP",
    sort_by: "popularity.desc",
    "vote_count.gte": "100",
    page: String(page),
  });
}

// 新着アニメ（直近3ヶ月）
export async function getNewAnime(page = 1): Promise<TMDbSearchResponse<TMDbAnime>> {
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  return fetchTMDb<TMDbSearchResponse<TMDbAnime>>("/discover/tv", {
    with_genres: String(ANIMATION_GENRE_ID),
    with_origin_country: "JP",
    sort_by: "first_air_date.desc",
    "first_air_date.lte": now.toISOString().split("T")[0],
    "first_air_date.gte": threeMonthsAgo.toISOString().split("T")[0],
    "vote_count.gte": "5",
    page: String(page),
  });
}

// トレンドアニメ（週間・日本アニメフィルタ）
export async function getTrendingAnime(page = 1): Promise<TMDbSearchResponse<TMDbAnime>> {
  return fetchTMDb<TMDbSearchResponse<TMDbAnime>>("/trending/tv/week", { page: String(page) }, 3600);
}

// ──────────────────────────────────────────
// 声優（Person）関連
// ──────────────────────────────────────────

// 声優検索
export async function searchPerson(
  query: string
): Promise<TMDbSearchResponse<TMDbPerson>> {
  return fetchTMDb<TMDbSearchResponse<TMDbPerson>>(
    "/search/person",
    { query, include_adult: "false" },
    0
  );
}

// 声優詳細取得（出演作付き）
export async function getPersonDetail(id: number): Promise<TMDbPersonDetail> {
  return fetchTMDb<TMDbPersonDetail>(`/person/${id}`, {
    append_to_response: "combined_credits",
  });
}

// トップページ用: 人気声優（週間トレンド人物からActing部門を抽出）
export async function getPopularVoiceActors(): Promise<TMDbSearchResponse<TMDbPerson>> {
  return fetchTMDb<TMDbSearchResponse<TMDbPerson>>("/trending/person/week", {});
}
