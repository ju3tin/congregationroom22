import QRCode from "qrcode";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticketCode: string }> }
) {
  const { ticketCode } = await params;

  const ticketUrl =
    `${process.env.NEXT_PUBLIC_SITE_URL}/tickets/${ticketCode}`;

  const png = await QRCode.toBuffer(ticketUrl);

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
    },
  });
}
