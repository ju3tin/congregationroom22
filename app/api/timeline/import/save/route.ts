
import { NextRequest, NextResponse } from "next/server";
//import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import TimelineEvents1 from "@/models/TimelineEvents1";

export const runtime = "nodejs";

type SaveBody = {
  title?: string;
  description?: string;
  url?: string;
  embedUrl?: string;
  thumbnail?: string;
  creator?: string;
  publishedAt?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  sortOrder?: number;
};

function isValidHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 4096) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function getStartDate(value?: string) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  try {
    // Admin authentication
    /*const session = await auth();
    const user = session?.user as
      | { id?: string; role?: string }
      | undefined;

    if (!user?.id || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }*/ // Commented out for now because we don't have an admin user yet                            

    const body = (await request.json().catch(() => null)) as
      | SaveBody
      | null;

    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const title = cleanText(body.title, 200);
    const description = cleanText(body.description, 10000);
    const url = cleanText(body.url, 4096);
    const embedUrl = cleanText(body.embedUrl, 4096);
    const thumbnail = cleanText(body.thumbnail, 4096);
    const creator = cleanText(body.creator, 200);
    const category = cleanText(body.category, 100) || "Instagram";

    if (!title || !description || !url) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, description and original post URL are required.",
        },
        { status: 400 }
      );
    }

    if (!isValidHttpUrl(url)) {
      return NextResponse.json(
        { success: false, error: "The original post URL is invalid." },
        { status: 400 }
      );
    }

    if (embedUrl && !isValidHttpUrl(embedUrl)) {
      return NextResponse.json(
        { success: false, error: "The media URL is invalid." },
        { status: 400 }
      );
    }

    if (thumbnail && !isValidHttpUrl(thumbnail)) {
      return NextResponse.json(
        { success: false, error: "The thumbnail URL is invalid." },
        { status: 400 }
      );
    }

    const startDate = getStartDate(body.publishedAt);

    if (!startDate) {
      return NextResponse.json(
        { success: false, error: "The publication date is invalid." },
        { status: 400 }
      );
    }

    const tags = Array.isArray(body.tags)
      ? [
          ...new Set(
            body.tags
              .filter((tag): tag is string => typeof tag === "string")
              .map((tag) => tag.trim().slice(0, 50))
              .filter(Boolean),
          ),
        ].slice(0, 20)
      : ["instagram"];

    await dbConnect();

    // Avoid importing the same source URL twice.
    const existing = await TimelineEvents1.findOne({
      "sources.url": url,
    }).select("_id title");

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          duplicate: true,
          message: "This post has already been imported.",
          event: {
            id: String(existing._id),
            title: existing.title,
          },
        },
        { status: 200 }
      );
    }

    const event = await TimelineEvents1.create({
      title,
      description,
      startDate,
      category,
      tags,
      media: {
        // Use the supplied embed/media URL, falling back to the post URL.
        url: embedUrl || url,
        caption: description,
        credit: creator,
        thumbnail,
      },
      sources: [
        {
          title: `${category} source`,
          url,
        },
      ],
      featured: body.featured === true,
      sortOrder:
        typeof body.sortOrder === "number" &&
        Number.isFinite(body.sortOrder)
          ? body.sortOrder
          : 0,
    });

    return NextResponse.json(
      {
        success: true,
        duplicate: false,
        message: "Timeline event imported successfully.",
        event: {
          id: String(event._id),
          title: event.title,
          category: event.category,
          startDate: event.startDate,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Timeline import save error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save the timeline event.",
      },
      { status: 500 }
    );
  }
}
