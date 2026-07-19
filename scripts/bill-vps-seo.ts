import PDFDocument from "pdfkit";
import { Resend } from "resend";
import { Buffer } from "node:buffer";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "NLSC <api@nlscug.com>";
const TO_EMAIL = "namandisafari@gmail.com";
const ORG_NAME = "Habico";

const ref = "VPS-" + crypto.randomUUID().slice(0, 8).toUpperCase();
const invoiceDate = new Date("2026-07-28T00:00:00+03:00");

const items = [
  { name: "VPS Hosting — 6 Cores / 100GB SSD / 4GB RAM (5 years)", price: 350_000 },
  { name: "SEO Booster Service — 1 year", price: 50_000 },
];
const subtotal = items.reduce((s, i) => s + i.price, 0);
const discount = 0;
const total = subtotal - discount;
const currency = "UGX";

function buildVpsInvoicePdf(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, info: { Title: `Invoice ${ref}`, Author: "NLSC" } });

    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pw = doc.page.width - 100;
    const ink = "#0f172a";
    const accent = "#2563eb";
    const muted = "#64748b";
    const bg = "#f8fafc";
    const border = "#e2e8f0";

    function line(y: number) {
      doc.strokeColor(border).lineWidth(1).moveTo(50, y).lineTo(50 + pw, y).stroke();
    }

    // top accent bar
    doc.rect(50, 50, pw, 6).fill(accent);

    // header row: left brand, right invoice label
    doc.fillColor(ink).fontSize(26).font("Helvetica-Bold").text("NLSC", 50, 72);
    doc.fillColor(muted).fontSize(9).font("Helvetica").text("Nile Logic & Secure Cloud Ltd", 50, 104);

    doc.fillColor(ink).fontSize(20).font("Helvetica-Bold").text("INVOICE", doc.page.width - 50 - 120, 72, { width: 120, align: "right" });
    doc.fillColor(accent).fontSize(9).font("Helvetica").text(`# ${ref}`, doc.page.width - 50 - 120, 100, { width: 120, align: "right" });

    // meta row: date issued + currency + payment terms
    const dateStr = invoiceDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    doc.fillColor(muted).fontSize(9).font("Helvetica");
    doc.text(`Date Issued: ${dateStr}`, 50, 135);
    doc.text(`Currency: ${currency}`, doc.page.width - 50 - 120, 135, { width: 120, align: "right" });
    doc.text("Payment Terms: Due on receipt", 50, 150);
    doc.text(`Period: 5 Years`, doc.page.width - 50 - 120, 150, { width: 120, align: "right" });

    line(170);

    // bill to + ship to side by side
    const boxW = (pw - 20) / 2;
    doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("Bill To", 50, 185);
    doc.fillColor("#334155").fontSize(10).font("Helvetica")
      .text(ORG_NAME, 50, 202)
      .text("namandisafari@gmail.com", 50, 218);

    doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("Service Details", 50 + boxW + 20, 185);
    doc.fillColor("#334155").fontSize(9).font("Helvetica")
      .text("VPS Hosting + SEO Booster", 50 + boxW + 20, 202)
      .text("Reference: " + ref, 50 + boxW + 20, 218);

    line(250);

    // ── itemised table ──
    const tableTop = 265;
    const colX = [50, 60, doc.page.width - 50 - 100];
    const colW = [50, doc.page.width - 50 - 100 - 60 - 100, 100];

    // table header
    doc.rect(colX[0], tableTop, pw, 22).fill(bg);
    doc.fillColor(ink).fontSize(9).font("Helvetica-Bold");
    doc.text("#", colX[0] + 8, tableTop + 6, { width: colX[1] - colX[0] - 8 });
    doc.text("Description", colX[1], tableTop + 6, { width: colW[1] });
    doc.text("Amount", colX[2], tableTop + 6, { width: colW[2], align: "right" });

    let rowY = tableTop + 28;
    let idx = 1;
    for (const item of items) {
      const bgColor = idx % 2 === 0 ? "#ffffff" : bg;
      doc.rect(colX[0], rowY, pw, 24).fill(bgColor);
      doc.fillColor(ink).fontSize(9).font("Helvetica");
      doc.text(String(idx), colX[0] + 8, rowY + 7, { width: colX[1] - colX[0] - 8 });
      doc.text(item.name, colX[1], rowY + 7, { width: colW[1] });
      doc.text(`${currency} ${item.price.toLocaleString()}`, colX[2], rowY + 7, { width: colW[2], align: "right" });
      rowY += 22;
      idx++;
    }

    // totals section
    const totalsY = rowY + 10;
    line(totalsY);
    const lh = 20;

    doc.fillColor(ink).fontSize(10).font("Helvetica");
    doc.text("Subtotal", 50, totalsY + 10);
    doc.text(`${currency} ${subtotal.toLocaleString()}`, colX[2], totalsY + 10, { width: colW[2], align: "right" });

    doc.fillColor(muted).fontSize(9);
    doc.text("Discount", 50, totalsY + 10 + lh);
    doc.text(`- ${currency} ${discount.toLocaleString()}`, colX[2], totalsY + 10 + lh, { width: colW[2], align: "right" });

    // total in a modern summary card
    const cardY = totalsY + 10 + lh * 2 + 10;
    doc.roundedRect(50, cardY, pw, 50, 6).fill(accent);
    doc.fillColor("#ffffff").fontSize(11).font("Helvetica-Bold").text("TOTAL DUE", 70, cardY + 10);
    doc.fontSize(18).text(`${currency} ${total.toLocaleString()}`, doc.page.width - 50 - 120, cardY + 8, { width: 120, align: "right" });
    doc.fontSize(8).font("Helvetica").text("Including all taxes · Due on receipt", 70, cardY + 30);

    // payment methods
    const payY = cardY + 75;
    doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("Payment Methods", 50, payY);
    doc.fillColor("#334155").fontSize(9).font("Helvetica");
    const payLines = [
      `Reference: ${ref}`,
      "Mobile Money: 0792227777 — NLSC LTD",
      "Bank Transfer: Pay Nile Logic & Secure Cloud Ltd at any bank",
      "Crypto: USDT (TRC-20) / BTC — wallet issued via verification call",
    ];
    payLines.forEach((l, i) => doc.text(`· ${l}`, 50, payY + 18 + i * 15));

    // footer
    const footerY = payY + 18 + payLines.length * 15 + 16;
    line(footerY);
    doc.fillColor(muted).fontSize(7.5).font("Helvetica")
      .text("NLSC — Nile Logic & Secure Cloud Ltd · 1st Floor Lunna Plaza, 25, Entebbe Road, Kampala, Uganda · P.O Box: 6089", 50, footerY + 10, { width: pw, align: "center" })
      .text("api@nlscug.com · 0326 338 014 · URA-registered · NITA-U compliant", 50, footerY + 24, { width: pw, align: "center" });

    doc.fillColor(accent).fontSize(10).font("Helvetica-Bold")
      .text("Thank you for your business.", 50, footerY + 44, { width: pw, align: "center" });

    doc.end();
  });
}

function buildInvoiceEmailHtml(): string {
  const itemsHtml = items.map((i) =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;">${i.name}</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;text-align:right;">${currency} ${i.price.toLocaleString()}</td></tr>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Invoice — NLSC</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:24px 36px;">
          <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:700;">NLSC</h1>
          <p style="margin:4px 0 0;font-size:11px;color:#bfdbfe;letter-spacing:1px;">INVOICE · ${ref}</p>
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
                <p style="margin:0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Date Issued</p>
                <p style="margin:4px 0 0;font-size:14px;color:#0f172a;">28 July 2026</p>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr style="background-color:#f8fafc;"><th style="padding:8px 12px;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;text-align:left;">Description</th><th style="padding:8px 12px;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;text-align:right;">Amount</th></tr>
            ${itemsHtml}
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr><td style="padding:6px 12px;font-size:13px;color:#64748b;">Subtotal</td><td style="padding:6px 12px;font-size:13px;color:#0f172a;text-align:right;">${currency} ${subtotal.toLocaleString()}</td></tr>
            <tr><td style="padding:6px 12px;font-size:13px;color:#64748b;">Discount</td><td style="padding:6px 12px;font-size:13px;color:#64748b;text-align:right;">${currency} ${discount.toLocaleString()}</td></tr>
            <tr><td style="padding:10px 12px;font-size:15px;font-weight:700;color:#2563eb;">Total Due</td><td style="padding:10px 12px;font-size:18px;font-weight:700;color:#2563eb;text-align:right;">${currency} ${total.toLocaleString()}</td></tr>
          </table>
          <hr style="border:none;border-top:2px solid #2563eb;margin:24px 0 16px;" />
          <p style="margin:0;font-size:11px;color:#64748b;">Payment: Mobile Money 0792227777 · Bank Transfer · Crypto (USDT/BTC)</p>
          <p style="margin:0;font-size:11px;color:#64748b;">Ref: ${ref}</p>
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

  console.log(`Generating invoice for ${ORG_NAME}...`);
  const pdfBuffer = await buildVpsInvoicePdf();
  console.log(`PDF generated (${pdfBuffer.length} bytes)`);

  console.log(`Sending invoice to ${TO_EMAIL}...`);
  await resend.emails.send({
    from: EMAIL_FROM,
    to: TO_EMAIL,
    subject: `Invoice — VPS Hosting & SEO Booster — ${ref}`,
    html: buildInvoiceEmailHtml(),
    attachments: [{ filename: `nlsc-invoice-${ref.toLowerCase()}.pdf`, content: pdfBuffer.toString("base64") }],
  });
  console.log("Invoice sent.");

  console.log("\nDone.");
  console.log(`  Reference:  ${ref}`);
  console.log(`  Items:`);
  items.forEach((i) => console.log(`    - ${i.name}: ${currency} ${i.price.toLocaleString()}`));
  console.log(`  Total:      ${currency} ${total.toLocaleString()}`);
  console.log(`  Date:       28 July 2026`);
  console.log(`  Emailed to: ${TO_EMAIL}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
