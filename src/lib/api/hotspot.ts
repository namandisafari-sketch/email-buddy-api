import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Resend } from "resend";
import { supabaseAdmin } from "../../integrations/supabase/client.server";
import { getServerConfig } from "../config.server";
import { buildInvoicePdf, type InvoiceData } from "./invoice";

function generateReference() {
  return "HSP-" + crypto.randomUUID().slice(0, 8).toUpperCase();
}

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "hotspot_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateVoucherCode(prefix: string, index: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return prefix ? `${prefix}-${code}` : code;
}

export type HotspotLicenseResult = {
  reference: string;
  token: string;
  total: number;
  currency: string;
  status: string;
};

export type VoucherResult = {
  id: string;
  code: string;
  package_name: string;
  price: number;
  duration_hours: number;
  status: string;
  expires_at: string;
  created_at: string;
};

function buildHotspotEmailHtml(license: HotspotLicenseResult, orgName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Hotspot License Active</title></head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:Georgia,'Times New Roman',serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 0;">
<tr><td align="center">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
<tr><td style="background-color:#1a1a1a;padding:32px 40px;text-align:center;">
<h2 style="margin:0;font-size:20px;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">NLSC</h2>
<p style="margin:8px 0 0;font-size:12px;color:#a0a0a0;letter-spacing:2px;text-transform:uppercase;">Hotspot License</p>
</td></tr>
<tr><td style="padding:40px;">
<h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">Your Hotspot License is active</h2>
<p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.6;">Dear ${orgName},</p>
<p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.6;">Your NLSC Hotspot License has been activated. You can now create vouchers, manage your hotspot, and configure your MikroTik router to use NLSC cloud validation.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f4;border-radius:8px;padding:16px;margin:16px 0;">
<tr><td>
<p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Reference</p>
<p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${license.reference}</p>
</td></tr>
<tr><td style="padding-top:12px;">
<p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">API Token</p>
<p style="margin:4px 0 0;font-size:13px;color:#1a1a1a;font-family:monospace;word-break:break-all;">${license.token}</p>
</td></tr>
</table>
<h3 style="margin:24px 0 8px;font-size:15px;font-weight:600;color:#1a1a1a;">MikroTik Setup</h3>
<p style="margin:0;font-size:13px;color:#555;line-height:1.6;">Open your MikroTik terminal and paste:</p>
<pre style="background-color:#f4f4f0;padding:12px;border-radius:6px;font-size:11px;color:#333;margin:8px 0 0;overflow-x:auto;">/ip hotspot walled-garden
add dst-host=api.nlscug.com
/ip hotspot user profile
add name=nlsc radius-accounting=yes
/radius add address=api.nlscug.com secret=${license.token} service=hotspot
</pre>
<hr style="border:none;border-top:1px solid #e8e8e0;margin:16px 0;" />
<p style="margin:0;font-size:12px;color:#999;">&copy; ${new Date().getFullYear()} NLSC &mdash; Nile Logic & Secure Cloud Ltd</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export const purchaseHotspotLicense = createServerFn({ method: "POST" })
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
    const total = 200_000;
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
      .from("hotspot_licenses")
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
      console.error("[HOTSPOT] DB insert failed:", insertError.message);
    }

    const license: HotspotLicenseResult = {
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
      items: [{ name: "Hotspot License — cloud voucher validation & RADIUS", price: total }],
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
          subject: `Invoice — Hotspot License — ${reference}`,
          html: `<p>Your invoice for the Hotspot License is attached.</p>`,
          attachments: [{ filename: `nlsc-invoice-${reference.toLowerCase()}.pdf`, content: pdfBuffer.toString("base64") }],
        });
        console.log(`[HOTSPOT] Invoice email sent to ${data.contactEmail}`);
      } catch (err) {
        console.error("[HOTSPOT] Invoice email failed:", err);
      }

      try {
        await resend.emails.send({
          from: config.emailFrom,
          to: data.contactEmail,
          subject: `Your Hotspot License is active — ${reference}`,
          html: buildHotspotEmailHtml(license, data.orgName),
        });
        console.log(`[HOTSPOT] Activation email sent to ${data.contactEmail}`);
      } catch (err) {
        console.error("[HOTSPOT] Activation email failed:", err);
      }
    }

    return { success: true, license };
  });

export const createVouchers = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().min(1),
      packageName: z.string().min(1),
      price: z.number().min(0),
      durationHours: z.number().min(1).max(87600),
      quantity: z.number().min(1).max(500),
      prefix: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { data: license } = await supabaseAdmin
      .from("hotspot_licenses")
      .select("id")
      .eq("token", data.token)
      .eq("status", "active")
      .single();

    if (!license) throw new Error("Invalid or inactive license");

    const now = new Date();
    const expiresAt = new Date(now.getTime() + data.durationHours * 3600000).toISOString();

    const vouchers = [];
    for (let i = 0; i < data.quantity; i++) {
      vouchers.push({
        license_id: license.id,
        code: generateVoucherCode(data.prefix ?? "NLSC", i),
        package_name: data.packageName,
        price: data.price,
        duration_hours: data.durationHours,
        status: "active",
        expires_at: expiresAt,
      });
    }

    const { error } = await supabaseAdmin.from("hotspot_vouchers").insert(vouchers);

    if (error) throw new Error(error.message);

    const { data: created } = await supabaseAdmin
      .from("hotspot_vouchers")
      .select("id, code, package_name, price, duration_hours, status, expires_at, created_at")
      .eq("license_id", license.id)
      .order("created_at", { ascending: false })
      .limit(data.quantity);

    return { success: true, vouchers: created ?? [] };
  });

export const validateVoucher = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      code: z.string().min(1),
      mac: z.string().optional(),
      nasIp: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { data: voucher } = await supabaseAdmin
      .from("hotspot_vouchers")
      .select("id, code, package_name, price, duration_hours, status, expires_at, license_id")
      .eq("code", data.code.toUpperCase())
      .single();

    if (!voucher) {
      return { valid: false, reason: "Invalid voucher code" };
    }

    if (voucher.status === "used") {
      return { valid: false, reason: "Voucher already used" };
    }

    if (voucher.status === "revoked") {
      return { valid: false, reason: "Voucher revoked" };
    }

    if (voucher.status === "expired") {
      return { valid: false, reason: "Voucher expired" };
    }

    if (new Date(voucher.expires_at) < new Date()) {
      await supabaseAdmin
        .from("hotspot_vouchers")
        .update({ status: "expired" })
        .eq("id", voucher.id);
      return { valid: false, reason: "Voucher expired" };
    }

    return {
      valid: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        package_name: voucher.package_name,
        price: voucher.price,
        duration_hours: voucher.duration_hours,
      },
    };
  });

export const useVoucher = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      code: z.string().min(1),
      phone: z.string().optional(),
      mac: z.string().optional(),
      nasIp: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { data: voucher } = await supabaseAdmin
      .from("hotspot_vouchers")
      .select("id, code, status, license_id")
      .eq("code", data.code.toUpperCase())
      .single();

    if (!voucher) throw new Error("Invalid voucher code");
    if (voucher.status !== "active") throw new Error("Voucher is not active");

    const { error } = await supabaseAdmin
      .from("hotspot_vouchers")
      .update({
        status: "used",
        used_by_phone: data.phone ?? null,
        used_at: new Date().toISOString(),
      })
      .eq("id", voucher.id);

    if (error) throw new Error(error.message);

    return { success: true };
  });

export const getVoucherStats = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { data: license } = await supabaseAdmin
      .from("hotspot_licenses")
      .select("id")
      .eq("token", data.token)
      .single();

    if (!license) throw new Error("Invalid license");

    const { data: vouchers } = await supabaseAdmin
      .from("hotspot_vouchers")
      .select("status")
      .eq("license_id", license.id);

    const total = vouchers?.length ?? 0;
    const active = vouchers?.filter((v) => v.status === "active").length ?? 0;
    const used = vouchers?.filter((v) => v.status === "used").length ?? 0;
    const expired = vouchers?.filter((v) => v.status === "expired").length ?? 0;

    return { total, active, used, expired };
  });

export const listVouchers = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), limit: z.number().optional().default(50) }))
  .handler(async ({ data }) => {
    const { data: license } = await supabaseAdmin
      .from("hotspot_licenses")
      .select("id")
      .eq("token", data.token)
      .single();

    if (!license) throw new Error("Invalid license");

    const { data: vouchers } = await supabaseAdmin
      .from("hotspot_vouchers")
      .select("id, code, package_name, price, duration_hours, status, used_by_phone, used_at, expires_at, created_at")
      .eq("license_id", license.id)
      .order("created_at", { ascending: false })
      .limit(data.limit);

    return vouchers ?? [];
  });

export const getHotspotLicense = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { data: license } = await supabaseAdmin
      .from("hotspot_licenses")
      .select("id, reference, org_name, contact_email, contact_phone, token, status, total, currency, created_at")
      .eq("token", data.token)
      .single();

    return license ?? null;
  });
