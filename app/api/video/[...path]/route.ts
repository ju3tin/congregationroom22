
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OWNER = "ju3tin";
const REPO = "congregationroom22";
const BRANCH = "redr";

type Context = {
  params: Promise<{ path: string[] }>;
};

async function proxyVideo(
  request: NextRequest,
  context: Context,
  isHead = false
) {
  const { path } = await context.params;

  // Only allow paths inside the Instagram video directory.
  if (
    !path ||
    path.length < 2 ||
    path[0] !== "instagram" ||
    path.some((part) =>
      !part || part === "." || part === ".." ||
      part.includes("/") || part.includes("\\")
    )
  ) {
    return NextResponse.json({ error: "Invalid video path" }, {
      status: 400,
    });
  }

  const filename = path[path.length - 1];

  if (!/\.(mp4|webm|mov|m4v)$/i.test(filename)) {
    return NextResponse.json({ error: "Unsupported video type" }, {
      status: 400,
    });
  }

  const encodedPath = path.map(encodeURIComponent).join("/");

  const sourceUrl =
    `https://github.com/${OWNER}/${REPO}/raw/refs/heads/` +
    `${BRANCH}/public/${encodedPath}`;

  try {
    const upstream = await fetch(sourceUrl, {
      method: isHead ? "HEAD" : "GET",
      headers: {
        ...(request.headers.get("range")
          ? { Range: request.headers.get("range")! }
          : {}),
        ...(request.headers.get("if-range")
          ? { "If-Range": request.headers.get("if-range")! }
          : {}),
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Video unavailable", upstreamStatus: upstream.status },
        { status: upstream.status === 404 ? 404 : 502 }
      );
    }

    const headers = new Headers();

    headers.set(
      "Content-Type",
      filename.toLowerCase().endsWith(".mp4")
        ? "video/mp4"
        : upstream.headers.get("content-type") || "application/octet-stream"
    );
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");

    for (const name of [
      "content-length",
      "content-range",
      "last-modified",
      "etag",
    ]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new Response(isHead ? null : upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error("Video proxy failed:", error);
    return NextResponse.json(
      { error: "Unable to retrieve video" },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: Context) {
  return proxyVideo(request, context);
}

export async function HEAD(request: NextRequest, context: Context) {
  return proxyVideo(request, context, true);
}