import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Slideshow from "@/models/Slideshow";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();

    const slideshow = await Slideshow.findOne({ 
      slug: params.slug,
      isPublic: true 
    }).lean();

    if (!slideshow) {
      return NextResponse.json({ error: "Slideshow not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: slideshow._id.toString(),
      title: slideshow.title,
      slug: slideshow.slug,
      description: slideshow.description,
      slides: slideshow.slides,
      theme: slideshow.theme,
      featured: slideshow.featured,
    });
  } catch (error) {
    console.error("Single Slideshow API Error:", error);
    return NextResponse.json({ error: "Failed to fetch slideshow" }, { status: 500 });
  }
}
