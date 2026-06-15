// app/api/homepage/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";

import DJ from "@/models/DJ";
import Event from "@/models/Event";
import Mix from "@/models/Mix";

export async function GET() {
  try {
    await dbConnect();

    const [featuredDJs, featuredEvents, featuredMixes] =
      await Promise.all([
        DJ.find({ featured: true })
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),

        Event.find({
          featured: true,
          status: "published",
        })
          .sort({ date: 1 })
          .limit(6)
          .lean(),

        Mix.find({ featured: true })
          .sort({ releaseDate: -1 })
          .limit(12)
          .lean(),
      ]);

    return NextResponse.json({
      featuredDJs,
      featuredEvents,
      featuredMixes,
    });
  } catch (error) {
    console.error("Homepage API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to load homepage data",
      },
      {
        status: 500,
      }
    );
  }
}
