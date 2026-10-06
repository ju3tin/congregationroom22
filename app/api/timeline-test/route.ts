import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,

    events: [
      {
        id: "image-test",

        start_date: {
          year: 2024,
          month: 1,
          day: 15,
        },

        title: "Normal Image",

        text: `
          <p>
            This is a normal image loaded from the website.
          </p>
        `,

        media: {
          type: "image",
          url: "/images/test.jpg",
          caption: "Test image",
          credit: "Congregation Room 22",
        },
      },

      {
        id: "youtube-test",

        start_date: {
          year: 2024,
          month: 4,
          day: 10,
        },

        title: "YouTube Video",

        text: `
          <p>
            This is a YouTube test.
          </p>
        `,

        media: {
          type: "youtube",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      },

      {
        id: "instagram-test",

        start_date: {
          year: 2024,
          month: 7,
          day: 20,
        },

        title: "Instagram Post",

        text: `
          <p>
            This is an Instagram test.
          </p>
        `,

        media: {
          type: "instagram",
          url: "https://www.instagram.com/p/DdtSOIRINmC/",
        },
      },

      {
        id: "tiktok-test",

        start_date: {
          year: 2024,
          month: 10,
          day: 5,
        },

        title: "TikTok Video",

        text: `
          <p>
            This is a TikTok test.
          </p>
        `,

        media: {
          type: "tiktok",
          url: "https://www.tiktok.com/@tiktok/video/6718335390845095173",
        },
      },
    ],
  });
}