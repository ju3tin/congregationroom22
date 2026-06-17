import dbConnect from "@/lib/db";
import Ticket from "@/models/Ticket";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

export const dynamic = "force-dynamic";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ ticketCode: string }>;
}) {
  const { ticketCode } = await params;

  await dbConnect();

  const ticket = await Ticket.findOne({
    ticketCode,
  }).lean();

  if (!ticket) {
    notFound();
  }

  const ticketUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/tickets/${ticket.ticketCode}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-xl border bg-card p-8 shadow-lg">

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">
              🎟 Event Ticket
            </h1>

            <p className="text-muted-foreground mt-2">
              Present this ticket at the entrance
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-8">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                value={ticketUrl}
                size={250}
              />
            </div>
          </div>

          {/* Ticket Info */}
          <div className="space-y-4">

            <div>
              <p className="text-sm text-muted-foreground">
                Ticket Code
              </p>
              <p className="font-mono text-lg font-bold">
                {ticket.ticketCode}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Event
              </p>
              <p className="text-xl font-semibold">
                {ticket.eventTitle}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Venue
              </p>
              <p>{ticket.venue}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Date & Time
              </p>
              <p>
                {new Date(ticket.eventDate).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Status
              </p>

              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  ticket.status === "valid"
                    ? "bg-green-500/20 text-green-500"
                    : ticket.status === "used"
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "bg-red-500/20 text-red-500"
                }`}
              >
                {ticket.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Ticket URL */}
          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-muted-foreground mb-2">
              Ticket URL
            </p>

            <a
              href={ticketUrl}
              className="text-primary break-all hover:underline"
            >
              {ticketUrl}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
