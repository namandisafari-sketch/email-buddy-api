import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { CodeBlock, Eyebrow } from "@/components/ui/primitives";
import {
  BRAND,
  CONTACT,
  CRYPTO_OPTIONS,
  DISCOUNT,
  MOMO_INFO,
  API_DELIVERY,
} from "@/lib/site-data";
import { requestMomoPayment, submitMomoProof } from "@/lib/api/momo";
import type { ApiCredentials } from "@/lib/api/momo";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Billing & Activation | NLSC" },
      {
        name: "description",
        content:
          "Choose your payment method — crypto, bank transfer or mobile money. Activate your NLSCEVO + Email Automation bundle and receive your API credentials instantly.",
      },
      { property: "og:title", content: "Billing & Activation | NLSC" },
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

type PaymentMethod = "crypto" | "bank" | "momo";

function BillingPage() {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [org, setOrg] = useState("");
  const [phone, setPhone] = useState("");
  const [coin, setCoin] = useState(CRYPTO_OPTIONS[0].coin);
  const [requested, setRequested] = useState(false);
  const [momoStep, setMomoStep] = useState<"info" | "proof" | "confirm">("info");
  const [proofRef, setProofRef] = useState("");
  const [proofText, setProofText] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [orgName, setOrgName] = useState("");
  const [cryptoEmail, setCryptoEmail] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState("");
  const [credentials, setCredentials] = useState<ApiCredentials | null>(null);
  const fourteenth = useMemo(nextFourteenth, []);

  const ref = useMemo(
    () => "NLSC-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    [],
  );

  async function handleRequestCall() {
    setRequestLoading(true);
    setRequestError("");
    try {
      await requestMomoPayment({
        data: {
          phone,
          network: "mtn",
          amount: "680000",
          contactEmail: cryptoEmail,
          orgName: org,
        },
      });
      setRequested(true);
    } catch {
      setRequestError("Failed to submit request. Please try again.");
    } finally {
      setRequestLoading(false);
    }
  }

  async function handleSubmitProof() {
    setProofLoading(true);
    setProofError("");
    try {
      const result = await submitMomoProof({
        data: {
          reference: proofRef || ref,
          proofText,
          contactEmail,
          contactPhone,
          orgName,
        },
      });
      if (result.success) {
        setCredentials(result.credentials);
        setMomoStep("confirm");
      }
    } catch {
      setProofError("Failed to submit proof. Please try again.");
    } finally {
      setProofLoading(false);
    }
  }

  const methodIcons: Record<PaymentMethod, string> = {
    crypto: "⟐",
    bank: "⟐",
    momo: "⟐",
  };

  const methodLabels: Record<PaymentMethod, string> = {
    crypto: "Crypto Currency",
    bank: "Bank Transfer",
    momo: "Mobile Money",
  };

  const methodDescriptions: Record<PaymentMethod, string> = {
    crypto: "Pay with USDT or BTC. Lowest network fees.",
    bank: "Pay directly to NLSC LTD at any bank in Uganda.",
    momo: "Send via MTN or Airtel Mobile Money. Fast & easy.",
  };

  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <Eyebrow>Billing · Activate your bundle</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
            Choose your payment method
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            Your bundle total is{" "}
            <strong className="text-foreground">{BRAND.bundlePrice}</strong>.
            Pick the option that works best for you.
          </p>
        </div>
      </section>

      {/* Discount banner */}
      <section className="border-b border-border bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif text-xl font-semibold text-primary">
                Pay on the {DISCOUNT.day} · save {DISCOUNT.amount}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">Next eligible date: {fourteenth}</p>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              <strong className="text-foreground">Why the {DISCOUNT.day}?</strong> {DISCOUNT.why}
            </p>
          </div>
        </div>
      </section>

      {/* Payment method selection */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10">
          {!method ? (
            <div className="grid gap-6 sm:grid-cols-3">
              {(Object.keys(methodIcons) as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className="group rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary">
                    {methodIcons[m]}
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold">{methodLabels[m]}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{methodDescriptions[m]}</p>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button
                onClick={() => {
                  setMethod(null);
                  setMomoStep("info");
                  setCredentials(null);
                }}
                className="mb-6 text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to payment methods
              </button>

              <div className="mb-6">
                <Eyebrow>{methodLabels[method]}</Eyebrow>
                <h2 className="mt-2 font-serif text-2xl font-semibold">
                  {method === "crypto" && "Complete your crypto payment"}
                  {method === "bank" && "Pay by bank transfer"}
                  {method === "momo" && "Pay via mobile money"}
                </h2>
              </div>

              {method === "crypto" && (
                <div className="grid gap-10 lg:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
                    <h3 className="font-serif text-xl font-semibold">1 · Request payment activation</h3>
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

                    <label className="mt-4 block text-sm font-medium">Email for confirmation</label>
                    <input
                      value={cryptoEmail}
                      onChange={(e) => setCryptoEmail(e.target.value)}
                      type="email"
                      placeholder="you@company.com"
                      className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />

                    <button
                      onClick={handleRequestCall}
                      disabled={requestLoading || !org || !phone || !cryptoEmail}
                      className="mt-6 w-full rounded-md bg-ink px-5 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      {requestLoading ? "Submitting…" : "Request call from financial handle"}
                    </button>

                    {requestError && (
                      <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                        {requestError}
                      </div>
                    )}

                    {requested && (
                      <div className="mt-5 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                        <p className="font-medium text-foreground">Activation request received.</p>
                        <p className="mt-1 text-muted-foreground">
                          Reference <code className="font-mono">{ref}</code>. Our financial handle will call{" "}
                          <strong className="text-foreground">{phone}</strong> from{" "}
                          <strong className="text-foreground">{CONTACT.phone}</strong> to verify {org}.
                        </p>
                      </div>
                    )}

                    <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-xs text-muted-foreground">
                      <strong className="text-foreground">Security:</strong> {CONTACT.phone} is the only
                      number that calls you to verify an activation. Never share your secure NLSCEVO token,
                      password or wallet keys with anyone.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
                    <h3 className="font-serif text-xl font-semibold">2 · Complete via crypto</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Once verified, settle {BRAND.bundlePrice} (UGX equivalent) in your chosen coin.
                    </p>

                    <div className="mt-5 space-y-2">
                      {CRYPTO_OPTIONS.map((c) => (
                        <label
                          key={c.coin}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                            coin === c.coin
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-secondary"
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
                      The wallet address for {coin} is issued live by the financial handle during your
                      verification call — we never publish static wallet addresses. Your receipt is issued
                      instantly on confirmation.
                    </p>
                  </div>
                </div>
              )}

              {method === "bank" && (
                <div className="max-w-2xl rounded-2xl border border-border bg-card p-7 shadow-sm">
                  <h3 className="font-serif text-xl font-semibold">Bank transfer details</h3>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        Account name
                      </p>
                      <p className="mt-1 font-medium">{BRAND.legalName}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        Amount
                      </p>
                      <p className="mt-1 font-serif text-2xl font-semibold text-primary">
                        {BRAND.bundlePrice}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        Your reference
                      </p>
                      <p className="mt-1 font-mono text-sm">{ref}</p>
                    </div>
                  </div>
                  <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
                    <strong className="text-foreground">Next step:</strong> Walk into any bank, state you
                    are paying <strong>{BRAND.legalName}</strong>, and use reference{" "}
                    <code className="font-mono">{ref}</code>. Settlement is confirmed against your order
                    reference. After payment,{" "}
                    <a href={`mailto:${BRAND.email}?subject=Payment%20proof%20${ref}`} className="text-primary hover:underline">
                      email your proof to {BRAND.email}
                    </a>{" "}
                    to receive your API credentials.
                  </div>
                </div>
              )}

              {method === "momo" && momoStep !== "confirm" && (
                <div className="grid gap-10 lg:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
                    <h3 className="font-serif text-xl font-semibold">Send mobile money</h3>
                    {momoStep === "info" && (
                      <>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Send the exact bundle amount to the mobile money number below, then submit your
                          transaction proof to receive your API credentials.
                        </p>
                        <div className="mt-6 space-y-4">
                          <div className="rounded-lg border border-border bg-background p-4">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">
                              Mobile money number
                            </p>
                            <p className="mt-1 font-mono text-lg font-semibold">{MOMO_INFO.number}</p>
                          </div>
                          <div className="rounded-lg border border-border bg-background p-4">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">
                              Pay to
                            </p>
                            <p className="mt-1 font-medium">{MOMO_INFO.name}</p>
                          </div>
                          <div className="rounded-lg border border-border bg-background p-4">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">
                              Amount
                            </p>
                            <p className="mt-1 font-serif text-2xl font-semibold text-primary">
                              {BRAND.bundlePrice}
                            </p>
                          </div>
                          <div className="rounded-lg border border-border bg-background p-4">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">
                              Your reference
                            </p>
                            <p className="mt-1 font-mono text-sm">{ref}</p>
                          </div>
                        </div>
                        <p className="mt-4 text-xs text-muted-foreground">{MOMO_INFO.note}</p>
                        <button
                          onClick={() => {
                            setMomoStep("proof");
                            setProofRef(ref);
                          }}
                          className="mt-6 w-full rounded-md bg-ink px-5 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90"
                        >
                          I have sent the money →
                        </button>
                      </>
                    )}

                    {momoStep === "proof" && (
                      <>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Paste your transaction proof/receipt text below and provide your contact details.
                          We will verify and send your API credentials instantly.
                        </p>

                        <label className="mt-5 block text-sm font-medium">
                          Transaction proof / receipt text
                        </label>
                        <textarea
                          value={proofText}
                          onChange={(e) => setProofText(e.target.value)}
                          placeholder="Paste your mobile money transaction confirmation message, receipt number or reference..."
                          rows={4}
                          className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        />

                        <label className="mt-4 block text-sm font-medium">
                          Your reference
                        </label>
                        <input
                          value={proofRef}
                          onChange={(e) => setProofRef(e.target.value)}
                          placeholder="NLSC-XXXXXX"
                          className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        />

                        <label className="mt-4 block text-sm font-medium">
                          Organisation name
                        </label>
                        <input
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          placeholder="Your company or organisation name"
                          className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        />

                        <label className="mt-4 block text-sm font-medium">
                          Contact email
                        </label>
                        <input
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          type="email"
                          placeholder="you@company.com"
                          className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        />

                        <label className="mt-4 block text-sm font-medium">
                          Contact phone
                        </label>
                        <input
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="07XX XXX XXX"
                          className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        />

                        <button
                          onClick={handleSubmitProof}
                          disabled={proofLoading || !proofText || !orgName || !contactEmail || !contactPhone}
                          className="mt-6 w-full rounded-md bg-ink px-5 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                          {proofLoading ? "Verifying…" : "Submit & receive API credentials"}
                        </button>

                        {proofError && (
                          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                            {proofError}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
                    <h3 className="font-serif text-xl font-semibold">What you receive</h3>
                    <ul className="mt-5 space-y-4">
                      <li className="flex gap-3 text-sm">
                        <span className="mt-0.5 text-primary">✓</span>
                        <span>
                          <strong>Email SMTP credentials</strong>
                          <p className="text-muted-foreground">
                            Server, port, username and password for transactional and bulk email.
                          </p>
                        </span>
                      </li>
                      <li className="flex gap-3 text-sm">
                        <span className="mt-0.5 text-primary">✓</span>
                        <span>
                          <strong>Email Automation API key</strong>
                          <p className="text-muted-foreground">
                            Bearer token for REST API access to send, webhooks and automation flows.
                          </p>
                        </span>
                      </li>
                      <li className="flex gap-3 text-sm">
                        <span className="mt-0.5 text-primary">✓</span>
                        <span>
                          <strong>NLSCEVO WhatsApp API token</strong>
                          <p className="text-muted-foreground">
                            Full WhatsApp sending, receiving and instance management.
                          </p>
                        </span>
                      </li>
                      <li className="flex gap-3 text-sm">
                        <span className="mt-0.5 text-primary">✓</span>
                        <span>
                          <strong>Lifetime license</strong>
                          <p className="text-muted-foreground">
                            Pay once, own it forever. No renewals, no expiry.
                          </p>
                        </span>
                      </li>
                      <li className="flex gap-3 text-sm">
                        <span className="mt-0.5 text-primary">✓</span>
                        <span>
                          <strong>Full-time support</strong>
                          <p className="text-muted-foreground">
                            Includes lifetime support from the NLSC team.
                          </p>
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Confirmation — API credentials delivered */}
      {method === "momo" && momoStep === "confirm" && credentials && (
        <section className="border-b border-border bg-primary/5">
          <div className="mx-auto max-w-4xl px-4 py-14">
            <div className="rounded-2xl border border-primary/30 bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg text-primary-foreground">
                  ✓
                </span>
                <div>
                  <Eyebrow>Activation confirmed</Eyebrow>
                  <h2 className="font-serif text-2xl font-semibold">
                    Welcome, {credentials.orgName}
                  </h2>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Your bundle is active. Use the credentials below to connect your Email Automation
                API and NLSCEVO WhatsApp API. Keep them safe — they are shown once.
              </p>

              <div className="mt-6 rounded-lg border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Reference
                </p>
                <p className="mt-1 font-mono text-sm">{credentials.reference}</p>
              </div>

              <div className="mt-6">
                <h3 className="font-serif text-base font-semibold">Bearer token</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use this token to authenticate all API requests.
                </p>
                <div className="mt-2">
                  <CodeBlock>{credentials.token}</CodeBlock>
                </div>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-5">
                  <h3 className="font-serif text-base font-semibold">Email Automation API</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">SMTP server</p>
                      <p className="font-mono">{credentials.email.smtpServer}:{credentials.email.smtpPort}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">SMTP username</p>
                      <p className="font-mono">{credentials.email.smtpUsername}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">SMTP password</p>
                      <p className="font-mono">{credentials.email.smtpPassword}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">API base URL</p>
                      <p className="font-mono">{credentials.email.apiBase}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">API key</p>
                      <p className="font-mono">{credentials.email.apiKey}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-5">
                  <h3 className="font-serif text-base font-semibold">NLSCEVO WhatsApp API</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">API base URL</p>
                      <p className="font-mono">{credentials.whatsapp.apiBase}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bearer token</p>
                      <p className="font-mono">{credentials.whatsapp.bearerToken}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Default instance</p>
                      <p className="font-mono">{credentials.whatsapp.defaultInstance}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-background p-5">
                <h3 className="font-serif text-base font-semibold">Quick start — endpoints</h3>
                <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Email
                    </p>
                    <ul className="mt-2 space-y-1">
                      {Object.entries(API_DELIVERY.emailApi.endpoints).map(([key, val]) => (
                        <li key={key}>
                          <code className="text-xs">{val}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      WhatsApp
                    </p>
                    <ul className="mt-2 space-y-1">
                      {Object.entries(API_DELIVERY.whatsappApi.endpoints).map(([key, val]) => (
                        <li key={key}>
                          <code className="text-xs">{val}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Need help?</strong> Contact support at{" "}
                  <a href={`mailto:${API_DELIVERY.support.email}`} className="text-primary hover:underline">
                    {API_DELIVERY.support.email}
                  </a>{" "}
                  or call{" "}
                  <a href={`tel:${API_DELIVERY.support.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                    {API_DELIVERY.support.phone}
                  </a>
                  . Full API docs:{" "}
                  <a href={API_DELIVERY.support.docs} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {API_DELIVERY.support.docs}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

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
