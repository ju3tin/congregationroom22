import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,

    events: [
      /*
       * 1. IMAGE
       * Tests:
       * - id
       * - start_date
       * - end_date
       * - title
       * - text
       * - media
       * - caption
       * - credit
       * - group
       * - background
       */
      {
        id: "image-test",

        start_date: {
          year: 2024,
          month: 1,
          day: 15,
          hour: 10,
          minute: 30,
        },

        end_date: {
          year: 2024,
          month: 1,
          day: 16,
          hour: 14,
          minute: 45,
        },

        title: "Normal Image",

        text: `
          <p>
            This is a normal TimelineJS image event.
          </p>

          <p>
            It demonstrates an event with a start date,
            end date, title, text, group and background.
          </p>
        `,

        group: "Images",

        background: {
          color: "#f3f4f6",
        },

        media: {
          type: "image",
          url: "/images/test.jpg",
          caption: "Example TimelineJS image",
          credit: "Congregation Room 22",
        },
      },

      /*
       * 2. YOUTUBE
       */
      {
        id: "youtube-test",

        start_date: {
          year: 2024,
          month: 4,
          day: 10,
          hour: 12,
          minute: 0,
        },

        title: "YouTube Video",

        text: `
          <p>
            This is a YouTube video embedded through TimelineJS.
          </p>

          <p>
            YouTube URLs can be normal watch URLs,
            youtu.be URLs, Shorts, Live or embed URLs.
          </p>
        `,

        group: "Video",

        background: {
          color: "#fff1f2",
        },

        media: {
          type: "youtube",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
      },

      /*
       * 3. INSTAGRAM
       */
      {
        id: "instagram-test",

        start_date: {
          year: 2024,
          month: 7,
          day: 20,
          hour: 15,
          minute: 30,
        },

        end_date: {
          year: 2024,
          month: 7,
          day: 21,
        },

        title: "Instagram Post",

        text: `
          <p>
            This is an Instagram post using the
            direct Instagram embed iframe.
          </p>

          <p>
            TimelineJS does not use Instagram oEmbed
            for this event.
          </p>
        `,

        group: "Social Media",

        background: {
          color: "#fdf2f8",
        },

        media: {
          type: "instagram",
          url: "https://www.instagram.com/p/DdtSOIRINmC/",
        },
      },

      /*
       * 4. TIKTOK
       */
      {
        id: "tiktok-test",

        start_date: {
          year: 2024,
          month: 10,
          day: 5,
          hour: 18,
          minute: 0,
        },

        title: "TikTok Video",

        text: `
          <p>
            This is a TikTok video using TikTok's
            official Player iframe.
          </p>

          <p>
            The TikTok video is loaded using its
            video ID.
          </p>
        `,

        group: "Social Media",

        background: {
          color: "#f0f9ff",
        },

        media: {
          type: "tiktok",
          url:
            "https://www.tiktok.com/@tiktok/video/6718335390845095173",
        },
      },

      /*
       * 5. EVENT WITHOUT MEDIA
       *
       * Tests a normal text-only TimelineJS event.
       */
      {
        id: "text-only-test",

        start_date: {
          year: 2025,
          month: 1,
          day: 10,
          hour: 9,
          minute: 15,
          second: 30,
        },

        title: "Text Only Event",

        text: `
          <p>
            This event has no media.
          </p>

          <p>
            It tests TimelineJS text content,
            including HTML.
          </p>

          <ul>
            <li>HTML paragraph</li>
            <li>HTML list</li>
            <li>TimelineJS event text</li>
          </ul>
        `,

        group: "Text",

        background: {
          color: "#fefce8",
        },
      },

      /*
       * 6. FULL DATE TEST
       *
       * Tests year/month/day/hour/minute/second.
       */
      {
        id: "full-date-test",

        start_date: {
          year: 2025,
          month: 3,
          day: 25,
          hour: 14,
          minute: 35,
          second: 20,
        },

        end_date: {
          year: 2025,
          month: 3,
          day: 25,
          hour: 17,
          minute: 45,
          second: 50,
        },

        title: "Full Date and Time",

        text: `
          <p>
            This event tests all supported date
            and time fields.
          </p>

          <p>
            Start:
            25 March 2025 at 14:35:20
          </p>

          <p>
            End:
            25 March 2025 at 17:45:50
          </p>
        `,

        group: "Date Tests",

        background: {
          color: "#f0fdf4",
        },
      },

      /*
       * 7. BACKGROUND IMAGE TEST
       */
      {
        id: "background-image-test",

        start_date: {
          year: 2025,
          month: 6,
          day: 15,
        },

        title: "Background Image",

        text: `
          <p>
            This event tests a TimelineJS background image.
          </p>
        `,

        group: "Background",

        background: {
          url: "/images/test.jpg",
        },
      },

      /*
       * 8. GROUP TEST
       */
      {
        id: "group-a-test",

        start_date: {
          year: 2025,
          month: 8,
          day: 1,
        },

        title: "Group A Event",

        text: `
          <p>
            This event belongs to Group A.
          </p>
        `,

        group: "Group A",
      },

      /*
       * 9. SECOND GROUP TEST
       */
      {
        id: "group-b-test",

        start_date: {
          year: 2025,
          month: 8,
          day: 15,
        },

        title: "Group B Event",

        text: `
          <p>
            This event belongs to Group B.
          </p>
        `,

        group: "Group B",
      },

      /*
       * 10. YOUTUBE SHORT
       *
       * Tests the YouTube URL parser.
       */
      {
        id: "youtube-short-test",

        start_date: {
          year: 2025,
          month: 9,
          day: 10,
        },

        title: "YouTube Short",

        text: `
          <p>
            This tests a YouTube Shorts URL.
          </p>
        `,

        group: "YouTube",

        media: {
          type: "youtube",

          url:
            "https://www.youtube.com/shorts/dQw4w9WgXcQ",
        },
      },

      /*
       * 11. YOUTUBE SHORT URL
       */
      {
        id: "youtube-short-link-test",

        start_date: {
          year: 2025,
          month: 9,
          day: 20,
        },

        title: "YouTube Short Link",

        text: `
          <p>
            This tests a short YouTube URL.
          </p>
        `,

        group: "YouTube",

        media: {
          type: "youtube",

          url:
            "https://youtu.be/dQw4w9WgXcQ",
        },
      },

      /*
       * 12. INSTAGRAM REEL
       *
       * Tests the Instagram /reel/ parser.
       */
      {
        id: "instagram-reel-test",

        start_date: {
          year: 2025,
          month: 10,
          day: 1,
        },

        title: "Instagram Reel",

        text: `
          <p>
            This tests an Instagram Reel URL.
          </p>
        `,

        group: "Instagram",

        media: {
          type: "instagram",

          /*
           * Replace this with a real public Reel
           * if you want to test it.
           */
          url:
            "https://www.instagram.com/reel/DdtSOIRINmC/",
        },
      },

      /*
       * 13. SECOND IMAGE
       *
       * Tests another image and caption.
       */
      {
        id: "second-image-test",

        start_date: {
          year: 2025,
          month: 11,
          day: 15,
        },

        title: "Second Image",

        text: `
          <p>
            Another image event for testing
            navigation between multiple media types.
          </p>
        `,

        group: "Images",

        media: {
          type: "image",

          url: "/images/test.png",

          caption:
            "Second test image",

          credit:
            "Congregation Room 22",
        },
      },

      /*
       * 14. FINAL EVENT
       *
       * Useful for testing navigation to the
       * very end of the timeline.
       */
      {
        id: "final-test",

        start_date: {
          year: 2026,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
        },

        title: "Timeline Test Complete",

        text: `
          <p>
            This is the final test event.
          </p>

          <p>
            If you can navigate from the first
            event to this event, the timeline
            navigation is working correctly.
          </p>
        `,

        group: "Final",

        background: {
          color: "#f5f3ff",
        },
      },
    ],
  });
}