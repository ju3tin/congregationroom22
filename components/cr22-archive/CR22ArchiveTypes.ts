// components/cr22-archive/CR22ArchiveTypes.ts

export interface CR22ArchiveDate {
    year: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
  }
  
  export type CR22ArchiveMediaType =
    | "image"
    | "youtube"
    | "instagram"
    | "tiktok"
    | "other";
  
  export type CR22ArchiveMediaFilter = "all" | CR22ArchiveMediaType;
  
  export interface CR22ArchiveMedia {
    type?: string;
    url?: string;
    caption?: string;
    credit?: string;
    thumbnail?: string;
  }
  
  export interface CR22ArchiveEvent {
    _id?: string;
    id?: string;
    start_date: CR22ArchiveDate;
    end_date?: CR22ArchiveDate;
    title: string;
    text?: string;
    group?: string;
    background?: {
      color?: string;
      url?: string;
    };
    media?: CR22ArchiveMedia;
  }
  
  export interface CR22ArchiveIndexEvent {
    key: string;
    id?: string;
    start_date: CR22ArchiveDate;
    title: string;
    mediaType: CR22ArchiveMediaType;
  }
  
  export function getCR22ArchiveMediaType(
    value?: string
  ): CR22ArchiveMediaType {
    const type = (value || "").toLowerCase();
  
    if (type.includes("instagram")) return "instagram";
    if (type.includes("tiktok")) return "tiktok";
    if (type.includes("youtube")) return "youtube";
  
    if (
      type.includes("image") ||
      type.includes("photo") ||
      type.includes("picture")
    ) {
      return "image";
    }
  
    return "other";
  }
  
  export function getCR22ArchiveEventKey(
    event: CR22ArchiveEvent
  ): string {
    return event.id || event._id || `${event.start_date.year}-${event.title}`;
  }
  
  export function formatCR22ArchiveDate(
    date: CR22ArchiveDate,
    includeTime = false
  ): string {
    const parsed = new Date(
      Date.UTC(
        date.year,
        (date.month ?? 1) - 1,
        date.day ?? 1,
        date.hour ?? 0,
        date.minute ?? 0,
        date.second ?? 0
      )
    );
  
    const formatted = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(parsed);
  
    return formatted;
  }
  
  export function cr22ArchivePlainText(value?: string): string {
    return (value || "")
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/\s+/g, " ")
      .trim();
  }