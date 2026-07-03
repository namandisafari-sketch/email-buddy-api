import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { NSIS_LICENSE } from "@/lib/site-data";
import { purchaseNsisLicense } from "@/lib/api/nsis";

export const Route = createFileRoute("/nsis")({
  head: () => ({
    meta: [
      { title: "NSIS Installation License — NLSC" },
      { name: "description", content: "Purchase the NSIS Installation License and gain rights to create and distribute professional .exe software installers." },
      { property: "og:title", content: "NSIS Installation License — NLSC" },
    ],
  }),
  component: NsisPage,
});

type LicenseResult = {
  reference: string;
  token: string;
  total: number;
  currency: string;
  status: string;
};

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="group relative">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-0.5 flex items-center gap-2">
        <code className="flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-xs">{value}</code>
        <button onClick={copy} className="shrink-0 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function NsisPage() {
  const router = useRouter();
  const sessionToken = localStorage.getItem("nlsc_session");

  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState<LicenseResult | null>(null);
  const [error, setError] = useState("");

  async function handlePurchase() {
    if (!sessionToken) {
      router.navigate({ to: "/login" });
      return;
    }
    setPurchasing(true);
    setError("");
    try {
      const result = await purchaseNsisLicense({
        data: { contactEmail, contactPhone, orgName, sessionToken },
      });
      if (result.success) setPurchased(result.license);
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <Eyebrow>Installer License</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">{NSIS_LICENSE.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{NSIS_LICENSE.description}</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-primary">{NSIS_LICENSE.currency} {NSIS_LICENSE.price.toLocaleString()}</p>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <Eyebrow>What's included</Eyebrow>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {NSIS_LICENSE.features.map((f) => (
              <div key={f} className="flex gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                <span className="text-primary">◆</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!purchased ? (
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-3xl px-4 py-10">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <h2 className="font-serif text-2xl font-semibold">Purchase your license</h2>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium">Organisation name</label>
                  <input value={orgName} onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Your company or organisation name"
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Contact email</label>
                    <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                      type="email" placeholder="you@company.com"
                      className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact phone</label>
                    <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="07XX XXX XXX"
                      className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                </div>
                <button onClick={handlePurchase}
                  disabled={purchasing || !orgName || !contactEmail || !contactPhone}
                  className="mt-4 w-full rounded-md bg-ink px-5 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40">
                  {purchasing ? "Processing…" : `Pay ${NSIS_LICENSE.currency} ${NSIS_LICENSE.price.toLocaleString()}`}
                </button>
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="border-b border-border bg-primary/5">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="rounded-2xl border border-primary/30 bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg text-primary-foreground">✓</span>
                <div>
                  <Eyebrow>License activated</Eyebrow>
                  <h2 className="font-serif text-2xl font-semibold">Welcome, {orgName}</h2>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Your NSIS Installation License is active. Invoice and credentials have been sent to {contactEmail}.
              </p>
              <div className="mt-6 rounded-lg border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Reference</p>
                <p className="mt-1 font-mono text-sm">{purchased.reference}</p>
              </div>
              <div className="mt-4 rounded-lg border border-border bg-background p-4">
                <CopyField label="License Token" value={purchased.token} />
              </div>
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
