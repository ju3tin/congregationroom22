import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiUrl = request.nextUrl.searchParams.get("url");

  if (!apiUrl) {
    return NextResponse.json(
      { error: "Missing Mixcloud URL" },
      { status: 400 }
    );
  }

  try {
    // Only allow Mixcloud API URLs
    const parsedUrl = new URL(apiUrl);

    if (parsedUrl.hostname !== "api.mixcloud.com") {
      return NextResponse.json(
        { error: "Invalid Mixcloud URL" },
        { status: 400 }
      );
    }

    const embedUrl =
      apiUrl.replace(/\/+$/, "") + "/embed-html/";

    const response = await fetch(embedUrl, {
      headers: {
        Accept: "text/html",
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Mixcloud returned ${response.status}`,
        },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Extract iframe src
    const match = html.match(
      /<iframe[^>]+src=["']([^"']+)["']/i
    );

    if (!match?.[1]) {
      console.error("Mixcloud embed HTML:", html);

      return NextResponse.json(
        {
          error: "No iframe found in Mixcloud response",
        },
        { status: 500 }
      );
    }

    const iframeUrl = match[1]
      .replace(/&amp;/g, "&")
      .replace(/&#x2F;/g, "/");

    return NextResponse.json({
      iframeUrl,
    });
  } catch (error) {
    console.error("Mixcloud API error:", error);

    return NextResponse.json(
      {
        error: "Unable to contact Mixcloud",
      },
      { status: 500 }
    );
  }
}