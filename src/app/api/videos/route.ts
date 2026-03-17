import { fetchTMDb } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

interface TMDbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

interface TMDbVideosResponse {
  id: number;
  results: TMDbVideo[];
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ key: null }, { status: 400 });
  }

  try {
    const data = await fetchTMDb<TMDbVideosResponse>(
      `/tv/${id}/videos`,
      {},
      3600
    );

    // YouTube 動画を優先度順に選択:
    // 公式トレーラー > 公式ティーザー > トレーラー > オープニング > その他
    const yt = data.results.filter((v) => v.site === "YouTube");
    const pick =
      yt.find((v) => v.official && v.type === "Trailer") ??
      yt.find((v) => v.official && v.type === "Teaser") ??
      yt.find((v) => v.type === "Trailer") ??
      yt.find((v) => v.type === "Opening Credits") ??
      yt[0] ??
      null;

    return NextResponse.json(
      { key: pick?.key ?? null },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  } catch {
    return NextResponse.json({ key: null }, { status: 500 });
  }
}
