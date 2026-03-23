import { NextRequest, NextResponse } from "next/server";
import { getAnimeSeasonEpisodes } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const animeId = parseInt(searchParams.get("animeId") ?? "", 10);
  const season  = parseInt(searchParams.get("season")  ?? "", 10);

  if (isNaN(animeId) || isNaN(season) || animeId <= 0 || season < 0) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    const data = await getAnimeSeasonEpisodes(animeId, season);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch episodes" }, { status: 500 });
  }
}
