import PDFDocument from "pdfkit";

export type InvoiceData = {
  reference: string;
  orgName: string;
  contactEmail: string;
  contactPhone: string;
  date: Date;
  items: { name: string; price: number }[];
  discount: number;
  total: number;
  currency: string;
};

export function buildInvoicePdf(data: InvoiceData): Buffer {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: `Invoice ${data.reference}`,
      Author: "NLSC — Nile Logic & Secure Cloud Ltd",
      Subject: "Bundle Activation Invoice",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const pageWidth = doc.page.width - 50 * 2;
  const rightX = doc.page.width - 50;

  // ── colours ──
  const ink = "#1a1a1a";
  const teal = "#5a9e82";
  const gray = "#888";
  const lightBg = "#f9f9f4";
  const border = "#e0e0d8";

  function drawLine(y: number, w: number, color = border) {
    doc.strokeColor(color).lineWidth(1).moveTo(50, y).lineTo(50 + w, y).stroke();
  }

  // ── header section ──
  // left: logo area + company name
  doc.rect(50, 50, pageWidth, 90).fill(ink);
  doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold").text("NLSC", 70, 72);

  doc
    .fillColor(teal)
    .fontSize(10)
    .font("Helvetica")
    .text("NILE LOGIC & SECURE CLOUD LTD", 70, 100);

  doc
    .fillColor("#a0a0a0")
    .fontSize(8)
    .text("Sovereign Email SMTP & Automation APIs", 70, 115);

  // right: invoice label
  doc
    .fillColor("#ffffff")
    .fontSize(28)
    .font("Helvetica-Bold")
    .text("INVOICE", rightX, 60, { align: "right", width: 200 });

  doc
    .fillColor(teal)
    .fontSize(10)
    .font("Helvetica")
    .text(`# ${data.reference}`, rightX - 200, 94, { align: "right", width: 200 });

  // ── date row ──
  const dateStr = data.date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.fillColor(gray).fontSize(9).font("Helvetica");
  doc.text(`Date issued: ${dateStr}`, 50, 165);
  doc.text(`Currency: ${data.currency}`, rightX, 165, { align: "right", width: 200 });

  drawLine(185, pageWidth);

  // ── bill to ──
  doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("Bill To", 50, 200);
  doc
    .fillColor("#444")
    .fontSize(10)
    .font("Helvetica")
    .text(data.orgName, 50, 216)
    .text(data.contactEmail, 50, 232)
    .text(data.contactPhone, 50, 248);

  // ── payment details (right) ──
  doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("Payment Details", rightX - 200, 200, {
    align: "right",
    width: 200,
  });
  doc
    .fillColor("#444")
    .fontSize(9)
    .font("Helvetica")
    .text(data.currency, rightX - 200, 216, { align: "right", width: 200 })
    .text("Mobile Money / Crypto / Bank Transfer", rightX - 200, 232, {
      align: "right",
      width: 200,
    })
    .text("NLSC LTD — Verified Organisation", rightX - 200, 248, { align: "right", width: 200 });

  drawLine(275, pageWidth);

  // ── table header ──
  const tableTop = 290;
  doc.rect(50, tableTop, pageWidth, 24).fill(lightBg);
  doc.fillColor(ink).fontSize(9).font("Helvetica-Bold");
  doc.text("Item", 60, tableTop + 7);
  doc.text("Amount", rightX - 60, tableTop + 7, { align: "right", width: 50 });

  // ── table rows ──
  let rowY = tableTop + 30;
  let rowNum = 0;
  for (const item of data.items) {
    const bgColor = rowNum % 2 === 0 ? "#ffffff" : lightBg;
    doc.rect(50, rowY, pageWidth, 22).fill(bgColor);
    doc.fillColor(ink).fontSize(9).font("Helvetica");
    doc.text(item.name, 60, rowY + 6);
    doc.text(`${data.currency} ${item.price.toLocaleString()}`, rightX - 60, rowY + 6, {
      align: "right",
      width: 50,
    });
    rowY += 22;
    rowNum++;
  }

  // ── totals ──
  const totalsY = rowY + 8;
  drawLine(totalsY, pageWidth);
  const lineH = 20;

  doc.fillColor(ink).fontSize(10).font("Helvetica");
  doc.text("Subtotal", 50, totalsY + 8);
  doc.text(
    `${data.currency} ${(data.total + data.discount).toLocaleString()}`,
    rightX - 60,
    totalsY + 8,
    { align: "right", width: 50 },
  );

  doc.fillColor(gray).fontSize(9);
  doc.text(`Discount (reconciliation)`, 50, totalsY + 8 + lineH);
  doc.text(`- ${data.currency} ${data.discount.toLocaleString()}`, rightX - 60, totalsY + 8 + lineH, {
    align: "right",
    width: 50,
  });

  doc
    .fillColor(teal)
    .fontSize(12)
    .font("Helvetica-Bold");
  doc.text("Total Due", 50, totalsY + 8 + lineH * 2);
  doc.text(`${data.currency} ${data.total.toLocaleString()}`, rightX - 60, totalsY + 8 + lineH * 2, {
    align: "right",
    width: 50,
  });

  // ── highlight box ──
  const highlightY = totalsY + 8 + lineH * 3 + 16;
  doc.rect(50, highlightY, pageWidth, 36).fill(teal);
  doc
    .fillColor("#ffffff")
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Amount Due (UGX)", 60, highlightY + 10);
  doc
    .fontSize(16)
    .text(`${data.currency} ${data.total.toLocaleString()}`, rightX - 60, highlightY + 6, {
      align: "right",
      width: 50,
    });

  // ── payment info ──
  const infoY = highlightY + 56;
  doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("Payment Information", 50, infoY);

  const payInfo = [
    `Reference: ${data.reference}`,
    "Mobile Money: 0792227777 — NLSC LTD",
    "Bank: Walk into any bank — pay Nile Logic & Secure Cloud Ltd",
    "Crypto: USDT (TRC-20) / BTC — wallet issued via verification call",
    "Discount: Pay on the 14th of any month to save on reconciliation fees",
  ];

  doc.fillColor("#444").fontSize(9).font("Helvetica");
  payInfo.forEach((line, i) => {
    doc.text(`• ${line}`, 50, infoY + 18 + i * 15);
  });

  // ── license summary ──
  const licY = infoY + 18 + payInfo.length * 15 + 12;
  drawLine(licY, pageWidth);
  doc
    .fillColor(ink)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("License Summary", 50, licY + 12);

  const licItems = [
    "NLSCEVO WhatsApp API — Full WhatsApp services (lifetime license)",
    "Email Automation API — SMTP relay, bulk campaigns, automation flows, inbound parse",
    "Server Authority Token — ED25519 keypair bound to verified organisation",
    "Full ownership · No expiry · No renewal · No subscription",
  ];
  doc.fillColor("#444").fontSize(9).font("Helvetica");
  licItems.forEach((line, i) => {
    doc.text(`• ${line}`, 50, licY + 30 + i * 15);
  });

  // ── terms footer ──
  const termsY = licY + 30 + licItems.length * 15 + 12;
  doc
    .fillColor(gray)
    .fontSize(7.5)
    .font("Helvetica");

  doc.text(
    "This invoice is a valid receipt for the license(s) described above. The license is governed by the laws of the Republic of Uganda. " +
      "Reselling, sublicensing or transferring the license is prohibited. Disputes adjudicated under Ugandan law.",
    50,
    termsY,
    { width: pageWidth, align: "left" },
  );

  doc.text(
    `NLSC — Nile Logic & Secure Cloud Ltd · 1st Floor Lunna Plaza, 25, Entebbe Road, Kampala, Uganda · P.O Box: 6089`,
    50,
    termsY + 20,
    { width: pageWidth, align: "center" },
  );

  doc.text(
    `api@nlscug.com · 0326 338 014 · URA-registered · NITA-U compliant`,
    50,
    termsY + 34,
    { width: pageWidth, align: "center" },
  );

  // ── thank you ──
  doc
    .fillColor(teal)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Thank you for your payment.", 50, termsY + 52, { width: pageWidth, align: "center" });

  doc.end();

  return Buffer.concat(chunks);
}
