import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Mix from "@/models/Mix";

function normalizeMixcloudUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.hostname === "www.mixcloud.com" ||
      parsedUrl.hostname === "mixcloud.com"
    ) {
      parsedUrl.hostname = "api.mixcloud.com";
    }

    return parsedUrl.toString();
  } catch {
    return url;
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";
    const limit = Math.max(
      1,
      Math.min(parseInt(searchParams.get("limit") || "100", 10) || 10, 100)
    );

    let query = {};

    if (featured) {
      query = { featured: true };
    }

    const mixes = await Mix.find(query)
      .sort({ releaseDate: -1 })
      .limit(limit)
      .populate("djId", "name slug")
      .lean();

    const formattedMixes = mixes.map((mix: any) => {
      let audioUrl = mix.audioUrl;

      // Normalize Mixcloud URLs only for Mixcloud mixes
      if (mix.type === "mixcloud" && typeof audioUrl === "string") {
        audioUrl = normalizeMixcloudUrl(audioUrl);
      }

      return {
        _id: mix._id.toString(),
        title: mix.title,
        slug: mix.slug,
        type: mix.type,
        djId: mix.djId?._id?.toString(),
        djName: mix.djId?.name || "Unknown DJ",
        djSlug: mix.djId?.slug,
        genre: mix.genre,
        description: mix.description,
        duration: mix.duration,
        audioUrl,
        coverImage: mix.coverImage,
        releaseDate: mix.releaseDate,
        plays: mix.plays || 0,
        featured: mix.featured || false,
        createdAt: mix.createdAt,
      };
    });

    return NextResponse.json(formattedMixes);
  } catch (error) {
    console.error("Mixes API Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch mixes" },
      { status: 500 }
    );
  }
}
