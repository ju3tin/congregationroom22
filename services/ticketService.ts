import Ticket from "@/models/Ticket";
import Order from "@/models/Order";
import { generateQR } from "@/lib/qr";

export async function createTicketsFromOrder(orderId: string) {
  console.log("🎟 Creating tickets for order:", orderId);

  const order = await Order.findById(orderId);

  if (!order) throw new Error("Order not found");

  const createdTickets = [];

  for (const item of order.items) {
    if (item.itemType !== "ticket") continue;

    for (let i = 0; i < item.quantity; i++) {
      const ticketCode = `TKT-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      const qrCode = await generateQR(ticketCode);

      const ticket = await Ticket.create({
        ticketCode,

        orderId: order._id,
        userId: order.userId,
        eventId: item.eventId,
        tierId: item.tierId,

        tierName: item.name,
        eventTitle: item.name,
        eventDate: new Date(),
        venue: "TBA",

        status: "valid",
      });

      createdTickets.push({
        ticket,
        qrCode,
      });

      console.log("🎟 Ticket created:", ticketCode);
    }
  }

  return createdTickets;
}
