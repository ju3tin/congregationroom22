import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Mix from "@/models/Mix";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");

    let query = {};

    if (featured) {
      query = { featured: true };
    }

    const mixes = await Mix.find(query)
      .sort({ releaseDate: -1 })
      .limit(limit)
      .populate("djId", "name slug") // Populate DJ name and slug
      .lean();

    const formattedMixes = mixes.map((mix: any) => ({
      _id: mix._id.toString(),
      title: mix.title,
      slug: mix.slug,
      djId: mix.djId?._id?.toString(),
      djName: mix.djId?.name || "Unknown DJ",
      djSlug: mix.djId?.slug,
      genre: mix.genre,
      description: mix.description,
      duration: mix.duration,
      audioUrl: mix.audioUrl,
      coverImage: mix.coverImage,
      releaseDate: mix.releaseDate,
      plays: mix.plays || 0,
      featured: mix.featured || false,
      createdAt: mix.createdAt,
    }));

    return NextResponse.json(formattedMixes);
  } catch (error) {
    console.error("Mixes API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mixes" },
      { status: 500 }
    );
  }
}
