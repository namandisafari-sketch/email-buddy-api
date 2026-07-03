import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Resend } from "resend";
import { supabaseAdmin } from "../../integrations/supabase/client.server";
import { getServerConfig } from "../config.server";
import { buildInvoicePdf, type InvoiceData } from "./invoice";

export function generateReference() {
  return "SDL-" + crypto.randomUUID().slice(0, 8).toUpperCase();
}

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "subsec_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export type SubdomainLicenseResult = {
  reference: string;
  domain: string;
  token: string;
  total: number;
  currency: string;
  status: string;
};

export type SubdomainConfigResult = {
  id: string;
  subdomain: string;
  record_type: string;
  record_value: string;
  ssl_status: string;
  created_at: string;
};

function buildLicenseEmailHtml(license: SubdomainLicenseResult, orgName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Subdomain Security License Active</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#1a1a1a;padding:32px 40px;text-align:center;">
              <h2 style="margin:0;font-size:20px;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">NLSC</h2>
              <p style="margin:8px 0 0;font-size:12px;color:#a0a0a0;letter-spacing:2px;text-transform:uppercase;">Subdomain Security License</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">Your Subdomain Security License is active</h2>
              <p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.6;">Dear ${orgName},</p>
              <p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.6;">Your Subdomain Security License for <strong>${license.domain}</strong> has been activated. Use the credentials below to manage your subdomains.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f4;border-radius:8px;padding:16px;margin:16px 0;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Reference</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${license.reference}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Domain</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${license.domain}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Bearer Token</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#1a1a1a;font-family:monospace;word-break:break-all;">${license.token}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:13px;color:#888;line-height:1.6;">Use this token to authenticate all API requests. Manage your subdomains through the NLSC dashboard. Each subdomain you configure is automatically protected with SSL, DNSSEC, and post-quantum signatures.</p>
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

function buildLicenseInvoiceHtml(ref: string, domain: string, total: number, currency: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice — Subdomain Security License</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#1a1a1a;padding:32px 40px;text-align:center;">
              <p style="margin:8px 0 0;font-size:12px;color:#a0a0a0;letter-spacing:2px;text-transform:uppercase;">Invoice — Subdomain Security License</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">Invoice for ${domain}</h2>
              <p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.6;">Please find attached the invoice for your Subdomain Security License for <strong>${domain}</strong>.</p>
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
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${domain}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Total Due</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${currency} ${total.toLocaleString()}</p>
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

export const purchaseSubdomainLicense = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      domain: z.string().min(1),
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
    const total = 100_000;
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
      .from("subdomain_licenses")
      .insert({
        reference,
        org_name: data.orgName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        domain: data.domain,
        token,
        status: "active",
        total,
        currency,
        customer_id: customerId ?? null,
      });

    if (insertError) {
      console.error("[Subdomain] DB insert failed:", insertError.message);
    }

    const license: SubdomainLicenseResult = {
      reference,
      domain: data.domain,
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
      items: [{ name: `Subdomain Security License — ${data.domain} (lifetime)`, price: total }],
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
          subject: `Invoice — Subdomain Security License ${data.domain} — ${reference}`,
          html: buildLicenseInvoiceHtml(reference, data.domain, total, currency),
          attachments: [
            {
              filename: `nlsc-invoice-${reference.toLowerCase()}.pdf`,
              content: pdfBuffer.toString("base64"),
            },
          ],
        });
        console.log(`[Subdomain] Invoice email sent to ${data.contactEmail}`);
      } catch (err) {
        console.error("[Subdomain] Invoice email failed:", err);
      }

      try {
        await resend.emails.send({
          from: config.emailFrom,
          to: data.contactEmail,
          subject: `Your Subdomain Security License is active — ${data.domain} — ${reference}`,
          html: buildLicenseEmailHtml(license, data.orgName),
        });
        console.log(`[Subdomain] Activation email sent to ${data.contactEmail}`);
      } catch (err) {
        console.error("[Subdomain] Activation email failed:", err);
      }
    }

    return { success: true, license };
  });

export const getSubdomainLicenses = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { data: session } = await supabaseAdmin
      .from("customer_sessions")
      .select("customer_id")
      .eq("token", data.token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!session) throw new Error("Unauthorized");

    const { data: licenses } = await supabaseAdmin
      .from("subdomain_licenses")
      .select("id, reference, org_name, contact_email, contact_phone, domain, token, status, total, currency, created_at")
      .eq("customer_id", session.customer_id)
      .order("created_at", { ascending: false });

    return { licenses: licenses ?? [] };
  });

export const getSubdomainConfigs = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      licenseReference: z.string().min(1),
      sessionToken: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { data: session } = await supabaseAdmin
      .from("customer_sessions")
      .select("customer_id")
      .eq("token", data.sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!session) throw new Error("Unauthorized");

    const { data: license } = await supabaseAdmin
      .from("subdomain_licenses")
      .select("id")
      .eq("reference", data.licenseReference)
      .eq("customer_id", session.customer_id)
      .single();

    if (!license) throw new Error("License not found");

    const { data: configs } = await supabaseAdmin
      .from("subdomain_configs")
      .select("id, subdomain, record_type, record_value, ssl_status, created_at")
      .eq("license_id", license.id)
      .order("created_at", { ascending: false });

    return { configs: configs ?? [] };
  });

export const addSubdomainConfig = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      licenseReference: z.string().min(1),
      subdomain: z.string().min(1).max(63),
      recordType: z.string().default("A"),
      recordValue: z.string().min(1),
      sessionToken: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { data: session } = await supabaseAdmin
      .from("customer_sessions")
      .select("customer_id")
      .eq("token", data.sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!session) throw new Error("Unauthorized");

    const { data: license } = await supabaseAdmin
      .from("subdomain_licenses")
      .select("id, domain")
      .eq("reference", data.licenseReference)
      .eq("customer_id", session.customer_id)
      .single();

    if (!license) throw new Error("License not found");

    const { data: config, error } = await supabaseAdmin
      .from("subdomain_configs")
      .insert({
        license_id: license.id,
        subdomain: data.subdomain,
        record_type: data.recordType,
        record_value: data.recordValue,
        ssl_status: "pending",
      })
      .select("id, subdomain, record_type, record_value, ssl_status, created_at")
      .single();

    if (error) throw new Error(error.message);

    console.log(`[Subdomain] Config added: ${config.subdomain}.${license.domain} -> ${data.recordValue}`);

    return { success: true, config };
  });

export const removeSubdomainConfig = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      configId: z.string().uuid(),
      sessionToken: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { data: session } = await supabaseAdmin
      .from("customer_sessions")
      .select("customer_id")
      .eq("token", data.sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!session) throw new Error("Unauthorized");

    const { data: config } = await supabaseAdmin
      .from("subdomain_configs")
      .select("id, license_id")
      .eq("id", data.configId)
      .single();

    if (!config) throw new Error("Config not found");

    const { data: license } = await supabaseAdmin
      .from("subdomain_licenses")
      .select("customer_id")
      .eq("id", config.license_id)
      .single();

    if (!license || license.customer_id !== session.customer_id) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin
      .from("subdomain_configs")
      .delete()
      .eq("id", data.configId);

    if (error) throw new Error(error.message);

    return { success: true };
  });
