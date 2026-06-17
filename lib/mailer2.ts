// /lib/mailer.ts

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendTicketEmail({
  email,
  ticketCode,
  eventTitle,
  eventDate,
  venue,
}: {
  email: string;
  ticketCode: string;
  eventTitle: string;
  eventDate: Date;
  venue: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const ticketUrl = `${siteUrl}/tickets/${ticketCode}`;
  const qrUrl = `${siteUrl}/api/tickets/${ticketCode}/qr`;

  await transporter.sendMail({
    from: `"Tickets" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Ticket - ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h1>${eventTitle}</h1>

        <p>
          <strong>Ticket Code:</strong><br />
          ${ticketCode}
        </p>

        <p>
          <strong>Date:</strong><br />
          ${new Date(eventDate).toLocaleString()}
        </p>

        <p>
          <strong>Venue:</strong><br />
          ${venue}
        </p>

        <p>
          <a href="${ticketUrl}">
            View Ticket
          </a>
        </p>

        <p>
          Scan this QR code at the door:
        </p>

        <img
          src="${qrUrl}"
          width="250"
          height="250"
          alt="Ticket QR Code"
        />
      </div>
    `,
  });

  console.log("📧 Ticket email sent:", email);
}
