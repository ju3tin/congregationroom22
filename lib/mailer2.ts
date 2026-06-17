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
  tickets,
}: {
  email: string;
  tickets: {
    ticketCode: string;
    eventTitle: string;
    eventDate: Date;
    venue: string;
  }[];
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const htmlTickets = tickets
    .map((ticket) => {
      const ticketUrl = `${siteUrl}/tickets/${ticket.ticketCode}`;
      const qrUrl = `${siteUrl}/api/tickets/${ticket.ticketCode}/qr`;

      return `
        <div style="border:1px solid #ddd;padding:16px;margin-bottom:16px;border-radius:8px;">
          <h2>${ticket.eventTitle}</h2>

          <p><strong>Ticket Code:</strong><br>${ticket.ticketCode}</p>

          <p><strong>Date:</strong><br>
          ${new Date(ticket.eventDate).toLocaleString()}</p>

          <p><strong>Venue:</strong><br>${ticket.venue}</p>

          <p>
            <a href="${ticketUrl}">View Ticket</a>
          </p>

          <img src="${qrUrl}" width="220" height="220" />
        </div>
      `;
    })
    .join("");

  await transporter.sendMail({
    from: `"Tickets" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Tickets`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h1>Your Event Tickets</h1>
        ${htmlTickets}
      </div>
    `,
  });

  console.log("📧 Ticket email sent:", email);
}
