import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DJ from "@/models/DJ";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    
    const slug = searchParams.get("slug");
    const featured = searchParams.get("featured") === "true";

    let query: any = {}; 

    // Filter by slug if provided
    if (slug) {
      query.slug = slug.toLowerCase();   // case-insensitive match
    }

    // Keep existing featured filter
    if (featured) {
      query.featured = true;
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
