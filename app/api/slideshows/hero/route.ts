import { NextResponse } from "next/server";
import  dbConnect from "@/lib/db";
import Slideshow from "@/models/Slideshow";

export async function GET() {
  try {
    await dbConnect();

    const slideshow = await Slideshow.findOne({
      slug: "hero",
      isPublic: true,
    }).lean();

    if (!slideshow) {
      return NextResponse.json(
        { error: "Hero slideshow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(slideshow);
  } catch (error) {
    console.error("Hero slideshow API error:", error);

    return NextResponse.json(
      { error: "Failed to load slideshow" },
      { status: 500 }
    );
  }
}