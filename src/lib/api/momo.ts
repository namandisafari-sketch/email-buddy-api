import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import postgres from "postgres";
import { getServerConfig } from "../config.server";

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
    const ref = data.reference;
    const token = generateToken();
    const smtpPassword = generatePassword();
    const instanceName = data.orgName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);

    const credentials: ApiCredentials = {
      reference: ref,
      token,
      orgName: data.orgName,
      email: {
        smtpServer: "mail.nlscug.com",
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

    return { success: true, credentials };
  });

export const requestMomoPayment = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      phone: z.string().min(1),
      network: z.enum(["mtn"]),
      amount: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const config = getServerConfig();
    const reference = generateReference();

    console.log(`[MTN MoMo] Initiating payment: ${data.amount} UGX from ${data.phone}`);
    console.log(`[MTN MoMo] Reference: ${reference}`);
    console.log(`[MTN MoMo] API key: ${config.momo.subscriptionKey}`);

    // Simulate MTN MoMo API call failure
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
