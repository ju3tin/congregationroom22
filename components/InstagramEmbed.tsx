
"use client";

type InstagramEmbedProps = {
  url: string;
};

export default function InstagramEmbed({
  url,
}: InstagramEmbedProps) {
  let embedUrl: string;

  try {
    const parsed = new URL(url);

    if (
      !["instagram.com", "www.instagram.com"].includes(
        parsed.hostname
      ) ||
      !["/p/", "/reel/", "/tv/"].some((path) =>
        parsed.pathname.startsWith(path)
      )
    ) {
      throw new Error("Invalid Instagram URL");
    }

    embedUrl = `https://www.instagram.com${parsed.pathname.replace(/\/?$/, "/")}embed/`;
  } catch {
    return <p>Invalid Instagram post or Reel URL.</p>;
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 540,
        margin: "0 auto",
      }}
    >
      <iframe
        src={embedUrl}
        title="Instagram video"
        width="100%"
        height="700"
        style={{
          border: 0,
          overflow: "hidden",
        }}
        scrolling="no"
        allow="encrypted-media; clipboard-write; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
