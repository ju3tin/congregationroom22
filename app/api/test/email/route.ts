import { NextRequest, NextResponse } from "next/server";
import { sendTicketEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    console.log("📧 TEST EMAIL TO:", email);

    await sendTicketEmail({
      email,
      ticketCode: "TEST-EMAIL-123",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TEST",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.log("❌ EMAIL ERROR:", err.message);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
