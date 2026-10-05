import { NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";

    if (!token || !owner || !repo) {
      return NextResponse.json(
        { error: "GitHub environment variables are missing" },
        { status: 500 }
      );
    }
 
    const path = "public/images";

    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to get GitHub files",
          details: data,
        },
        { status: response.status }
      );
    }

    const files = data
      .filter((item: any) => item.type === "file")
      .map((item: any) => ({
        name: item.name,
        path: item.path,
        size: item.size,
        sha: item.sha,
        url: item.html_url,
        download_url: item.download_url,
      }));

    return NextResponse.json({
      success: true,
      folder: path,
      count: files.length,
      files,
    });
  } catch (error) {
    console.error("GitHub files error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}