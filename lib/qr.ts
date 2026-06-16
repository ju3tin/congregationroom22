import QRCode from "qrcode";

export async function generateQR(ticketCode: string) {
  return await QRCode.toDataURL(ticketCode);
}
