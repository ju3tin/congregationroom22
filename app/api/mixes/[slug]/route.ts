import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Mix from "@/models/Mix";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();

    const mix = await Mix.findOne({ slug: params.slug })
      .populate("djId", "name slug")
      .lean();

    if (!mix) {
      return NextResponse.json({ error: "Mix not found" }, { status: 404 });
    }

    const formattedMix = {
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
    };

    return NextResponse.json(formattedMix);
  } catch (error) {
    console.error("Mix API Error:", error);
    return NextResponse.json({ error: "Failed to fetch mix" }, { status: 500 });
  }
}
