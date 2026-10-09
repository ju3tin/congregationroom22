
import { NextRequest, NextResponse } from "next/server";

import dbConnect from "@/lib/db";
import DJ from "@/models/DJ";
import Mix from "@/models/Mix";

export const runtime = "nodejs";
export const maxDuration = 60;

type Cloudcast = {
  key: string;
  name: string;
  url: string;
  created_time?: string;
  description?: string;
  audio_length?: number;
  pictures?: {
    medium?: string;
    large?: string;
    extra_large?: string;
  };
};

type CloudcastResponse = {
  data?: Cloudcast[];
  paging?: {
    next?: string | null;
  };
};

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "mix"
  );
}

function getUsername(value: string) {
  const input = value.trim();

  if (input.includes("mixcloud.com")) {
    const url = new URL(
      input.startsWith("http") ? input : `https://${input}`
    );

    if (
      url.hostname !== "mixcloud.com" &&
      !url.hostname.endsWith(".mixcloud.com")
    ) {
      throw new Error("Invalid Mixcloud profile URL");
    }

    return url.pathname.split("/").filter(Boolean)[0] ?? "";
  }

  return input.replace(/^@/, "").replace(/^\/|\/$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const djId = body.djId;
    const mixcloudUsername = body.mixcloudUsername;

    if (!djId || !mixcloudUsername) {
      return NextResponse.json(
        {
          error: "djId and mixcloudUsername are required",
        },
        { status: 400 }
      );
    }

    const username = getUsername(String(mixcloudUsername));

    if (!username || username.includes("/")) {
      return NextResponse.json(
        { error: "Invalid Mixcloud username" },
        { status: 400 }
      );
    }

    const dj = await DJ.findById(djId).lean();

    if (!dj) {
      return NextResponse.json(
        { error: "DJ not found" },
        { status: 404 }
      );
    }

    const genre =
      typeof dj.genre === "string" && dj.genre.trim()
        ? dj.genre.trim()
        : "Various";

    const baseUrl =
      `https://api.mixcloud.com/${encodeURIComponent(username)}/cloudcasts/`;

    let nextUrl: string | null =
      `${baseUrl}?limit=100&offset=0`;

    const seenUrls = new Set<string>();
    const imported: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    let pages = 0;

    while (nextUrl) {
      if (++pages > 100) {
        errors.push("Stopped at 100 pages; import remaining mixes separately.");
        break;
      }

      const parsed = new URL(nextUrl);

      // Only follow pagination URLs from the official API host.
      if (
        parsed.protocol !== "https:" ||
        parsed.hostname !== "api.mixcloud.com"
      ) {
        throw new Error("Invalid Mixcloud pagination URL");
      }

      const response = await fetch(parsed.toString(), {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(
          `Mixcloud API returned HTTP ${response.status}`
        );
      }

      const result =
        (await response.json()) as CloudcastResponse;

      for (const cloudcast of result.data ?? []) {
        if (!cloudcast.name || !cloudcast.url) {
          skipped.push(cloudcast.key || "Unnamed cloudcast");
          continue;
        }

        if (seenUrls.has(cloudcast.url)) {
          continue;
        }

        seenUrls.add(cloudcast.url);

        // Skip records already imported for this DJ.
        const existing = await Mix.findOne({
          djId: dj._id,
          audioUrl: cloudcast.url,
        }).select("_id").lean();

        if (existing) {
          skipped.push(cloudcast.name);
          continue;
        }

        const coverImage =
          cloudcast.pictures?.extra_large ||
          cloudcast.pictures?.large ||
          cloudcast.pictures?.medium;

        // Artwork is required by the current Mix schema.
        if (!coverImage) {
          skipped.push(`${cloudcast.name} (no artwork)`);
          continue;
        }

        const releaseDate = cloudcast.created_time
          ? new Date(cloudcast.created_time)
          : new Date();

        if (Number.isNaN(releaseDate.getTime())) {
          skipped.push(`${cloudcast.name} (invalid date)`);
          continue;
        }

        const duration =
          Number.isFinite(cloudcast.audio_length) &&
          (cloudcast.audio_length ?? 0) >= 0
            ? cloudcast.audio_length!
            : 0;

        const baseSlug =
          `${slugify(cloudcast.name)}-${slugify(username)}-${slugify(
            cloudcast.key || cloudcast.url
          )}`.slice(0, 180);

        try {
          await Mix.create({
            title: cloudcast.name,
            slug: baseSlug,
            djId: dj._id,
            type: "mixcloud",
            genre,
            description: cloudcast.description || "",
            duration,
            audioUrl: cloudcast.url,
            coverImage,
            releaseDate,
            plays: 0,
            featured: false,
          });

          imported.push(cloudcast.name);
        } catch (error: unknown) {
          // Handles duplicate unique slugs and concurrent imports.
          if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
          ) {
            skipped.push(cloudcast.name);
          } else {
            console.error(
              `Failed to import cloudcast "${cloudcast.name}":`,
              error
            );
            errors.push(cloudcast.name);
          }
        }
      }

      nextUrl = result.paging?.next ?? null;
    }

    return NextResponse.json({
      success: errors.length === 0,
      username,
      djId: String(dj._id),
      pagesFetched: pages,
      importedCount: imported.length,
      skippedCount: skipped.length,
      errorCount: errors.length,
      imported,
      skipped,
      errors,
    });
  } catch (error: unknown) {
    console.error("Mixcloud import failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to import Mixcloud mixes",
      },
      { status: 500 }
    );
  }
}
