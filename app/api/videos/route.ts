import { NextRequest, NextResponse } from "next/server";
import videos from "@/data/videos.json";

export const runtime = "nodejs";
export const dynamic = "force-static";

type Video = {
  id: string;
  username: string | null;
  filename: string;
  path: string;
};

const allVideos = videos as Video[];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const username = params.get("username")?.trim().toLowerCase();
  const search = params.get("search")?.trim().toLowerCase();

  const parsedLimit = Number(params.get("limit") ?? "100");
  const parsedOffset = Number(params.get("offset") ?? "0");

  const limit = Number.isFinite(parsedLimit)
    ? Math.min(200, Math.max(1, Math.floor(parsedLimit)))
    : 100;

  const offset = Number.isFinite(parsedOffset)
    ? Math.max(0, Math.floor(parsedOffset))
    : 0;

  const origin = new URL(request.url).origin;

  let filtered = allVideos;

  if (username) {
    filtered = filtered.filter(
      (video) => video.username?.toLowerCase() === username
    );
  }

  if (search) {
    filtered = filtered.filter((video) =>
      `${video.id} ${video.username ?? ""} ${video.filename}`
        .toLowerCase()
        .includes(search)
    );
  }

  const total = filtered.length;

  const results = filtered.slice(offset, offset + limit).map((video) => ({
    ...video,
    url: `${origin}${video.path}`,
  }));

  return NextResponse.json(
    {
      total,
      limit,
      offset,
      count: results.length,
      nextOffset: offset + results.length < total
        ? offset + results.length
        : null,
      videos: results,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}