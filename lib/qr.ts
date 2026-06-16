import QRCode from "qrcode";

export async function generateQR(text: string) {
  try {
    console.log("🔲 Generating QR for:", text);

    const qr = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
    });

    console.log("✅ QR generated successfully");

    return qr; // base64 image
  } catch (err) {
    console.log("❌ QR generation failed:", err);
    return null;
  }
}
