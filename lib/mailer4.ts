import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // MUST be App Password
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

  console.log("📧 EMAIL START:", email, ticketCode);

  try {
    const info = await transporter.sendMail({
      from: `"Tickets" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎟 Your Ticket - ${eventTitle}`,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>${eventTitle}</h2>

          <p><b>Ticket Code:</b> ${ticketCode}</p>
          <p><b>Date:</b> ${new Date(eventDate).toLocaleString()}</p>
          <p><b>Venue:</b> ${venue}</p>

          <hr />

          <p>
            <a href="${ticketUrl}">View Ticket</a>
          </p>

          <img src="${qrUrl}" width="220" />
        </div>
      `,
    });

    console.log("📧 EMAIL SENT:", info.messageId);

    return info;
  } catch (err: any) {
    console.error("❌ EMAIL ERROR:", err.message);
    throw err;
  }
}
