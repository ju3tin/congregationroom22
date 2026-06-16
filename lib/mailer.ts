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
  qrCode,
}: {
  email: string;
  ticketCode: string;
  qrCode: string;
}) {
  console.log("📧 Sending email to:", email);

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🎟 Your Ticket",
    html: `
      <div style="font-family:Arial">
        <h2>Your Ticket</h2>

        <p><b>Ticket Code:</b> ${ticketCode}</p>

        <img src="${qrCode}" width="200" />

        <p>Please bring this QR code to entry.</p>
      </div>
    `,
  });

  console.log("📧 Email sent");
}
