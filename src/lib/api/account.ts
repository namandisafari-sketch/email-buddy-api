import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "../../integrations/supabase/client.server";

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

    const { data: customer, error: insertError } = await supabaseAdmin
      .from("customers")
      .insert({
        email: data.email,
        password_hash: passwordHash,
        org_name: data.orgName ?? null,
        phone: data.phone ?? null,
      })
      .select("id, email, org_name, phone, created_at")
      .single();

    if (insertError) throw new Error(insertError.message);
    if (!customer) throw new Error("Failed to create customer");

    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();

    const { error: sessionError } = await supabaseAdmin
      .from("customer_sessions")
      .insert({ customer_id: customer.id, token, expires_at: expiresAt });

    if (sessionError) throw new Error(sessionError.message);

    return {
      success: true,
      customer: { id: customer.id, email: customer.email, orgName: customer.org_name, phone: customer.phone },
      token,
    };
  });

export const loginCustomer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { data: customer, error: findError } = await supabaseAdmin
      .from("customers")
      .select("id, email, password_hash, org_name, phone")
      .eq("email", data.email)
      .single();

    if (findError || !customer) throw new Error("Invalid email or password");

    const valid = await verifyPassword(data.password, customer.password_hash);
    if (!valid) throw new Error("Invalid email or password");

    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();

    const { error: sessionError } = await supabaseAdmin
      .from("customer_sessions")
      .insert({ customer_id: customer.id, token, expires_at: expiresAt });

    if (sessionError) throw new Error(sessionError.message);

    return {
      success: true,
      customer: { id: customer.id, email: customer.email, orgName: customer.org_name, phone: customer.phone },
      token,
    };
  });

export const getSessionCustomer = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("customer_sessions")
      .select("customer_id")
      .eq("token", data.token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (sessionError || !session) return { customer: null };

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id, email, org_name, phone, created_at")
      .eq("id", session.customer_id)
      .single();

    if (!customer) return { customer: null };

    return {
      customer: { id: customer.id, email: customer.email, orgName: customer.org_name, phone: customer.phone, createdAt: customer.created_at },
    };
  });

export const getCustomerOrders = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("customer_sessions")
      .select("customer_id")
      .eq("token", data.token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (sessionError || !session) throw new Error("Unauthorized");

    const { data: domains } = await supabaseAdmin
      .from("domain_orders")
      .select("reference, domain, tld, years, total, currency, status, created_at")
      .eq("customer_id", session.customer_id)
      .order("created_at", { ascending: false });

    const { data: activations } = await supabaseAdmin
      .from("activations")
      .select("reference, org_name, contact_email, status, created_at, token, smtp_password")
      .eq("customer_id", session.customer_id)
      .order("created_at", { ascending: false });

    const { data: subdomainLicenses } = await supabaseAdmin
      .from("subdomain_licenses")
      .select("id, reference, org_name, contact_email, domain, token, status, total, currency, created_at")
      .eq("customer_id", session.customer_id)
      .order("created_at", { ascending: false });

    const { data: nsisLicenses } = await supabaseAdmin
      .from("nsis_licenses")
      .select("id, reference, org_name, contact_email, token, status, total, currency, created_at")
      .eq("customer_id", session.customer_id)
      .order("created_at", { ascending: false });

    return { domains: domains ?? [], activations: activations ?? [], subdomainLicenses: subdomainLicenses ?? [], nsisLicenses: nsisLicenses ?? [] };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().min(1),
      orgName: z.string().optional(),
      phone: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { data: session } = await supabaseAdmin
      .from("customer_sessions")
      .select("customer_id")
      .eq("token", data.token)
      .gt("expires_at", new Date().toISOString())
      .single();
    if (!session) throw new Error("Unauthorized");

    const updates: Record<string, string> = {};
    if (data.orgName !== undefined) updates.org_name = data.orgName;
    if (data.phone !== undefined) updates.phone = data.phone;

    const { error } = await supabaseAdmin
      .from("customers")
      .update(updates)
      .eq("id", session.customer_id);

    if (error) throw new Error(error.message);

    return { success: true };
  });

export const changePassword = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().min(1),
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
    }),
  )
  .handler(async ({ data }) => {
    const { data: session } = await supabaseAdmin
      .from("customer_sessions")
      .select("customer_id")
      .eq("token", data.token)
      .gt("expires_at", new Date().toISOString())
      .single();
    if (!session) throw new Error("Unauthorized");

    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("password_hash")
      .eq("id", session.customer_id)
      .single();
    if (!customer) throw new Error("Customer not found");

    const valid = await verifyPassword(data.currentPassword, customer.password_hash);
    if (!valid) throw new Error("Current password is incorrect");

    const passwordHash = await hashPassword(data.newPassword);
    const { error } = await supabaseAdmin
      .from("customers")
      .update({ password_hash: passwordHash })
      .eq("id", session.customer_id);

    if (error) throw new Error(error.message);

    return { success: true };
  });
