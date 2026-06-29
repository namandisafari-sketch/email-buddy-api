import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import postgres from "postgres";
import { Resend } from "resend";
import { getServerConfig } from "../config.server";
import { buildInvoicePdf, type InvoiceData } from "./invoice";

function generateReference() {
  return "DOM-" + crypto.randomUUID().slice(0, 8).toUpperCase();
}

async function withDb<T>(fn: (sql: postgres.Sql) => Promise<T>): Promise<T> {
  const config = getServerConfig();
  if (!config.databaseUrl) {
    console.warn("[Domain] No DATABASE_URL set — skipping DB");
    return undefined as T;
  }
  const sql = postgres(config.databaseUrl, { max: 1 });
  try {
    return await fn(sql);
  } finally {
    await sql.end();
  }
}

export type DomainOrderResult = {
  reference: string;
  domain: string;
  tld: string;
  years: number;
  total: number;
  currency: string;
  status: string;
};

const LOGO_SVG = `<svg viewBox="0 0 680 680" width="48" height="48" style="display:block;margin:0 auto;">
  <rect width="680" height="680" rx="120" fill="#080808" />
  <path fill="none" stroke="#5a9e82" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" d="M 185 220 C 185 220, 185 370, 340 370 C 495 370, 495 480, 495 480" />
  <path fill="none" stroke="#5a9e82" stroke-width="40" stroke-linecap="round" d="M 495 220 C 495 220, 495 370, 340 370 C 185 370, 185 480, 185 480" />
  <circle fill="#5a9e82" cx="340" cy="530" r="26" />
</svg>`;

function buildOrderConfirmationHtml(order: DomainOrderResult, contactEmail: string): string {
  const yearLabel = order.years === 1 ? "1 year" : `${order.years} years`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Domain order received — NLSC</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#1a1a1a;padding:32px 40px;text-align:center;">
              ${LOGO_SVG}
              <p style="margin:8px 0 0;font-size:12px;color:#a0a0a0;letter-spacing:2px;text-transform:uppercase;">Domain Order Received</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">Domain registration requested</h2>
              <p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.6;">Your order for <strong>${order.domain}${order.tld}</strong> (${yearLabel}) has been received. Our team will process your registration and notify you once the domain is active.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f4;border-radius:8px;padding:16px;margin:16px 0;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Order Reference</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${order.reference}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Domain</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${order.domain}${order.tld}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Total</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${order.currency} ${order.total.toLocaleString()}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:13px;color:#888;line-height:1.6;">You will receive a confirmation email once the domain is registered and configured. For .ug and .co.ug domains, registry processing may take up to 24 hours.</p>
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

async function sendOrderConfirmationEmail(to: string, order: DomainOrderResult) {
  const config = getServerConfig();
  if (!config.resendApiKey) {
    console.warn("[Resend] No RESEND_API_KEY set — skipping domain confirmation email");
    return;
  }
  const resend = new Resend(config.resendApiKey);
  const html = buildOrderConfirmationHtml(order, to);
  await resend.emails.send({
    from: config.emailFrom,
    to,
    subject: `Domain order received — ${order.domain}${order.tld} — Reference ${order.reference}`,
    html,
  });
  console.log(`[Resend] Domain order confirmation sent to ${to} for ${order.domain}${order.tld}`);
}

export const checkDomainAvailability = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      domain: z.string().min(1).max(63),
      tld: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const available = Math.random() > 0.3;
    return { available, domain: data.domain, tld: data.tld };
  });

export const registerDomain = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      domain: z.string().min(1).max(63),
      tld: z.string().min(1),
      years: z.number().int().min(1).max(10),
      total: z.number().positive(),
      currency: z.string().default("UGX"),
      contactEmail: z.string().email(),
      contactPhone: z.string().min(1),
      orgName: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const reference = generateReference();
    console.log(`[Domain] Order received: ${data.domain}${data.tld} for ${data.years} year(s), total ${data.currency} ${data.total}`);

    await withDb(async (sql) => {
      await sql`
        insert into domain_orders (reference, domain, tld, years, total, currency, contact_email, contact_phone, org_name, status)
        values (${reference}, ${data.domain}, ${data.tld}, ${data.years}, ${data.total}, ${data.currency}, ${data.contactEmail}, ${data.contactPhone}, ${data.orgName}, 'pending')
      `;
    });

    const order: DomainOrderResult = {
      reference,
      domain: data.domain,
      tld: data.tld,
      years: data.years,
      total: data.total,
      currency: data.currency,
      status: "pending",
    };

    const invoices: InvoiceData[] = [
      {
        reference,
        orgName: data.orgName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        date: new Date(),
        items: [{ name: `Domain registration — ${data.domain}${data.tld} (${data.years} yr)`, price: data.total }],
        discount: 0,
        total: data.total,
        currency: data.currency,
      },
    ];

    await sendOrderConfirmationEmail(data.contactEmail, order);
    const pdfBuffers = await Promise.all(invoices.map(buildInvoicePdf));

    const config = getServerConfig();
    if (config.resendApiKey) {
      const resend = new Resend(config.resendApiKey);
      await resend.emails.send({
        from: config.emailFrom,
        to: data.contactEmail,
        subject: `Invoice — Domain Registration ${data.domain}${data.tld} — ${reference}`,
        html: `<p>Your invoice for domain registration is attached.</p>`,
        attachments: pdfBuffers.map((buf, i) => ({
          filename: `nlsc-invoice-${invoices[i].reference.toLowerCase()}.pdf`,
          content: buf.toString("base64"),
        })),
      });
    }

    return { success: true, order };
  });
