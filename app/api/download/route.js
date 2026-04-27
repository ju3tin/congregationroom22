export async function GET(req) {
    const url = new URL(req.url);
    const file = url.searchParams.get("file");
  
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/${file}`);
    const data = await res.arrayBuffer();
  
    return new Response(data, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${file}"`,
      },
    });
  }