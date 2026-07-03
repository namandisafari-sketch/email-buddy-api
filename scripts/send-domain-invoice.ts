import { Resend } from "resend";
import { buildInvoicePdf, type InvoiceData } from "../src/lib/api/invoice";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "NLSC <api@nlscug.com>";
const TO_EMAIL = "namandisafari@gmail.com";
const ORG_NAME = "Habico";
const DOMAIN = "habico.co.ug";
const AMOUNT = 100_000;
const CURRENCY = "UGX";

function generateReference() {
  return "DOM-" + crypto.randomUUID().slice(0, 8).toUpperCase();
}

const ref = generateReference();
const purchaseDate = new Date("2026-06-29T00:00:00+03:00");

const invoiceData: InvoiceData = {
  reference: ref,
  orgName: ORG_NAME,
  contactEmail: TO_EMAIL,
  contactPhone: "0792227777",
  date: purchaseDate,
  items: [{ name: `Domain registration — ${DOMAIN} (1 yr)`, price: AMOUNT }],
  discount: 0,
  total: AMOUNT,
  currency: CURRENCY,
};

function buildInvoiceEmailHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice — Domain Registration</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#1a1a1a;padding:32px 40px;text-align:center;">
              <p style="margin:8px 0 0;font-size:12px;color:#a0a0a0;letter-spacing:2px;text-transform:uppercase;">Invoice — Domain Registration</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">Invoice for ${DOMAIN}</h2>
              <p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.6;">Dear ${ORG_NAME},</p>
              <p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.6;">Please find attached the invoice for the registration of <strong>${DOMAIN}</strong>.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f4;border-radius:8px;padding:16px;margin:16px 0;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Invoice Reference</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${ref}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Domain</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${DOMAIN}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Total Due</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${CURRENCY} ${AMOUNT.toLocaleString()}</p>
                  </td>
                </tr>
              </table>
              <hr style="border:none;border-top:1px solid #e8e8e0;margin:16px 0;" />
              <p style="margin:0;font-size:12px;color:#999;">© ${new Date().getFullYear()} NLSC — Nile Logic & Secure Cloud Ltd</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildPaymentConfirmationHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Confirmed — Domain Registration</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#1a1a1a;padding:32px 40px;text-align:center;">
              <p style="margin:8px 0 0;font-size:12px;color:#a0a0a0;letter-spacing:2px;text-transform:uppercase;">Payment Confirmed</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">Payment Received — Thank You, ${ORG_NAME}</h2>
              <p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.6;">We have received your payment of <strong>${CURRENCY} ${AMOUNT.toLocaleString()}</strong> for the registration of <strong>${DOMAIN}</strong>.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f4;border-radius:8px;padding:16px;margin:16px 0;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Reference</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${ref}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Domain</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${DOMAIN}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Amount Paid</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${CURRENCY} ${AMOUNT.toLocaleString()}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Status</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#5a9e82;font-family:monospace;">PAID</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:13px;color:#888;line-height:1.6;">Your domain registration is being processed. For .co.ug domains, registry processing may take up to 24 hours. You will receive a confirmation once the domain is active.</p>
              <hr style="border:none;border-top:1px solid #e8e8e0;margin:16px 0;" />
              <p style="margin:0;font-size:12px;color:#999;">© ${new Date().getFullYear()} NLSC — Nile Logic & Secure Cloud Ltd</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function main() {
  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY in .env");
    process.exit(1);
  }

  const resend = new Resend(RESEND_API_KEY);

  console.log(`Generating invoice PDF for ${DOMAIN}...`);
  const pdfBuffer = await buildInvoicePdf(invoiceData);
  console.log(`PDF generated (${pdfBuffer.length} bytes)`);

  console.log(`Sending invoice email to ${TO_EMAIL}...`);
  await resend.emails.send({
    from: EMAIL_FROM,
    to: TO_EMAIL,
    subject: `Invoice — Domain Registration ${DOMAIN} — ${ref}`,
    html: buildInvoiceEmailHtml(),
    attachments: [
      {
        filename: `nlsc-invoice-${ref.toLowerCase()}.pdf`,
        content: pdfBuffer.toString("base64"),
      },
    ],
  });
  console.log("Invoice email sent.");

  console.log(`Sending payment confirmation to ${TO_EMAIL}...`);
  await resend.emails.send({
    from: EMAIL_FROM,
    to: TO_EMAIL,
    subject: `Payment Confirmed — ${DOMAIN} — ${ref}`,
    html: buildPaymentConfirmationHtml(),
  });
  console.log("Payment confirmation sent.");

  console.log("\nDone. Summary:");
  console.log(`  Reference:    ${ref}`);
  console.log(`  Domain:       ${DOMAIN}`);
  console.log(`  Amount:       ${CURRENCY} ${AMOUNT.toLocaleString()}`);
  console.log(`  Billed to:    ${ORG_NAME}`);
  console.log(`  Emailed to:   ${TO_EMAIL}`);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
