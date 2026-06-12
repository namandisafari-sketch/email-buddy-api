import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import postgres from "postgres";
import { Resend } from "resend";
import { getServerConfig } from "../config.server";
import { buildInvoicePdf, type InvoiceData } from "./invoice";

function generateReference() {
  return "NLSC-" + crypto.randomUUID().slice(0, 8).toUpperCase();
}

async function withDb<T>(fn: (sql: postgres.Sql) => Promise<T>): Promise<T> {
  const config = getServerConfig();
  if (!config.databaseUrl) {
    console.warn("[MTN MoMo] No DATABASE_URL set — skipping DB");
    return undefined as T;
  }
  const sql = postgres(config.databaseUrl, { max: 1 });
  try {
    return await fn(sql);
  } finally {
    await sql.end();
  }
}

export type ApiCredentials = {
  reference: string;
  token: string;
  orgName: string;
  email: {
    smtpServer: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    apiKey: string;
    apiBase: string;
  };
  whatsapp: {
    apiBase: string;
    bearerToken: string;
    defaultInstance: string;
  };
  support: {
    email: string;
    phone: string;
    docs: string;
  };
};

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "nlscevo_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generatePassword() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(36).padStart(2, "0")).join("");
}

const LOGO_SVG = `<svg viewBox="0 0 680 680" width="48" height="48" style="display:block;margin:0 auto;">
  <rect width="680" height="680" rx="120" fill="#080808" />
  <path fill="none" stroke="#5a9e82" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" d="M 185 220 C 185 220, 185 370, 340 370 C 495 370, 495 480, 495 480" />
  <path fill="none" stroke="#5a9e82" stroke-width="40" stroke-linecap="round" d="M 495 220 C 495 220, 495 370, 340 370 C 185 370, 185 480, 185 480" />
  <circle fill="#5a9e82" cx="340" cy="530" r="26" />
</svg>`;

export function buildActivationEmailHtml(creds: ApiCredentials): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your NLSC bundle is active</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <!-- header -->
          <tr>
            <td style="background-color:#1a1a1a;padding:32px 40px;text-align:center;">
              ${LOGO_SVG}
              <p style="margin:8px 0 0;font-size:12px;color:#a0a0a0;letter-spacing:2px;text-transform:uppercase;">Bundle Activation Confirmed</p>
            </td>
          </tr>
          <!-- body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 6px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Activation confirmed</p>
              <h2 style="margin:0 0 4px;font-size:24px;font-weight:600;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">Welcome, ${creds.orgName}</h2>
              <p style="margin:0 0 24px;font-size:15px;color:#666;line-height:1.6;">Your NLSCEVO + Email Automation bundle is active. Use the credentials below to connect your services.</p>

              <!-- reference -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f4;border-radius:8px;padding:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Reference</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${creds.reference}</p>
                  </td>
                </tr>
              </table>

              <!-- bearer token -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f4;border-radius:8px;padding:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Bearer Token</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#1a1a1a;font-family:monospace;word-break:break-all;">${creds.token}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#999;">Use this token to authenticate all API requests. Keep it secret — it is shown once.</p>
                  </td>
                </tr>
              </table>

              <!-- two columns -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="50%" valign="top" style="padding-right:12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f4;border-radius:8px;padding:16px;">
                      <tr><td>
                        <h3 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">Email Automation API</h3>
                        <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#555;line-height:1.8;">
                          <tr><td style="padding:2px 0;color:#888;font-size:11px;">SMTP server</td></tr>
                          <tr><td style="padding:0 0 8px;font-family:monospace;font-size:13px;color:#1a1a1a;">${creds.email.smtpServer}:${creds.email.smtpPort}</td></tr>
                          <tr><td style="padding:2px 0;color:#888;font-size:11px;">SMTP username</td></tr>
                          <tr><td style="padding:0 0 8px;font-family:monospace;font-size:13px;color:#1a1a1a;">${creds.email.smtpUsername}</td></tr>
                          <tr><td style="padding:2px 0;color:#888;font-size:11px;">SMTP password</td></tr>
                          <tr><td style="padding:0 0 8px;font-family:monospace;font-size:13px;color:#1a1a1a;">${creds.email.smtpPassword}</td></tr>
                          <tr><td style="padding:2px 0;color:#888;font-size:11px;">API base URL</td></tr>
                          <tr><td style="padding:0 0 8px;font-family:monospace;font-size:13px;color:#1a1a1a;">${creds.email.apiBase}</td></tr>
                          <tr><td style="padding:2px 0;color:#888;font-size:11px;">API key</td></tr>
                          <tr><td style="padding:0 0 8px;font-family:monospace;font-size:13px;color:#1a1a1a;">${creds.email.apiKey}</td></tr>
                        </table>
                      </td></tr>
                    </table>
                  </td>
                  <td width="50%" valign="top" style="padding-left:12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f4;border-radius:8px;padding:16px;">
                      <tr><td>
                        <h3 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">NLSCEVO WhatsApp API</h3>
                        <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#555;line-height:1.8;">
                          <tr><td style="padding:2px 0;color:#888;font-size:11px;">API base URL</td></tr>
                          <tr><td style="padding:0 0 8px;font-family:monospace;font-size:13px;color:#1a1a1a;">${creds.whatsapp.apiBase}</td></tr>
                          <tr><td style="padding:2px 0;color:#888;font-size:11px;">Bearer token</td></tr>
                          <tr><td style="padding:0 0 8px;font-family:monospace;font-size:13px;color:#1a1a1a;">${creds.whatsapp.bearerToken}</td></tr>
                          <tr><td style="padding:2px 0;color:#888;font-size:11px;">Default instance</td></tr>
                          <tr><td style="padding:0 0 8px;font-family:monospace;font-size:13px;color:#1a1a1a;">${creds.whatsapp.defaultInstance}</td></tr>
                        </table>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- endpoints -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f4;border-radius:8px;padding:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <h3 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">Quick start — endpoints</h3>
                    <table cellpadding="0" cellspacing="0" width="100%" style="font-size:13px;">
                      <tr>
                        <td valign="top" width="50%">
                          <p style="margin:0 0 6px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Email</p>
                          <p style="margin:0 0 4px;font-family:monospace;font-size:12px;color:#555;">POST /email/send</p>
                          <p style="margin:0 0 4px;font-family:monospace;font-size:12px;color:#555;">POST /email/bulk</p>
                          <p style="margin:0 0 4px;font-family:monospace;font-size:12px;color:#555;">POST /webhooks/email</p>
                        </td>
                        <td valign="top" width="50%">
                          <p style="margin:0 0 6px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">WhatsApp</p>
                          <p style="margin:0 0 4px;font-family:monospace;font-size:12px;color:#555;">POST /message/sendText/{instance}</p>
                          <p style="margin:0 0 4px;font-family:monospace;font-size:12px;color:#555;">POST /message/sendMedia/{instance}</p>
                          <p style="margin:0 0 4px;font-family:monospace;font-size:12px;color:#555;">POST /instance/create</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- license agreement -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0d8;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <h3 style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">License Agreement — Your Rights & Obligations</h3>
                    <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.6;">This license is issued to <strong>${creds.orgName}</strong> (Reference: ${creds.reference}) under the terms set out below. By using the credentials delivered in this email, you accept these terms.</p>

                    <h4 style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1a1a1a;">1. One API, Every Capability</h4>
                    <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.6;">There is a single NLSC license — one API that carries all capabilities: transactional SMTP relay, bulk campaign sending, automation flows, inbound parse webhooks, and the Server Authority token. You do not buy separate products; the one license unlocks everything.</p>

                    <h4 style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1a1a1a;">2. Lifetime Validity</h4>
                    <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.6;">The license is valid for the lifetime of your stack. You pay once. There is no expiry, no renewal, and no subscription. The license remains valid as long as these terms are honored.</p>

                    <h4 style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1a1a1a;">3. Full Ownership</h4>
                    <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.6;">On issuance you hold full ownership of your API credentials and Server Authority token, bound to your registered organisation. Ownership cannot be revoked except where these terms are breached.</p>

                    <h4 style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1a1a1a;">4. No Reselling or Transfer</h4>
                    <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.6;">The license is bound to your verified organisation and may not be resold, sublicensed, transferred, leased, or shared with any third party. Forging or misrepresenting an NLSC license is a breach of contract and a violation of the Computer Misuse Act of Uganda.</p>

                    <h4 style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1a1a1a;">5. Unlimited Domain-Based Professional Email</h4>
                    <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.6;">You may produce an unlimited number of professional email addresses across your owned and verified domains. There is no per-mailbox fee and no cap on addresses, provided each sending domain maintains valid SPF, DKIM and DMARC records.</p>

                    <h4 style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1a1a1a;">6. Discontinuation Conditions</h4>
                    <p style="margin:0 0 6px;font-size:13px;color:#555;line-height:1.6;">This license is discontinued immediately and no refund is issued if:</p>
                    <ul style="margin:0 0 12px;padding-left:20px;font-size:13px;color:#555;line-height:1.8;">
                      <li>You provided false information during registration.</li>
                      <li>You resell, sublicense, transfer, or share the license.</li>
                      <li>You send unsolicited bulk mail, phishing, malware, or spoofed identities.</li>
                      <li>Your sending domains show persistent deliverability abuse — complaint rates above 0.1%, ignored unsubscribe requests, or invalid SPF/DKIM/DMARC — and you fail to correct it.</li>
                    </ul>

                    <h4 style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1a1a1a;">7. Governing Law</h4>
                    <p style="margin:0 0 0;font-size:13px;color:#555;line-height:1.6;">These terms are governed by and adjudicated under the laws of the Republic of Uganda. Disputes are subject to the jurisdiction of the courts of Uganda.</p>
                  </td>
                </tr>
              </table>

              <!-- support -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0e8;border-radius:8px;padding:16px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">
                      <strong style="color:#1a1a1a;">Need help?</strong> Contact support at
                      <a href="mailto:${creds.support.email}" style="color:#4a4a4a;text-decoration:underline;">${creds.support.email}</a>
                      or call <a href="tel:${creds.support.phone.replace(/\s/g, "")}" style="color:#4a4a4a;text-decoration:underline;">${creds.support.phone}</a>.
                      <br/>Full API docs: <a href="${creds.support.docs}" style="color:#4a4a4a;text-decoration:underline;">${creds.support.docs}</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
          <!-- footer -->
          <tr>
            <td style="border-top:1px solid #e8e8e0;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999;">© ${new Date().getFullYear()} NLSC — Nile Logic & Secure Cloud Ltd</p>
              <p style="margin:4px 0 0;font-size:11px;color:#aaa;">1st Floor Lunna Plaza, 25, Entebbe Road, Kampala, Uganda</p>
              <p style="margin:4px 0 0;font-size:11px;color:#aaa;">P.O Box: 6089 · Verification line: 0326 338 014</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildEnvFile(creds: ApiCredentials): string {
  return `# NLSC API Credentials — ${creds.reference}
# Delivered to ${creds.orgName}
# Keep this file secure. Do not share or commit to version control.

# Email Automation — SMTP
SMTP_SERVER=${creds.email.smtpServer}
SMTP_PORT=${creds.email.smtpPort}
SMTP_USERNAME=${creds.email.smtpUsername}
SMTP_PASSWORD=${creds.email.smtpPassword}

# Email Automation — REST API
EMAIL_API_BASE=${creds.email.apiBase}
EMAIL_API_KEY=${creds.email.apiKey}

# NLSCEVO WhatsApp API
WHATSAPP_API_BASE=${creds.whatsapp.apiBase}
WHATSAPP_BEARER_TOKEN=${creds.whatsapp.bearerToken}
WHATSAPP_DEFAULT_INSTANCE=${creds.whatsapp.defaultInstance}

# General
AUTH_TOKEN=${creds.token}
REFERENCE=${creds.reference}
ORGANISATION=${creds.orgName}
`;
}

export function buildCredentialsJson(creds: ApiCredentials): string {
  return JSON.stringify(creds, null, 2);
}

async function sendActivationEmail(to: string, creds: ApiCredentials, invoices: InvoiceData[]) {
  const config = getServerConfig();
  if (!config.resendApiKey) {
    console.warn("[Resend] No RESEND_API_KEY set — skipping email");
    return;
  }
  const resend = new Resend(config.resendApiKey);
  const html = buildActivationEmailHtml(creds);
  const envContent = buildEnvFile(creds);
  const jsonContent = buildCredentialsJson(creds);

  const pdfBuffers = await Promise.all(invoices.map(buildInvoicePdf));

  await resend.emails.send({
    from: config.emailFrom,
    to,
    subject: `Your NLSC bundle is active — Reference ${creds.reference}`,
    html,
    attachments: [
      {
        filename: `nlsc-${creds.reference.toLowerCase()}.env`,
        content: Buffer.from(envContent).toString("base64"),
      },
      {
        filename: `nlsc-${creds.reference.toLowerCase()}-credentials.json`,
        content: Buffer.from(jsonContent).toString("base64"),
      },
      ...pdfBuffers.map((buf, i) => ({
        filename: `nlsc-invoice-${invoices[i].reference.toLowerCase()}.pdf`,
        content: buf.toString("base64"),
      })),
    ],
  });
  console.log(`[Resend] Activation email sent to ${to} with credential files and ${invoices.length} invoices`);
}

function buildRequestCallHtml(creds: { phone: string; ref: string; orgName: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment activation request received — NLSC</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#1a1a1a;padding:32px 40px;text-align:center;">
              ${LOGO_SVG}
              <p style="margin:8px 0 0;font-size:12px;color:#a0a0a0;letter-spacing:2px;text-transform:uppercase;">Activation Request Received</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">Thank you, ${creds.orgName}</h2>
              <p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.6;">Your payment activation request has been received. Our financial handle will call you at <strong>${creds.phone}</strong> from <strong>0326 338 014</strong> to verify your organisation and activate your payment.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f4;border-radius:8px;padding:16px;margin:16px 0;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Reference</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1a1a1a;font-family:monospace;">${creds.ref}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:13px;color:#888;line-height:1.6;"><strong>Security:</strong> 0326 338 014 is the only number that calls you to verify an activation. Never share your secure NLSCEVO token, password or wallet keys with anyone — not even the caller.</p>
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

async function sendRequestCallEmail(to: string, orgName: string, phone: string, ref: string) {
  const config = getServerConfig();
  if (!config.resendApiKey) {
    console.warn("[Resend] No RESEND_API_KEY set — skipping request call email");
    return;
  }
  const resend = new Resend(config.resendApiKey);
  const html = buildRequestCallHtml({ phone, ref, orgName });
  await resend.emails.send({
    from: config.emailFrom,
    to,
    subject: `Payment activation request received — Reference ${ref}`,
    html,
  });
  console.log(`[Resend] Request call confirmation sent to ${to}`);
}

export const submitMomoProof = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      reference: z.string().min(1),
      proofText: z.string().min(1),
      contactEmail: z.string().email(),
      contactPhone: z.string().min(1),
      orgName: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    console.log("[submitMomoProof] Starting submission for", data.contactEmail);
    try {
    const ref = data.reference;
    const token = generateToken();
    const smtpPassword = generatePassword();
    const instanceName = data.orgName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);

    const credentials: ApiCredentials = {
      reference: ref,
      token,
      orgName: data.orgName,
      email: {
        smtpServer: "smtp.resend.com",
        smtpPort: 587,
        smtpUsername: `smtp-${instanceName}@nlscug.com`,
        smtpPassword,
        apiKey: token,
        apiBase: "https://api.nlscug.com/v1",
      },
      whatsapp: {
        apiBase: "https://evo.nlscug.com",
        bearerToken: token,
        defaultInstance: instanceName,
      },
      support: {
        email: "api@nlscug.com",
        phone: "0326 338 014",
        docs: "https://docs.nlscug.com",
      },
    };

    await withDb(async (sql) => {
      await sql`
        insert into activations (reference, org_name, contact_email, contact_phone, token, smtp_password, status, proof_text)
        values (${ref}, ${data.orgName}, ${data.contactEmail}, ${data.contactPhone}, ${token}, ${smtpPassword}, 'activated', ${data.proofText})
      `;
    });

    const invoices: InvoiceData[] = [
      {
        reference: ref + "-A",
        orgName: data.orgName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        date: new Date(),
        items: [{ name: "NLSCEVO WhatsApp API — Lifetime License", price: 300000 }],
        discount: 0,
        total: 300000,
        currency: "UGX",
      },
      {
        reference: ref + "-B",
        orgName: data.orgName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        date: new Date(),
        items: [{ name: "Email Automation API — SMTP Relay & Campaigns", price: 380000 }],
        discount: 0,
        total: 380000,
        currency: "UGX",
      },
    ];

    await sendActivationEmail(data.contactEmail, credentials, invoices);

    return { success: true, credentials };
    } catch (err) {
      console.error("[submitMomoProof] Error:", err);
      throw err;
    }
  });

export const requestMomoPayment = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      phone: z.string().min(1),
      network: z.enum(["mtn"]),
      amount: z.string().min(1),
      contactEmail: z.string().email(),
      orgName: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const config = getServerConfig();
    const reference = generateReference();

    console.log(`[MTN MoMo] Initiating payment: ${data.amount} UGX from ${data.phone}`);
    console.log(`[MTN MoMo] Reference: ${reference}`);
    console.log(`[MTN MoMo] API key: ${config.momo.subscriptionKey}`);

    await sendRequestCallEmail(data.contactEmail, data.orgName, data.phone, reference);

    const errorMessage = "MTN network currently not fine";

    await withDb(async (sql) => {
      await sql`
        insert into momo_payments (reference, phone, network, amount, currency, status, error_message)
        values (${reference}, ${data.phone}, ${data.network}, ${data.amount}, 'UGX', 'failed', ${errorMessage})
      `;
    });

    return {
      success: false,
      reference,
      error: errorMessage,
    };
  });
