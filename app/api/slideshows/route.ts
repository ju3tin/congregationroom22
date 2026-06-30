import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Slideshow from "@/models/Slideshow";

export async function GET() {
  try {
    await dbConnect();

    const slideshows = await Slideshow.find({ 
      isPublic: true 
    })
    .sort({ featured: -1, createdAt: -1 })
    .lean();

    const formatted = slideshows.map((s: any) => ({
      _id: s._id.toString(),
      title: s.title,
      slug: s.slug,
      description: s.description,
      slidesCount: s.slides.length,
      theme: s.theme,
      featured: s.featured,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Slideshows API Error:", error);
    return NextResponse.json({ error: "Failed to fetch slideshows" }, { status: 500 });
  }
}
