import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import postgres from "postgres";

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "sess_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256);
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return saltHex + ":" + hashHex;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256);
  const computed = Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return computed === hashHex;
}

const SESSION_DAYS = 30;

async function withDb<T>(fn: (sql: postgres.Sql) => Promise<T>): Promise<T> {
  const { getServerConfig } = await import("../config.server");
  const config = getServerConfig();
  if (!config.databaseUrl) {
    console.warn("[Account] No DATABASE_URL set");
    throw new Error("Database not configured");
  }
  const sql = postgres(config.databaseUrl, { max: 1 });
  try {
    return await fn(sql);
  } finally {
    await sql.end();
  }
}

export const registerCustomer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      orgName: z.string().optional(),
      phone: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const passwordHash = await hashPassword(data.password);
    const customer = await withDb(async (sql) => {
      const [row] = await sql`
        insert into customers (email, password_hash, org_name, phone)
        values (${data.email}, ${passwordHash}, ${data.orgName ?? null}, ${data.phone ?? null})
        returning id, email, org_name, phone, created_at
      `;
      return row as { id: string; email: string; org_name: string | null; phone: string | null; created_at: string };
    });
    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
    await sql`insert into customer_sessions (customer_id, token, expires_at) values (${customer.id}, ${token}, ${expiresAt})`;
    return { success: true, customer: { id: customer.id, email: customer.email, orgName: customer.org_name, phone: customer.phone }, token };
  });

export const loginCustomer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const customer = await withDb(async (sql) => {
      const [row] = await sql`select id, email, password_hash, org_name, phone from customers where email = ${data.email}`;
      return row as { id: string; email: string; password_hash: string; org_name: string | null; phone: string | null } | undefined;
    });
    if (!customer) throw new Error("Invalid email or password");
    const valid = await verifyPassword(data.password, customer.password_hash);
    if (!valid) throw new Error("Invalid email or password");
    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
    await withDb(async (sql) => {
      await sql`insert into customer_sessions (customer_id, token, expires_at) values (${customer.id}, ${token}, ${expiresAt})`;
    });
    return { success: true, customer: { id: customer.id, email: customer.email, orgName: customer.org_name, phone: customer.phone }, token };
  });

export const getSessionCustomer = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const result = await withDb(async (sql) => {
      const [row] = await sql`
        select c.id, c.email, c.org_name, c.phone, c.created_at
        from customer_sessions s
        join customers c on c.id = s.customer_id
        where s.token = ${data.token} and s.expires_at > now()
      `;
      return row as { id: string; email: string; org_name: string | null; phone: string | null; created_at: string } | undefined;
    });
    if (!result) return { customer: null };
    return { customer: { id: result.id, email: result.email, orgName: result.org_name, phone: result.phone, createdAt: result.created_at } };
  });

export const getCustomerOrders = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const session = await withDb(async (sql) => {
      const [row] = await sql`
        select customer_id from customer_sessions
        where token = ${data.token} and expires_at > now()
      `;
      return row as { customer_id: string } | undefined;
    });
    if (!session) throw new Error("Unauthorized");

    const domains = await withDb(async (sql) => {
      const rows = await sql`
        select reference, domain, tld, years, total, currency, status, created_at
        from domain_orders
        where customer_id = ${session.customer_id}
        order by created_at desc
      `;
      return rows as { reference: string; domain: string; tld: string; years: number; total: number; currency: string; status: string; created_at: string }[];
    });

    const activations = await withDb(async (sql) => {
      const rows = await sql`
        select reference, org_name, contact_email, status, created_at
        from activations
        where customer_id = ${session.customer_id}
        order by created_at desc
      `;
      return rows as { reference: string; org_name: string; contact_email: string; status: string; created_at: string }[];
    });

    return { domains, activations };
  });
