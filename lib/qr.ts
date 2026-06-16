import QRCode from "qrcode";

export async function generateQR(ticketCode: string) {
  console.log("🔲 Generating QR:", ticketCode);

  const qr = await QRCode.toDataURL(ticketCode, {
    width: 300,
    margin: 2,
    errorCorrectionLevel: "H",
  });

  return qr;
}
