
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TimelineEvent from "@/models/TimelineEvent00";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getStartDate(value: any) {
  const date = value?.createTimeISO
    ? new Date(value.createTimeISO)
    : value?.createTime
      ? new Date(Number(value.createTime) * 1000)
      : null;

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
  };
}

function normalizeTikTok(item: any) {
  const id = String(item.id ?? item.videoId ?? "");
  const url = item.webVideoUrl;

  if (!id || !url || !getStartDate(item)) {
    return null;
  }

  const caption = String(item.text ?? "");
  const text = `<p>${escapeHtml(caption).replace(/\r?\n/g, "<br>")}</p>`;

  return {
    id: `tiktok-${id}`,
    start_date: getStartDate(item),
    text,
    media: {
      url,
      type: "tiktok",
      caption: escapeHtml(caption),
    },
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
          error: "Send an array of TikTok records or { posts: [...] }",
        },
        { status: 400 }
      );
    }

    const normalized = items
      .map(normalizeTikTok)
      .filter(Boolean);

    const skipped = items.length - normalized.length;

    if (normalized.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid TikTok posts found.",
          received: items.length,
          skipped,
        },
        { status: 400 }
      );
    }

    const operations = normalized.map((event: any) => ({
      updateOne: {
        filter: { id: event.id },
        update: { $set: event },
        upsert: true,
      },
    }));

    const result = await TimelineEvent.bulkWrite(operations);

    return NextResponse.json({
      success: true,
      received: items.length,
      imported: normalized.length,
      skipped,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    });
} catch (error) {
    console.error("TikTok bulk import error:", error);
  
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
        stack:
          process.env.NODE_ENV === "development" &&
          error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
