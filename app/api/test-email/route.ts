import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { transporter } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const ticketCode = "TEST-" + Date.now();

    const ticketUrl =
      `${process.env.NEXT_PUBLIC_SITE_URL}/tickets/${ticketCode}`;

    const qrCode = await QRCode.toDataURL(ticketUrl);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🎟 Test Ticket",

      html: `
        <div style="font-family:Arial;padding:20px">

          <h1>Your Test Ticket</h1>

          <p>
            This is a test ticket email.
          </p>

          <p>
            <strong>Ticket Code:</strong>
            ${ticketCode}
          </p>

          <p>
            <strong>Ticket URL:</strong><br/>
            <a href="${ticketUrl}">
              ${ticketUrl}
            </a>
          </p>

          <br/>

          <img
            src="${qrCode}"
            width="250"
            height="250"
          />

        </div>
      `,
    });

    console.log("✅ Email sent:", email);

    return NextResponse.json({
      success: true,
      email,
    });
  } catch (error) {
    console.error("❌ Email error:", error);

    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
}
