import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "NLSC WiFi Portal" },
      { name: "description", content: "Enter your voucher code to access the internet." },
    ],
  }),
  component: PortalPage,
});

type Status = "idle" | "loading" | "valid" | "invalid";

function PortalPage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [reason, setReason] = useState("");
  const [voucher, setVoucher] = useState<{
    code: string;
    package_name: string;
    price: number;
    duration_hours: number;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setStatus("loading");
    setReason("");

    try {
      const res = await fetch("/api/hotspot/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (data.valid) {
        setStatus("valid");
        setVoucher(data.voucher);
      } else {
        setStatus("invalid");
        setReason(data.reason ?? "Invalid code");
      }
    } catch {
      setStatus("invalid");
      setReason("Connection error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            NLSC
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            WiFi Hotspot Portal
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {status === "valid" && voucher ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Connected!
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Your session is active
                </p>
              </div>
              <div className="rounded-xl bg-secondary/30 p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Package</span>
                  <span className="font-medium text-foreground">{voucher.package_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Code</span>
                  <span className="font-mono font-medium text-foreground">{voucher.code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{voucher.duration_hours} hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium text-foreground">UGX {voucher.price.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                You can now browse the internet. Enjoy your session!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  Enter your voucher code
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Type or paste the code from your voucher
                </p>
              </div>

              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="NLSC-XXXXXXXX"
                className="block w-full rounded-lg border border-border bg-background px-4 py-3 text-center font-mono text-lg tracking-widest text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary uppercase"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                autoFocus
              />

              {status === "invalid" && reason && (
                <div className="rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3 text-sm text-destructive text-center">
                  {reason}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !code.trim()}
                className="w-full rounded-lg bg-ink px-5 py-3 text-sm font-medium text-ink-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                {status === "loading" ? "Validating..." : "Connect"}
              </button>
            </form>
          )}

          {status === "valid" && (
            <button
              onClick={() => {
                setStatus("idle");
                setCode("");
                setVoucher(null);
              }}
              className="mt-4 w-full rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/30 transition-colors"
            >
              Use another code
            </button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by NLSC &mdash; Nile Logic & Secure Cloud Ltd<br />
          Contact: <a href="tel:0394568130" className="hover:text-foreground">0394568130</a>
        </p>
      </div>
    </div>
  );
}
