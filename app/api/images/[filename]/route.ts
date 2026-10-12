import { NextRequest, NextResponse } from "next/server";

const GITHUB_OWNER = "ju3tin";
const GITHUB_REPO = "congregationroom22";
const GITHUB_BRANCH = "redr";
const GITHUB_FOLDER = "public/images";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    const githubUrl =
      `https://raw.githubusercontent.com/` +
      `${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/` +
      `${GITHUB_FOLDER}/${encodeURIComponent(filename)}`;

    const response = await fetch(githubUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    const image = await response.arrayBuffer();

    return new NextResponse(image, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load image" },
      { status: 500 }
    );
  }
}