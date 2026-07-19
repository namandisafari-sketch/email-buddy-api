import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/hotspot/validate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { code }: { code?: string } = body;

          if (!code || typeof code !== "string" || !code.trim()) {
            return Response.json(
              { valid: false, reason: "Missing voucher code" },
              { status: 400, headers: corsHeaders },
            );
          }

          const { data: voucher } = await supabaseAdmin
            .from("hotspot_vouchers")
            .select("id, code, package_name, price, duration_hours, status, expires_at, license_id")
            .eq("code", code.toUpperCase().trim())
            .single();

          if (!voucher) {
            return Response.json(
              { valid: false, reason: "Invalid voucher code" },
              { headers: corsHeaders },
            );
          }

          if (voucher.status === "used") {
            return Response.json(
              { valid: false, reason: "Voucher already used" },
              { headers: corsHeaders },
            );
          }

          if (voucher.status === "revoked") {
            return Response.json(
              { valid: false, reason: "Voucher revoked" },
              { headers: corsHeaders },
            );
          }

          if (voucher.status === "expired") {
            return Response.json(
              { valid: false, reason: "Voucher expired" },
              { headers: corsHeaders },
            );
          }

          if (new Date(voucher.expires_at) < new Date()) {
            await supabaseAdmin
              .from("hotspot_vouchers")
              .update({ status: "expired" })
              .eq("id", voucher.id);
            return Response.json(
              { valid: false, reason: "Voucher expired" },
              { headers: corsHeaders },
            );
          }

          return Response.json(
            {
              valid: true,
              voucher: {
                code: voucher.code,
                package_name: voucher.package_name,
                price: voucher.price,
                duration_hours: voucher.duration_hours,
              },
            },
            { headers: corsHeaders },
          );
        } catch (err) {
          console.error("[HOTSPOT_API] validate error:", err);
          return Response.json(
            { valid: false, reason: "Server error" },
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
