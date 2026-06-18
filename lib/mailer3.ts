import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

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

  console.log("📧 MAILER START:", email, ticketCode);

  const { data, error } = await resend.emails.send({
    from: "Tickets <onboarding@resend.dev>", // ⚠️ MUST work immediately for testing
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

  if (error) {
    console.error("❌ RESEND ERROR:", error);
    throw new Error(error.message);
  }

  console.log("📧 MAIL SENT OK:", data?.id);

  return data;
}
