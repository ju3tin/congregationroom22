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
        {
          error: "GitHub environment variables are missing",
        },
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
        image_url: `/api/images/${encodeURIComponent(item.name)}`,
        public_url: `https://congregationroom22.com/api/images/${encodeURIComponent(
          item.name
        )}`,
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

/**
 * DELETE /api/github/images
 *
 * Body:
 * {
 *   path: "public/images/example.png",
 *   sha: "github-file-sha"
 * }
 */
export async function DELETE(request: Request) {
  try {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";

    if (!token || !owner || !repo) {
      return NextResponse.json(
        {
          error: "GitHub environment variables are missing",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const { path, sha } = body;

    if (!path || !sha) {
      return NextResponse.json(
        {
          error: "Path and SHA are required",
        },
        { status: 400 }
      );
    }

    // Security: only allow deleting files from public/images
    if (!path.startsWith("public/images/")) {
      return NextResponse.json(
        {
          error: "You can only delete files from public/images",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Delete ${path}`,
          sha,
          branch,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.message || "Failed to delete GitHub file",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${path} deleted successfully`,
    });
  } catch (error) {
    console.error("GitHub delete error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete image",
      },
      { status: 500 }
    );
  }
}