import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest
) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      {
        error: "Missing Mixcloud URL",
      },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url, {
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

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error(
      "Mixcloud proxy error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to contact Mixcloud",
      },
      { status: 500 }
    );
  }
}