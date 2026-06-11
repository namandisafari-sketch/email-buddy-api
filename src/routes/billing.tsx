import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { CodeBlock, Eyebrow } from "@/components/ui/primitives";
import { BRAND, CONTACT, CRYPTO_OPTIONS, DISCOUNT } from "@/lib/site-data";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Local Billing & Crypto Activation | NLSC" },
      {
        name: "description",
        content:
          "Activate your NLSCEVO + Email Automation bundle. Request a verified call from the NLSC financial handle and complete your transaction via crypto. Pay on the 14th to save USh 100,000.",
      },
      { property: "og:title", content: "Local Billing & Crypto Activation | NLSC" },
    ],
  }),
  component: BillingPage,
});

function nextFourteenth() {
  const now = new Date();
  let target = new Date(now.getFullYear(), now.getMonth(), 14);
  if (now.getDate() > 14) target = new Date(now.getFullYear(), now.getMonth() + 1, 14);
  return target.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function BillingPage() {
  const [org, setOrg] = useState("");
  const [phone, setPhone] = useState("");
  const [coin, setCoin] = useState(CRYPTO_OPTIONS[0].coin);
  const [requested, setRequested] = useState(false);
  const fourteenth = useMemo(nextFourteenth, []);

  const ref = useMemo(
    () => "NLSC-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    [],
  );

  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <Eyebrow>Local billing · Crypto activation</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Activate your bundle</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            Request a verified call from the NLSC financial handle to activate payment, then complete your
            transaction via crypto. Your bundle total is{" "}
            <strong className="text-foreground">{BRAND.bundlePrice}</strong>.
          </p>
        </div>
      </section>

      {/* Discount banner */}
      <section className="border-b border-border bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif text-2xl font-semibold text-primary">
                Pay on the {DISCOUNT.day} · save {DISCOUNT.amount}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Next eligible date: {fourteenth}</p>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              <strong className="text-foreground">Why the {DISCOUNT.day}?</strong> {DISCOUNT.why}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-2">
        {/* Activation request */}
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
          <h2 className="font-serif text-xl font-semibold">1 · Request payment activation</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The NLSC financial handle calls you to verify and activate your payment.
          </p>

          <label className="mt-5 block text-sm font-medium">Registered organisation</label>
          <input
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="Your registered company name"
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />

          <label className="mt-4 block text-sm font-medium">Phone to be called</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XX XXX XXX"
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />

          <button
            onClick={() => setRequested(true)}
            disabled={!org || !phone}
            className="mt-6 w-full rounded-md bg-ink px-5 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Request call from financial handle
          </button>

          {requested && (
            <div className="mt-5 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
              <p className="font-medium text-foreground">Activation request received.</p>
              <p className="mt-1 text-muted-foreground">
                Reference <code className="font-mono">{ref}</code>. Our financial handle will call{" "}
                <strong className="text-foreground">{phone}</strong> from{" "}
                <strong className="text-foreground">{CONTACT.phone}</strong> to verify {org} and activate
                payment.
              </p>
            </div>
          )}

          <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-xs text-muted-foreground">
            <strong className="text-foreground">Security:</strong> {CONTACT.phone} is the only number that
            calls you to verify an activation. Never share your secure NLSCEVO token, password or wallet keys
            with anyone — not even the caller.
          </div>
        </div>

        {/* Crypto */}
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
          <h2 className="font-serif text-xl font-semibold">2 · Complete transaction via crypto</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Once verified, settle {BRAND.bundlePrice} (UGX equivalent) in your chosen coin.
          </p>

          <div className="mt-5 space-y-2">
            {CRYPTO_OPTIONS.map((c) => (
              <label
                key={c.coin}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                  coin === c.coin ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
                }`}
              >
                <input
                  type="radio"
                  name="coin"
                  checked={coin === c.coin}
                  onChange={() => setCoin(c.coin)}
                  className="accent-primary"
                />
                <span className="flex-1">
                  <span className="font-medium">{c.coin}</span>{" "}
                  <span className="text-muted-foreground">· {c.network}</span>
                </span>
                <span className="text-xs text-muted-foreground">{c.note}</span>
              </label>
            ))}
          </div>

          <p className="mt-5 text-sm font-medium">Payment memo (include this exactly)</p>
          <div className="mt-2">
            <CodeBlock>{`${ref} · ${coin}`}</CodeBlock>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            The wallet address for {coin} is issued live by the financial handle during your verification call
            — we never publish static wallet addresses to protect you from spoofing. Your receipt is issued
            instantly on confirmation.
          </p>
        </div>
      </div>

      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground">
          <h3 className="font-serif text-base font-semibold text-foreground">Registered office</h3>
          <p className="mt-2">{CONTACT.address}</p>
          <p>{CONTACT.poBox}</p>
          <p className="mt-1">Verification line: {CONTACT.phone}</p>
        </div>
      </section>
    </SiteLayout>
  );
}
