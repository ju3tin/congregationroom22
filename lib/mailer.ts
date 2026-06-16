import nodemailer from "nodemailer";

export async function sendTicketEmail({
  email,
  ticketCode,
  qrCode,
}: {
  email: string;
  ticketCode: string;
  qrCode: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Event Tickets" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🎟 Your Ticket",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>🎉 Payment Successful</h2>

        <p><strong>Your Ticket Code:</strong></p>
        <h3>${ticketCode}</h3>

        <p>Scan this QR at entry:</p>

        <img src="${qrCode}" width="220" />

        <p style="margin-top:20px;color:#666;font-size:12px;">
          Please keep this email for entry.
        </p>
      </div>
    `,
  });
}
