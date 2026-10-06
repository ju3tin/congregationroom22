// app/api/slideshows/hero/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Slideshow from "@/models/Slideshow";

export async function GET() {
  try {
    await dbConnect();

    const slideshow = await Slideshow.findOne({
      slug: "hero",
      isPublic: true,
    })
      .lean()
      .exec();

    if (!slideshow) {
      return NextResponse.json(
        {
          error: "No public hero slideshow found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        slideshow,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Hero slideshow API error:", error);

    return NextResponse.json(
      {
        error: "Failed to load hero slideshow",
      },
      {
        status: 500,
      }
    );
  }
}