import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Slideshow from "@/models/Slideshow";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    if (typeof body.isPublic !== "boolean") {
      return NextResponse.json(
        { error: "isPublic must be a boolean" },
        { status: 400 }
      );
    }

    await dbConnect();

    const slideshow = await Slideshow.findByIdAndUpdate(
      id,
      {
        $set: {
          isPublic: body.isPublic,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!slideshow) {
      return NextResponse.json(
        { error: "Slideshow not found" },
        { status: 404 }
      );
    }

    console.log("Visibility updated:", {
      id,
      isPublic: slideshow.isPublic,
    });

    return NextResponse.json({
      success: true,
      isPublic: slideshow.isPublic,
    });
  } catch (error) {
    console.error("Visibility update error:", error);

    return NextResponse.json(
      { error: "Failed to update visibility" },
      { status: 500 }
    );
  }
}