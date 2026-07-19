import PDFDocument from "pdfkit";
import { Resend } from "resend";
import { Buffer } from "node:buffer";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "NLSC <api@nlscug.com>";
const TO_EMAILS = ["namandisafari@gmail.com", "info.clickandlearnict@gmail.com"];
const ORG_NAME = "Habico";

const ref = "NSIS-" + crypto.randomUUID().slice(0, 8).toUpperCase();
const tid = "TID 139893388876";
const paidDate = new Date("2026-07-10T18:30:00+03:00");
const total = 300_000;
const currency = "UGX";

function buildReceiptPdf(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, info: { Title: `Receipt ${ref}`, Author: "NLSC" } });

    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pw = doc.page.width - 100;
    const green = "#16a34a";
    const ink = "#0f172a";
    const muted = "#64748b";
    const lightBg = "#f0fdf4";

    // green top bar
    doc.rect(50, 50, pw, 6).fill(green);

    // PAID watermark stamp
    doc.save();
    doc.fontSize(48).font("Helvetica-Bold").fillColor("#16a34a").opacity(0.08);
    doc.text("PAID", 50, 220, { width: pw, align: "center" });
    doc.restore();

    // header
    doc.fillColor(ink).fontSize(26).font("Helvetica-Bold").text("NLSC", 50, 72);
    doc.fillColor(muted).fontSize(9).font("Helvetica").text("Nile Logic & Secure Cloud Ltd", 50, 104);

    doc.fillColor(ink).fontSize(20).font("Helvetica-Bold").text("PAYMENT RECEIPT", doc.page.width - 50 - 150, 72, { width: 150, align: "right" });
    doc.fillColor(green).fontSize(9).font("Helvetica").text(`# ${ref}`, doc.page.width - 50 - 150, 100, { width: 150, align: "right" });

    // meta
    const dateStr = paidDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const timeStr = paidDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    doc.fillColor(muted).fontSize(9).font("Helvetica");
    doc.text(`Date Paid: ${dateStr}`, 50, 135);
    doc.text(`Time: ${timeStr}`, 50, 150);
    doc.text(`Transaction: ${tid}`, doc.page.width - 50 - 200, 135, { width: 200, align: "right" });
    doc.text(`Currency: ${currency}`, doc.page.width - 50 - 200, 150, { width: 200, align: "right" });

    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, 170).lineTo(50 + pw, 170).stroke();

    // bill to
    doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("Bill To", 50, 185);
    doc.fillColor("#334155").fontSize(10).font("Helvetica")
      .text(ORG_NAME, 50, 202)
      .text("namandisafari@gmail.com", 50, 218);

    // payment status badge
    doc.roundedRect(doc.page.width - 50 - 130, 185, 130, 28, 14).fill(lightBg);
    doc.fillColor(green).fontSize(10).font("Helvetica-Bold").text("PAID", doc.page.width - 50 - 130, 192, { width: 130, align: "center" });

    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, 250).lineTo(50 + pw, 250).stroke();

    // item
    doc.fillColor(ink).fontSize(10).font("Helvetica-Bold").text("Description", 50, 265);
    doc.text("Amount", doc.page.width - 50 - 100, 265, { width: 100, align: "right" });
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, 280).lineTo(50 + pw, 280).stroke();

    doc.fillColor("#334155").fontSize(10).font("Helvetica");
    doc.text("NSIS Installation License — .exe installer creation rights", 50, 290);
    doc.text(`${currency} ${total.toLocaleString()}`, doc.page.width - 50 - 100, 290, { width: 100, align: "right" });

    // total row
    const totalY = 320;
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, totalY).lineTo(50 + pw, totalY).stroke();
    doc.fillColor(green).fontSize(14).font("Helvetica-Bold").text("Total Paid", 50, totalY + 8);
    doc.text(`${currency} ${total.toLocaleString()}`, doc.page.width - 50 - 100, totalY + 8, { width: 100, align: "right" });

    // green highlight box
    const boxY = totalY + 44;
    doc.roundedRect(50, boxY, pw, 42, 6).fill(green);
    doc.fillColor("#ffffff").fontSize(10).font("Helvetica-Bold").text("Transaction ID", 70, boxY + 8);
    doc.fontSize(8).font("Helvetica").text("Use this for your records", 70, boxY + 24);
    doc.fillColor("#ffffff").fontSize(11).font("Helvetica").text(tid, doc.page.width - 50 - 150, boxY + 12, { width: 150, align: "right" });

    // payment info
    const infoY = boxY + 65;
    doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("License Details", 50, infoY);
    doc.fillColor("#334155").fontSize(9).font("Helvetica");
    [
      `License Reference: ${ref}`,
      `Product: NSIS Installation License`,
      `Status: Active — Lifetime`,
      `Issued to: ${ORG_NAME}`,
    ].forEach((l, i) => doc.text(`· ${l}`, 50, infoY + 18 + i * 15));

    // footer
    const footY = infoY + 18 + 4 * 15 + 16;
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, footY).lineTo(50 + pw, footY).stroke();
    doc.fillColor(muted).fontSize(7.5).font("Helvetica")
      .text("NLSC — Nile Logic & Secure Cloud Ltd · 1st Floor Lunna Plaza, 25, Entebbe Road, Kampala, Uganda · P.O Box: 6089", 50, footY + 10, { width: pw, align: "center" })
      .text("api@nlscug.com · 0326 338 014 · URA-registered · NITA-U compliant", 50, footY + 24, { width: pw, align: "center" });

    doc.fillColor(green).fontSize(10).font("Helvetica-Bold")
      .text("Paid in full. Thank you.", 50, footY + 44, { width: pw, align: "center" });

    doc.end();
  });
}

function buildEmailHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Payment Receipt — NLSC</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:24px 36px;">
          <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:700;">NLSC</h1>
          <p style="margin:4px 0 0;font-size:11px;color:#bbf7d0;letter-spacing:1px;">PAYMENT RECEIPT · ${ref}</p>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td valign="top" style="width:50%;">
                <p style="margin:0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Bill To</p>
                <p style="margin:4px 0 0;font-size:15px;color:#0f172a;font-weight:600;">${ORG_NAME}</p>
                <p style="margin:2px 0 0;font-size:12px;color:#64748b;">namandisafari@gmail.com</p>
              </td>
              <td valign="top" style="width:50%;text-align:right;">
                <p style="margin:0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Date Paid</p>
                <p style="margin:4px 0 0;font-size:14px;color:#0f172a;">10 July 2026 · 18:30</p>
                <p style="margin:2px 0 0;font-size:11px;color:#16a34a;font-weight:600;">&#10003; PAID</p>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background-color:#f0fdf4;border-radius:6px;">
            <tr><td style="padding:16px;">
              <p style="margin:0;font-size:11px;color:#16a34a;font-weight:600;">Transaction ID</p>
              <p style="margin:2px 0 0;font-size:14px;color:#0f172a;font-family:monospace;">${tid}</p>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr style="background-color:#f8fafc;"><th style="padding:8px 12px;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;text-align:left;">Description</th><th style="padding:8px 12px;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;text-align:right;">Amount</th></tr>
            <tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;">NSIS Installation License — .exe installer creation rights</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;text-align:right;">${currency} ${total.toLocaleString()}</td></tr>
            <tr><td style="padding:10px 12px;font-size:15px;font-weight:700;color:#16a34a;">Total Paid</td><td style="padding:10px 12px;font-size:18px;font-weight:700;color:#16a34a;text-align:right;">${currency} ${total.toLocaleString()}</td></tr>
          </table>
          <hr style="border:none;border-top:2px solid #16a34a;margin:24px 0 16px;" />
          <p style="margin:0;font-size:11px;color:#64748b;">License Reference: ${ref} · Status: Active · Issued to ${ORG_NAME}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function main() {
  if (!RESEND_API_KEY) { console.error("Missing RESEND_API_KEY"); process.exit(1); }
  const resend = new Resend(RESEND_API_KEY);

  console.log(`Generating payment receipt for ${ORG_NAME}...`);
  const pdfBuffer = await buildReceiptPdf();
  console.log(`PDF generated (${pdfBuffer.length} bytes)`);

  console.log(`Sending receipt to ${TO_EMAILS.join(", ")}...`);
  await resend.emails.send({
    from: EMAIL_FROM,
    to: TO_EMAILS,
    subject: `Payment Receipt — NSIS Installation License — ${ref}`,
    html: buildEmailHtml(),
    attachments: [{ filename: `nlsc-receipt-${ref.toLowerCase()}.pdf`, content: pdfBuffer.toString("base64") }],
  });
  console.log("Receipt sent.");

  console.log("\nDone.");
  console.log(`  Reference:      ${ref}`);
  console.log(`  Transaction:    ${tid}`);
  console.log(`  Amount:         ${currency} ${total.toLocaleString()}`);
  console.log(`  Date:           10 July 2026, 18:30`);
  console.log(`  Emailed to:     ${TO_EMAILS.join(", ")}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
