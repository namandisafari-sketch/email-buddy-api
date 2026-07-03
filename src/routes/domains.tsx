import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { DOMAIN_TLDS, DOMAIN_FEATURES, DOMAIN_FAQ } from "@/lib/site-data";
import { checkDomainAvailability, registerDomain } from "@/lib/api/domain";

export const Route = createFileRoute("/domains")({
  head: () => ({
    meta: [
      { title: "Buy a Domain — NLSC" },
      {
        name: "description",
        content:
          "Register a domain through NLSC. .com, .org, .ug, .co.ug, .io and more. Free DNS management, WHOIS privacy and DKIM alignment.",
      },
      { property: "og:title", content: "Buy a Domain — NLSC" },
    ],
  }),
  component: DomainsPage,
});

function DomainsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTld, setSelectedTld] = useState<string>(".com");
  const [years, setYears] = useState(1);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; domain: string; tld: string } | null>(null);
  const [checkError, setCheckError] = useState("");

  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderResult, setOrderResult] = useState<{ reference: string; domain: string; tld: string } | null>(null);
  const [orderError, setOrderError] = useState("");

  const selectedTldData = DOMAIN_TLDS.find((t) => t.tld === selectedTld);
  const domainPrice = selectedTldData?.price ?? 0;
  const totalPrice = domainPrice * years;

  async function handleCheck() {
    let name = searchQuery.trim().toLowerCase().replace(/[^a-z0-9-.]/g, "");
    for (const t of DOMAIN_TLDS) {
      if (name.endsWith(t.tld)) {
        name = name.slice(0, -t.tld.length).replace(/\.$/, "");
      }
    }
    const clean = name.replace(/[^a-z0-9-]/g, "");
    if (!clean) return;
    setChecking(true);
    setCheckError("");
    setAvailability(null);
    setOrderResult(null);
    try {
      const result = await checkDomainAvailability({ data: { domain: clean, tld: selectedTld } });
      setAvailability(result);
    } catch (err) {
      console.error("[Domain] check failed:", err);
      setCheckError(String(err instanceof Error ? err.message : err));
    } finally {
      setChecking(false);
    }
  }

  async function handleRegister() {
    if (!availability?.available) return;
    setOrdering(true);
    setOrderError("");
    try {
      const sessionToken = localStorage.getItem("nlsc_session");
      const result = await registerDomain({
        data: {
          domain: availability.domain,
          tld: availability.tld,
          years,
          total: totalPrice,
          currency: "UGX",
          contactEmail,
          contactPhone,
          orgName,
          sessionToken: sessionToken ?? undefined,
        },
      });
      if (result.success) {
        setOrderResult(result.order);
      }
    } catch (err) {
      console.error("[Domain] register failed:", err);
      setOrderError(String(err instanceof Error ? err.message : err));
    } finally {
      setOrdering(false);
    }
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>Domain registration</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Buy a domain</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Register a domain for your organisation. Free DNS management, WHOIS privacy, and automatic DKIM
            alignment when used with NLSC Email API.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">Annual domain pricing</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DOMAIN_TLDS.map((t) => (
              <button
                key={t.tld}
                onClick={() => { setSelectedTld(t.tld); setAvailability(null); }}
                className={`rounded-xl border p-5 text-left transition-all ${
                  selectedTld === t.tld
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <span className="font-serif text-2xl font-semibold">{t.tld}</span>
                <p className="mt-1 font-serif text-xl font-semibold text-primary">
                  UGX {t.price.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">/yr</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{t.note}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Register */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>Find your domain</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">Search and register</h2>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCheck(); }}
              placeholder="Enter your domain name"
              className="flex-1 rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <select
              value={selectedTld}
              onChange={(e) => setSelectedTld(e.target.value)}
              className="w-28 rounded-md border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
            >
              {DOMAIN_TLDS.map((t) => (
                <option key={t.tld} value={t.tld}>{t.tld}</option>
              ))}
            </select>
            <button
              onClick={handleCheck}
              disabled={checking || !searchQuery.trim()}
              className="rounded-md bg-ink px-6 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {checking ? "Checking…" : "Search"}
            </button>
          </div>

          {checkError && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {checkError}
            </div>
          )}

          {availability && !availability.available && (
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <p className="font-serif text-xl font-semibold">
                {availability.domain}{availability.tld}
              </p>
              <p className="mt-1 text-sm text-destructive">This domain is taken. Try a different name or TLD.</p>
            </div>
          )}

          {availability?.available && !orderResult && (
            <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <p className="font-serif text-xl font-semibold">
                  {availability.domain}{availability.tld}
                </p>
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                  Available
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <label className="text-sm font-medium">Registration period:</label>
                <select
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {[1, 2, 3, 5, 10].map((y) => (
                    <option key={y} value={y}>{y} {y === 1 ? "year" : "years"}</option>
                  ))}
                </select>
              </div>

              <p className="mt-3 font-serif text-2xl font-semibold text-primary">
                UGX {totalPrice.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                UGX {domainPrice.toLocaleString()} × {years} {years === 1 ? "year" : "years"}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Organisation name</label>
                  <input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Your company name"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact email</label>
                  <input
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    type="email"
                    placeholder="you@company.com"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact phone</label>
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="07XX XXX XXX"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={ordering || !orgName || !contactEmail || !contactPhone}
                className="mt-6 rounded-md bg-ink px-6 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {ordering ? "Processing…" : `Register ${availability.domain}${availability.tld} — UGX ${totalPrice.toLocaleString()}`}
              </button>

              {orderError && (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  {orderError}
                </div>
              )}
            </div>
          )}

          {orderResult && (
            <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg text-primary-foreground">✓</span>
                <div>
                  <p className="font-serif text-xl font-semibold">Order received</p>
                  <p className="text-sm text-muted-foreground">
                    {orderResult.domain}{orderResult.tld} — Reference {orderResult.reference}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Your domain registration request has been submitted. Our team will process it and send a
                confirmation email with DNS management instructions. For .ug and .co.ug domains, registry
                processing may take up to 24 hours.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>What you get</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">Every domain includes</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {DOMAIN_FEATURES.map((f) => (
              <li key={f} className="flex gap-3 rounded-lg border border-border bg-card p-5 text-sm">
                <span className="text-primary">◆</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">Domain registration questions</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {DOMAIN_FAQ.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border bg-card p-7 shadow-sm">
                <h3 className="font-serif text-lg font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
