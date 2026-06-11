import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { BRAND, LICENSE_TERMS, PAYMENT_METHODS } from "@/lib/site-data";

export const Route = createFileRoute("/license")({
  head: () => ({
    meta: [
      { title: "Lifetime License Terms — NLSC" },
      {
        name: "description",
        content:
          "The full NLSC Lifetime License: one API with full ownership, no resale, unlimited domain-based professional email, and all discontinuation conditions.",
      },
      { property: "og:title", content: "Lifetime License Terms — NLSC" },
      {
        property: "og:description",
        content:
          "One API. Full ownership, no resale, unlimited domain-based professional email — and the conditions under which the license is discontinued.",
      },
    ],
  }),
  component: LicensePage,
});

const GRANTS = [
  {
    h: "1. One API, every capability",
    p: "There is a single NLSC license — one API that carries all capabilities: transactional SMTP relay, bulk campaign sending, automation flows, inbound parse webhooks, and the Server Authority token. You do not buy separate products; the one license unlocks everything.",
  },
  {
    h: "2. Lifetime validity",
    p: "The license is valid for the lifetime of your stack. You pay once. There is no expiry, no renewal, and no subscription. The license remains valid as long as these terms are honored.",
  },
  {
    h: "3. Full ownership",
    p: "On issuance you hold full ownership of your API credentials and Server Authority token, bound to your registered organisation. Ownership cannot be revoked except where these terms are breached (see discontinuation conditions below).",
  },
  {
    h: "4. No reselling",
    p: "The license is bound to your verified organisation and may not be resold, sublicensed, transferred, leased, or shared with any third party. Forging or misrepresenting a NLSC license is a breach of contract and a violation of the Computer Misuse Act of Uganda.",
  },
  {
    h: "5. Unlimited domain-based professional email",
    p: "You may produce an unlimited number of professional email addresses across your owned and verified domains. There is no per-mailbox fee and no cap on addresses, provided each sending domain maintains valid SPF, DKIM and DMARC records.",
  },
];

const DISCONTINUATION = [
  "You must be a registered organisation. Individuals and unregistered entities are not eligible.",
  "If we find that you provided false information at any point, the service is discontinued immediately and no refund is issued.",
  "Reselling, sublicensing, transferring, or sharing the license discontinues the service with no refund.",
  "Sending unsolicited bulk mail, phishing, malware, or spoofed identities discontinues the service with no refund.",
  "Persistent deliverability abuse — invalid SPF/DKIM/DMARC, ignored unsubscribe requests, or complaint rates above 0.1% — may lead to throttling and, if uncorrected, discontinuation.",
  "Discontinued or suspended licenses are not eligible for refund.",
];

function LicensePage() {
  return (
    <SiteLayout>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>Lifetime license terms</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            One API. Full ownership. For the life of your stack.
          </h1>
          <p className="mt-5 max-w-3xl text-ink-foreground/80">
            NLSC sells a single lifetime license — {BRAND.price}, issued once to your registered
            organisation. The one API carries every capability. This page sets out exactly what you own and
            the conditions under which the license is discontinued.
          </p>
        </div>
      </section>

      {/* Quick summary */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <ul className="grid gap-4 md:grid-cols-2">
            {LICENSE_TERMS.map((t) => (
              <li key={t} className="flex gap-3 rounded-lg border border-border bg-card p-5 text-sm">
                <span className="text-primary">◆</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What the license grants */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <Eyebrow>What the license grants</Eyebrow>
        <div className="mt-8 space-y-10">
          {GRANTS.map((s) => (
            <div key={s.h}>
              <h2 className="font-serif text-2xl font-semibold">{s.h}</h2>
              <p className="mt-2 text-muted-foreground">{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment */}
      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>Payment & receipt</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
            Pay through any bank — to {BRAND.legalName}.
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {PAYMENT_METHODS.map((p) => (
              <div key={p.title} className="rounded-xl border border-border bg-card p-7 shadow-sm">
                <h3 className="font-serif text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discontinuation conditions */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <Eyebrow>Discontinuation conditions</Eyebrow>
        <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
          When the license ends — and no refund is issued.
        </h2>
        <ul className="mt-8 space-y-4">
          {DISCONTINUATION.map((d) => (
            <li
              key={d}
              className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-sm text-muted-foreground"
            >
              <span className="text-destructive">▲</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted-foreground">
          These terms are governed by and adjudicated under the laws of the Republic of Uganda. Questions?
          Email{" "}
          <a href={`mailto:${BRAND.email}`} className="text-primary hover:underline">
            {BRAND.email}
          </a>
          .
        </p>
        <Link
          to="/process"
          className="mt-8 inline-block rounded-md bg-ink px-5 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90"
        >
          Start the license process →
        </Link>
      </section>
    </SiteLayout>
  );
}
