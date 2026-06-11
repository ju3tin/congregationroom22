import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DJ from "@/models/DJ";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";

    let query = {};
    if (featured) {
      query = { featured: true };
    }

    const djs = await DJ.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(djs);
  } catch (error) {
    console.error("DJ API Error:", error);
    return NextResponse.json({ error: "Failed to fetch DJs" }, { status: 500 });
  }
}
