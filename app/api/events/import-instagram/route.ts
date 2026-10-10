
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TimelineEvent from "@/models/TimelineEvent00";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getStartDate(item: any) {
  const rawDate = item.timestamp ?? item.createTimeISO;

  if (!rawDate) return null;

  const date =
    typeof rawDate === "number"
      ? new Date(rawDate * 1000)
      : new Date(rawDate);

  if (Number.isNaN(date.getTime())) return null;

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
  };
}

function normalizeInstagram(item: any) {
  const shortcode = String(item.shortCode ?? "");
  const url = String(
    item.url ??
      (shortcode
        ? `https://www.instagram.com/p/${shortcode}/`
        : "")
  );

  const start_date = getStartDate(item);

  if (!url || !start_date) return null;

  // Use the shortcode as the stable identifier where available.
  const eventId = shortcode
    ? `instagram-${shortcode}`
    : `instagram-${String(item.id ?? "")}`;

  if (eventId === "instagram-") return null;

  const caption = String(item.caption ?? item.text ?? "");
  const postType = String(
    item.type ?? item.productType ?? "feed"
  ).toLowerCase();

  const isReel =
    postType === "reel" ||
    postType === "clips" ||
    url.includes("/reel/");

  return {
    id: eventId,
    start_date,
    text: `<p>${escapeHtml(caption).replace(/\r?\n/g, "<br>")}</p>`,
    media: {
      url,
      type: "instagram",
      caption: escapeHtml(caption),
    },
    // Retain source metadata if your schema permits it.
    source: "instagram",
    postType: isReel ? "reel" : "post",
  };
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const items = Array.isArray(body)
      ? body
      : Array.isArray(body.posts)
        ? body.posts
        : null;

    if (!items) {
      return NextResponse.json(
        {
          success: false,
          error: "Send an array of Instagram records or { posts: [...] }",
        },
        { status: 400 }
      );
    }

    const normalized = items
      .map(normalizeInstagram)
      .filter(Boolean);

    const skipped = items.length - normalized.length;

    if (!normalized.length) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid Instagram records with URLs and dates were found.",
          received: items.length,
          skipped,
        },
        { status: 400 }
      );
    }

    const operations = normalized.map((event: any) => {
      // Remove optional source fields if the current schema doesn't define them.
      const { source, postType, ...timelineEvent } = event;

      return {
        updateOne: {
          filter: { id: timelineEvent.id },
          update: { $set: timelineEvent },
          upsert: true,
        },
      };
    });

    const result = await TimelineEvent.bulkWrite(operations);

    return NextResponse.json({
      success: true,
      received: items.length,
      imported: normalized.length,
      skipped,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      mediaType: "instagram",
    });
  } catch (error) {
    console.error("Instagram bulk import error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Instagram import failed",
      },
      { status: 500 }
    );
  }
}
