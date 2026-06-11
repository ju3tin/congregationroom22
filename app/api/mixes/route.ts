import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Mix from "@/models/Mix";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";

    let query = {};
    if (featured) {
      query = { featured: true };
    }

    const mixes = await Mix.find(query)
      .sort({ releaseDate: -1 })
      .populate("djId", "name") // Optional: get DJ name
      .lean();

    return NextResponse.json(mixes);
  } catch (error) {
    console.error("Mixes API Error:", error);
    return NextResponse.json({ error: "Failed to fetch mixes" }, { status: 500 });
  }
}
