// app/api/djs/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DJ from "@/models/DJ";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const dj = await DJ.findOne({ 
      slug: slug.toLowerCase() 
    }).lean();

    if (!dj) {
      return NextResponse.json({ error: "DJ not found" }, { status: 404 });
    }

    return NextResponse.json(dj);
  } catch (error) {
    console.error("Single DJ API Error:", error);
    return NextResponse.json({ error: "Failed to fetch DJ" }, { status: 500 });
  }
}
