import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Resend } from "resend";
import { supabaseAdmin } from "../../integrations/supabase/client.server";
import { getServerConfig } from "../config.server";
import { buildInvoicePdf, type InvoiceData } from "./invoice";

function generateReference() {
  return "NSIS-" + crypto.randomUUID().slice(0, 8).toUpperCase();
}

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "nsis_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export type NsisLicenseResult = {
  reference: string;
  token: string;
  total: number;
  currency: string;
  status: string;
};

function buildNsisEmailHtml(license: NsisLicenseResult, orgName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NSIS Installation License Active</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#1a1a1a;padding:32px 40px;text-align:center;">
              <h2 style="margin:0;font-size:20px;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">NLSC</h2>
              <p style="margin:8px 0 0;font-size:12px;color:#a0a0a0;letter-spacing:2px;text-transform:uppercase;">NSIS Installation License</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">Your NSIS Installation License is active</h2>
              <p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.6;">Dear ${orgName},</p>
              <p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.6;">Your NSIS Installation License has been activated. Your organisation is now licensed to create and distribute professional .exe software installers.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f4;border-radius:8px;padding:16px;margin:16px 0;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Reference</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${license.reference}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">License Token</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#1a1a1a;font-family:monospace;word-break:break-all;">${license.token}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:13px;color:#888;line-height:1.6;">Keep this license token as proof of your NSIS Installation License. It confirms your organisation's right to create and distribute .exe installers under the NLSC licensing framework.</p>
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

export const purchaseNsisLicense = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      contactEmail: z.string().email(),
      contactPhone: z.string().min(1),
      orgName: z.string().min(1),
      sessionToken: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const config = getServerConfig();
    const reference = generateReference();
    const token = generateToken();
    const total = 300_000;
    const currency = "UGX";

    let customerId: string | undefined;
    if (data.sessionToken) {
      const { data: session } = await supabaseAdmin
        .from("customer_sessions")
        .select("customer_id")
        .eq("token", data.sessionToken)
        .gt("expires_at", new Date().toISOString())
        .single();
      if (session) customerId = session.customer_id;
    }

    const { error: insertError } = await supabaseAdmin
      .from("nsis_licenses")
      .insert({
        reference,
        org_name: data.orgName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        token,
        status: "active",
        total,
        currency,
        customer_id: customerId ?? null,
      });

    if (insertError) {
      console.error("[NSIS] DB insert failed:", insertError.message);
    }

    const license: NsisLicenseResult = {
      reference,
      token,
      total,
      currency,
      status: "active",
    };

    const invoiceData: InvoiceData = {
      reference,
      orgName: data.orgName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      date: new Date(),
      items: [{ name: "NSIS Installation License — .exe installer creation rights", price: total }],
      discount: 0,
      total,
      currency,
    };

    if (config.resendApiKey) {
      const resend = new Resend(config.resendApiKey);

      try {
        const pdfBuffer = await buildInvoicePdf(invoiceData);
        await resend.emails.send({
          from: config.emailFrom,
          to: data.contactEmail,
          subject: `Invoice — NSIS Installation License — ${reference}`,
          html: `<p>Your invoice for the NSIS Installation License is attached.</p>`,
          attachments: [
            {
              filename: `nlsc-invoice-${reference.toLowerCase()}.pdf`,
              content: pdfBuffer.toString("base64"),
            },
          ],
        });
        console.log(`[NSIS] Invoice email sent to ${data.contactEmail}`);
      } catch (err) {
        console.error("[NSIS] Invoice email failed:", err);
      }

      try {
        await resend.emails.send({
          from: config.emailFrom,
          to: data.contactEmail,
          subject: `Your NSIS Installation License is active — ${reference}`,
          html: buildNsisEmailHtml(license, data.orgName),
        });
        console.log(`[NSIS] Activation email sent to ${data.contactEmail}`);
      } catch (err) {
        console.error("[NSIS] Activation email failed:", err);
      }
    }

    return { success: true, license };
  });
