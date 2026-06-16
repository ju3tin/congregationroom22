import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Ticket from "@/models/Ticket";
import { generateQR } from "@/lib/qr";
import { sendTicketEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  console.log("🔥 TEST ORDER START");

  try {
    const body = await req.json();

    const {
      email,
      eventId,
      eventTitle,
      venue,
      userId,
    } = body;

    console.log("📦 Body:", body);

    await dbConnect();

    const ticketCode = `TEST-${Date.now()}`;

    console.log("🎟 Creating ticket:", ticketCode);

    const ticket = await Ticket.create({
      ticketCode,
      orderId: null,
      eventId,
      userId,
      tierId: null,

      tierName: "Test Ticket",
      eventTitle: eventTitle || "Test Event",
      eventDate: new Date(),
      venue: venue || "Test Venue",

      status: "valid",
    });

    console.log("✅ Ticket created:", ticket._id);

    const qrCode = await generateQR(ticketCode);

    console.log("🔲 QR generated");

    if (email) {
      console.log("📧 Sending email to:", email);

      await sendTicketEmail({
        email,
        ticketCode,
        qrCode,
      });

      console.log("✅ Email sent");
    } else {
      console.log("⚠️ No email provided");
    }

    return NextResponse.json({
      success: true,
      ticket,
      ticketCode,
    });
  } catch (err: any) {
    console.log("❌ ERROR:", err.message);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
