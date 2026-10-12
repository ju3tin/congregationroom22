
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
]);

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing url query parameter" },
      { status: 400 }
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json(
      { error: "Invalid URL" },
      { status: 400 }
    );
  }

  const validPath =
    /^\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+\/?$/.test(
      parsed.pathname
    );

  if (
    parsed.protocol !== "https:" ||
    !ALLOWED_HOSTS.has(parsed.hostname) ||
    parsed.username ||
    parsed.password ||
    !validPath
  ) {
    return NextResponse.json(
      { error: "Invalid Instagram post or Reel URL" },
      { status: 400 }
    );
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  try {
    const endpoint = new URL(
      "https://graph.facebook.com/v26.0/instagram_oembed"
    );

    endpoint.searchParams.set("url", parsed.href);

    if (token) {
      endpoint.searchParams.set("access_token", token);
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Meta oEmbed API error:", data);

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "Instagram could not generate this embed",
        },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    if (typeof data.html !== "string") {
      return NextResponse.json(
        { error: "No embed HTML returned by Instagram" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        html: data.html,
        width: data.width ?? null,
        provider: data.provider_name ?? "Instagram",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Instagram request failed:", error);

    return NextResponse.json(
      { error: "Could not connect to Instagram" },
      { status: 502 }
    );
  }
}
