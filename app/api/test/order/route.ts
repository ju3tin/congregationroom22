import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Ticket from "@/models/Ticket";
import { generateQR } from "@/lib/qr";
import { sendTicketEmail } from "@/lib/mailer";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  console.log("🔥 TEST ORDER FLOW START");

  try {
    const body = await req.json();

    const email = body.email;

    await dbConnect();

    // ==============================
    // 1. CREATE ORDER FIRST
    // ==============================
    const orderId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const order = await Order.create({
      _id: orderId,

      orderNumber: `ORD-${Date.now()}`,
      userId,

      type: "ticket",

      items: [
        {
          itemType: "ticket",
          eventId: new mongoose.Types.ObjectId(),
          tierId: new mongoose.Types.ObjectId(),
          quantity: 1,
          unitPrice: 20,
          name: body.eventTitle || "Test Event Ticket",
        },
      ],

      subtotal: 20,
      discount: 0,
      total: 20,

      paypalOrderId: "TEST_PAYPAL",
      status: "paid",
    });

    console.log("✅ Order created:", order._id);

    // ==============================
    // 2. CREATE TICKET FROM ORDER
    // ==============================
    const item = order.items[0];

    const ticketCode = `TKT-${Date.now()}`;

    const ticket = await Ticket.create({
      ticketCode,

      orderId: order._id,
      userId: order.userId,
      eventId: item.eventId!,
      tierId: item.tierId!,

      tierName: item.name,
      eventTitle: body.eventTitle || "Test Event",
      eventDate: new Date(),
      venue: body.venue || "Test Venue",

      status: "valid",
    });

    console.log("🎟 Ticket created:", ticket._id);

    // ==============================
    // 3. QR CODE
    // ==============================
    const qrCode = await generateQR(ticketCode);

    // ==============================
    // 4. EMAIL
    // ==============================
    if (email) {
      await sendTicketEmail({
        email,
        ticketCode,
        qrCode,
      });

      console.log("📧 Email sent");
    }

    return NextResponse.json({
      success: true,
      order,
      ticket,
    });
  } catch (err: any) {
    console.log("❌ ERROR:", err.message);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
