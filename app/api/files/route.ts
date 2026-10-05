import { NextResponse } from "next/server";

const GITHUB_OWNER = "ju3tin";
const GITHUB_REPO = "congregationroom22";
const GITHUB_BRANCH = "redr";
const GITHUB_FOLDER = "public/images";

export async function GET() {
  try {
    const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FOLDER}?ref=${GITHUB_BRANCH}`;

    const response = await fetch(githubUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "congregationroom22",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.text();

      return NextResponse.json(
        {
          error: "Failed to get files from GitHub",
          details: error,
        },
        { status: response.status }
      );
    }

    const files = await response.json();

    const result = files
      .filter((file: any) => file.type === "file")
      .map((file: any) => ({
        name: file.name,
        url: `https://congregationroom22.com/images/${file.name}`,
        githubUrl: file.html_url,
        downloadUrl: file.download_url,
        size: file.size,
      }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}