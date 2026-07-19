import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/hotspot/use")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { code, phone, mac, nas_ip }: { code?: string; phone?: string; mac?: string; nas_ip?: string } = body;

          if (!code || typeof code !== "string" || !code.trim()) {
            return Response.json(
              { success: false, reason: "Missing voucher code" },
              { status: 400, headers: corsHeaders },
            );
          }

          const { data: voucher } = await supabaseAdmin
            .from("hotspot_vouchers")
            .select("id, code, status, license_id")
            .eq("code", code.toUpperCase().trim())
            .single();

          if (!voucher) {
            return Response.json(
              { success: false, reason: "Invalid voucher code" },
              { headers: corsHeaders },
            );
          }

          if (voucher.status !== "active") {
            return Response.json(
              { success: false, reason: `Voucher is ${voucher.status}` },
              { headers: corsHeaders },
            );
          }

          const { error } = await supabaseAdmin
            .from("hotspot_vouchers")
            .update({
              status: "used",
              used_by_phone: phone ?? null,
              used_at: new Date().toISOString(),
            })
            .eq("id", voucher.id);

          if (error) {
            console.error("[HOTSPOT_API] use error:", error);
            return Response.json(
              { success: false, reason: "Database error" },
              { status: 500, headers: corsHeaders },
            );
          }

          return Response.json({ success: true }, { headers: corsHeaders });
        } catch (err) {
          console.error("[HOTSPOT_API] use error:", err);
          return Response.json(
            { success: false, reason: "Server error" },
            { status: 500, headers: corsHeaders },
          );
        }
      },

      OPTIONS: async () => {
        return new Response(null, {
          headers: {
            ...corsHeaders,
            "Access-Control-Max-Age": "86400",
          },
        });
      },
    },
  },
});
