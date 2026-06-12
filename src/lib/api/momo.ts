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
