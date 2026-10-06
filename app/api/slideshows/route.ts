// app/api/slideshows/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Slideshow from "@/models/Slideshow";

export async function GET() {
  try {
    await dbConnect();

    const slideshows = await Slideshow.find({})
      .sort({
        createdAt: -1,
      })
      .lean()
      .exec();

    return NextResponse.json({
      success: true,
      count: slideshows.length,
      slideshows,
    });
  } catch (error) {
    console.error("Slideshows API error:", error);

    return NextResponse.json(
      {
        error: "Failed to load slideshows",
      },
      {
        status: 500,
      }
    );
  }
}