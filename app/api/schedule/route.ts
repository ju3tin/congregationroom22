import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Schedule from "@/models/Schedule";
import DJ from "@/models/DJ";

export async function GET() {
  try {
    await dbConnect();

    // Fetch schedule and populate DJ details
    const schedule = await Schedule.findOne()
      .populate({
        path: "slots.djId",
        model: DJ,
        select: "name slug genre image socialLinks", // Select what you need
      })
      .lean();

    if (!schedule || !schedule.slots?.length) {
      return NextResponse.json(
        { message: "No schedule found" },
        { status: 404 }
      );
    }

    // Transform data to make it frontend-friendly
    const formattedSlots = schedule.slots.map((slot: any) => ({
      _id: slot._id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      showName: slot.showName,
      dj: {
        _id: slot.djId?._id,
        name: slot.djId?.name || "Unknown DJ",
        slug: slot.djId?.slug,
        genre: slot.djId?.genre,
        image: slot.djId?.image,
        socialLinks: slot.djId?.socialLinks || {},
      },
    }));

    // Group by day (optional but very useful for UI)
    const groupedByDay = formattedSlots.reduce((acc: any, slot: any) => {
      const day = slot.dayOfWeek;
      if (!acc[day]) acc[day] = [];
      acc[day].push(slot);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      schedule: {
        _id: schedule._id,
        slots: formattedSlots,
        groupedByDay, // Helpful for displaying Monday, Tuesday, etc.
      },
    });
  } catch (error: any) {
    console.error("Schedule API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
