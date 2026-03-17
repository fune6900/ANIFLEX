import { NextRequest, NextResponse } from "next/server";
import { searchPerson } from "@/lib/tmdb";

// 入力サニタイズ: HTMLタグ・危険文字除去、長さ制限
function sanitizeQuery(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")      // HTMLタグ除去（XSS対策）
    .replace(/[<>"'`]/g, "")      // 残存する危険文字除去
    .replace(/[;\-\-]/g, "")      // SQLインジェクション的パターン除去
    .trim()
    .slice(0, 100);               // 最大100文字
}

export async function GET(request: NextRequest) {
  // セキュリティヘッダー
  const securityHeaders = {
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store, no-cache",
    "X-Frame-Options": "DENY",
  };

  const { searchParams } = request.nextUrl;
  const rawQuery = searchParams.get("q") ?? "";

  if (!rawQuery) {
    return NextResponse.json(
      { results: [], total_results: 0, page: 1, total_pages: 0 },
      { headers: securityHeaders }
    );
  }

  const query = sanitizeQuery(rawQuery);

  if (query.length < 1) {
    return NextResponse.json(
      { results: [], total_results: 0, page: 1, total_pages: 0 },
      { headers: securityHeaders }
    );
  }

  try {
    const data = await searchPerson(query);

    // Acting 部門（声優・俳優）を優先、人気順でソート
    const actors = data.results
      .filter((p) => p.known_for_department === "Acting" || p.popularity > 1)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10);

    const results = actors.length > 0 ? actors : data.results.slice(0, 10);

    return NextResponse.json(
      { ...data, results },
      { headers: securityHeaders }
    );
  } catch (error) {
    console.error("Voice actor search error:", error);
    return NextResponse.json(
      { error: "検索に失敗しました" },
      { status: 500, headers: securityHeaders }
    );
  }
}
