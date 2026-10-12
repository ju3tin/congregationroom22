
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 300;

const OWNER = "ju3tin";
const REPO = "congregationroom22";
const BRANCH = "redr";
const PREFIX = "public/instagram/";

type GitHubFile = {
  path: string;
  type: string;
};

type Video = {
  id: string;
  username: string;
  filename: string;
  path: string;
  url: string;
};

const extensions = new Set([".mp4", ".webm", ".mov", ".m4v"]);

async function getVideos(origin: string): Promise<Video[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`,
    {
      headers,
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data: { tree?: GitHubFile[]; truncated?: boolean } =
    await response.json();

  if (data.truncated) {
    throw new Error("GitHub repository tree was truncated.");
  }

  return (data.tree ?? [])
    .filter((file) => {
      if (file.type !== "blob" || !file.path.startsWith(PREFIX)) {
        return false;
      }

      const filename = file.path.split("/").pop() ?? "";
      const dot = filename.lastIndexOf(".");
      const extension = dot >= 0 ? filename.slice(dot).toLowerCase() : "";

      return extensions.has(extension);
    })
    .map((file) => {
      const parts = file.path.split("/");
      const filename = parts[parts.length - 1];
      const username = parts[2];
      const publicPath = file.path.slice("public".length);
      const encodedPath = publicPath
        .split("/")
        .map(encodeURIComponent)
        .join("/");

      return {
        id: filename.slice(0, filename.lastIndexOf(".")),
        username,
        filename,
        path: publicPath,
        url: `${origin}/api/video${encodedPath}`,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const username = params.get("username")?.trim().toLowerCase();
    const search = params.get("search")?.trim().toLowerCase();

    const requestedLimit = Number(params.get("limit") ?? 100);
    const requestedOffset = Number(params.get("offset") ?? 0);

    const limit = Number.isFinite(requestedLimit)
      ? Math.min(200, Math.max(1, Math.floor(requestedLimit)))
      : 100;

    const offset = Number.isFinite(requestedOffset)
      ? Math.max(0, Math.floor(requestedOffset))
      : 0;

    const videos = await getVideos(request.nextUrl.origin);

    const filtered = videos.filter((video) => {
      const matchesUsername =
        !username || video.username.toLowerCase() === username;

      const matchesSearch =
        !search ||
        `${video.id} ${video.username} ${video.filename}`
          .toLowerCase()
          .includes(search);

      return matchesUsername && matchesSearch;
    });

    const results = filtered.slice(offset, offset + limit);

    return NextResponse.json(
      {
        total: filtered.length,
        count: results.length,
        limit,
        offset,
        nextOffset:
          offset + results.length < filtered.length
            ? offset + results.length
            : null,
        videos: results,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Video API error:", error);

    return NextResponse.json(
      { error: "Unable to retrieve the video list." },
      { status: 502 }
    );
  }
}