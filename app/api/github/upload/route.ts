import { NextRequest, NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file supplied" },
        { status: 400 }
      );
    }

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

    // Always upload into public/images
    const path = `public/images/${file.name}`;

    // Convert file to Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const content = buffer.toString("base64");

    // Check if file already exists
    let sha: string | undefined;

    const existingResponse = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (existingResponse.ok) {
      const existingFile = await existingResponse.json();
      sha = existingFile.sha;
    }

    // Upload / update GitHub file
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: sha
            ? `Update image: ${file.name}`
            : `Add image: ${file.name}`,
          content,
          branch,
          ...(sha ? { sha } : {}),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "GitHub upload failed",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      filename: file.name,
      path,
      github_url: data.content?.html_url,
      raw_url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
      commit_url: data.commit?.html_url,
    });
  } catch (error) {
    console.error("GitHub upload error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}