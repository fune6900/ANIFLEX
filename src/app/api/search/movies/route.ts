import { NextRequest, NextResponse } from "next/server";
import { searchMovie } from "@/lib/tmdb";

function sanitizeQuery(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'`]/g, "")
    .trim()
    .slice(0, 100);
}

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store, no-cache",
  "X-Frame-Options": "DENY",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawQuery = searchParams.get("q") ?? "";

  if (!rawQuery) {
    return NextResponse.json(
      { results: [], total_results: 0 },
      { headers: SECURITY_HEADERS }
    );
  }

  const query = sanitizeQuery(rawQuery);
  if (query.length < 1) {
    return NextResponse.json(
      { results: [], total_results: 0 },
      { headers: SECURITY_HEADERS }
    );
  }

  try {
    const data = await searchMovie(query);
    // 日本語タイトルや日本映画を優先
    const jpFiltered = data.results.filter(
      (m) => m.original_title !== m.title || m.genre_ids.includes(16)
    );
    const results = jpFiltered.length > 0 ? jpFiltered : data.results.slice(0, 8);
    return NextResponse.json(
      { ...data, results: results.slice(0, 8) },
      { headers: SECURITY_HEADERS }
    );
  } catch (err) {
    console.error("Movie search error:", err);
    return NextResponse.json(
      { error: "検索に失敗しました" },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
