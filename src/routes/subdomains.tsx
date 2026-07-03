import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { SUBDOMAIN_LICENSE } from "@/lib/site-data";
import {
  purchaseSubdomainLicense,
  getSubdomainLicenses,
  getSubdomainConfigs,
  addSubdomainConfig,
  removeSubdomainConfig,
} from "@/lib/api/subdomain";

export const Route = createFileRoute("/subdomains")({
  head: () => ({
    meta: [
      { title: "Subdomain Security — NLSC" },
      {
        name: "description",
        content:
          "Purchase and manage your Subdomain Security License. Protect unlimited subdomains with quantum-grade security.",
      },
      { property: "og:title", content: "Subdomain Security — NLSC" },
    ],
  }),
  component: SubdomainsPage,
});

type License = {
  id: string;
  reference: string;
  org_name: string;
  contact_email: string;
  domain: string;
  token: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
};

type Config = {
  id: string;
  subdomain: string;
  record_type: string;
  record_value: string;
  ssl_status: string;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SslBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-primary/10 text-primary",
    pending: "bg-accent/50 text-accent-foreground",
    failed: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] ?? "bg-muted text-muted-foreground"}`}>
      {status === "active" ? "SSL Active" : status === "pending" ? "Provisioning" : "Failed"}
    </span>
  );
}

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

function SubdomainsPage() {
  const router = useRouter();
  const sessionToken = localStorage.getItem("nlsc_session");

  const [licenses, setLicenses] = useState<License[]>([]);
  const [configs, setConfigs] = useState<Record<string, Config[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedLicense, setExpandedLicense] = useState<string | null>(null);

  const [showPurchase, setShowPurchase] = useState(false);
  const [domain, setDomain] = useState("");
  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState<License | null>(null);
  const [purchaseError, setPurchaseError] = useState("");

  const [newSubdomain, setNewSubdomain] = useState("");
  const [newRecordType, setNewRecordType] = useState("A");
  const [newRecordValue, setNewRecordValue] = useState("");
  const [addingConfig, setAddingConfig] = useState(false);
  const [addConfigLicense, setAddConfigLicense] = useState("");

  useEffect(() => {
    if (!sessionToken) {
      router.navigate({ to: "/login" });
      return;
    }
    (async () => {
      try {
        const { licenses: lics } = await getSubdomainLicenses({ data: { token: sessionToken } });
        setLicenses(lics);
      } catch {
        localStorage.removeItem("nlsc_session");
        router.navigate({ to: "/login" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loadConfigs(licenses: License[]) {
    if (!sessionToken) return;
    const configMap: Record<string, Config[]> = {};
    for (const lic of licenses) {
      try {
        const { configs: cs } = await getSubdomainConfigs({
          data: { licenseReference: lic.reference, sessionToken },
        });
        configMap[lic.reference] = cs;
      } catch {
        configMap[lic.reference] = [];
      }
    }
    setConfigs(configMap);
  }

  useEffect(() => {
    if (licenses.length > 0) {
      loadConfigs(licenses);
    }
  }, [licenses]);

  async function handlePurchase() {
    if (!sessionToken) return;
    setPurchasing(true);
    setPurchaseError("");
    try {
      const result = await purchaseSubdomainLicense({
        data: {
          domain,
          contactEmail,
          contactPhone,
          orgName,
          sessionToken,
        },
      });
      if (result.success) {
        setPurchased(result.license);
        setLicenses((prev) => [result.license as License, ...prev]);
      }
    } catch (err) {
      setPurchaseError(String(err instanceof Error ? err.message : err));
    } finally {
      setPurchasing(false);
    }
  }

  async function handleAddConfig(licenseReference: string) {
    if (!sessionToken || !newSubdomain || !newRecordValue) return;
    setAddingConfig(true);
    try {
      await addSubdomainConfig({
        data: {
          licenseReference,
          subdomain: newSubdomain,
          recordType: newRecordType,
          recordValue: newRecordValue,
          sessionToken,
        },
      });
      setNewSubdomain("");
      setNewRecordType("A");
      setNewRecordValue("");
      setAddConfigLicense("");
      if (sessionToken) {
        const { configs: cs } = await getSubdomainConfigs({
          data: { licenseReference, sessionToken },
        });
        setConfigs((prev) => ({ ...prev, [licenseReference]: cs }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingConfig(false);
    }
  }

  async function handleRemoveConfig(configId: string, licenseReference: string) {
    if (!sessionToken) return;
    try {
      await removeSubdomainConfig({ data: { configId, sessionToken } });
      if (sessionToken) {
        const { configs: cs } = await getSubdomainConfigs({
          data: { licenseReference, sessionToken },
        });
        setConfigs((prev) => ({ ...prev, [licenseReference]: cs }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-5xl px-4 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-56 rounded bg-muted" />
            <div className="h-4 w-80 rounded bg-muted" />
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="flex items-start justify-between">
            <div>
              <Eyebrow>Subdomain Security</Eyebrow>
              <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Subdomain Security License</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">{SUBDOMAIN_LICENSE.description}</p>
            </div>
            {!purchased && (
              <button
                onClick={() => setShowPurchase(!showPurchase)}
                className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90"
              >
                {showPurchase ? "Cancel" : `Buy license — ${SUBDOMAIN_LICENSE.currency} ${SUBDOMAIN_LICENSE.price.toLocaleString()}`}
              </button>
            )}
          </div>
        </div>
      </section>

      {showPurchase && !purchased && (
        <section className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-3xl px-4 py-10">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <h2 className="font-serif text-2xl font-semibold">Purchase your license</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your domain and contact details to purchase a lifetime Subdomain Security License.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium">Your domain</label>
                  <input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Organisation name</label>
                  <input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Your company or organisation name"
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Contact email</label>
                    <input
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      type="email"
                      placeholder="you@company.com"
                      className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact phone</label>
                    <input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="07XX XXX XXX"
                      className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || !domain || !orgName || !contactEmail || !contactPhone}
                  className="mt-4 w-full rounded-md bg-ink px-5 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {purchasing ? "Processing…" : `Pay ${SUBDOMAIN_LICENSE.currency} ${SUBDOMAIN_LICENSE.price.toLocaleString()}`}
                </button>
                {purchaseError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {purchaseError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {purchased && (
        <section className="border-b border-border bg-primary/5">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="rounded-2xl border border-primary/30 bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg text-primary-foreground">✓</span>
                <div>
                  <Eyebrow>License activated</Eyebrow>
                  <h2 className="font-serif text-2xl font-semibold">Welcome, {purchased.org_name}</h2>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Your Subdomain Security License for <strong>{purchased.domain}</strong> is active. Invoice and credentials have been sent to {purchased.contact_email}.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Reference</p>
                  <p className="mt-1 font-mono text-sm">{purchased.reference}</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Domain</p>
                  <p className="mt-1 font-mono text-sm">{purchased.domain}</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-border bg-background p-4">
                <CopyField label="Bearer Token" value={purchased.token} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* My Licenses */}
      <section className={licenses.length > 0 ? "border-b border-border bg-background" : "bg-background"}>
        <div className="mx-auto max-w-5xl px-4 py-10">
          <Eyebrow>My Licenses</Eyebrow>
          <h2 className="mt-1 font-serif text-2xl font-semibold">Your Subdomain Security Licenses</h2>

          {licenses.length === 0 ? (
            <div className="mt-6 rounded-xl border-2 border-dashed border-border bg-card p-10 text-center">
              <p className="text-3xl">🛡</p>
              <p className="mt-3 text-sm text-muted-foreground">You haven't purchased a Subdomain Security License yet.</p>
              <button
                onClick={() => setShowPurchase(true)}
                className="mt-4 inline-block rounded-md bg-ink px-6 py-2 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90"
              >
                Buy now — {SUBDOMAIN_LICENSE.currency} {SUBDOMAIN_LICENSE.price.toLocaleString()}
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {licenses.map((lic) => (
                <div key={lic.id} className="rounded-xl border border-border bg-card shadow-sm">
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-lg">🛡</span>
                      <div>
                        <p className="font-serif font-semibold">{lic.domain}</p>
                        <p className="text-xs text-muted-foreground">
                          Ref: {lic.reference} · Purchased {formatDate(lic.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{lic.currency} {Number(lic.total).toLocaleString()}</span>
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium capitalize text-primary">
                        {lic.status}
                      </span>
                      <button
                        onClick={() => setExpandedLicense(expandedLicense === lic.reference ? null : lic.reference)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {expandedLicense === lic.reference ? "Hide details" : "Manage subdomains"}
                      </button>
                    </div>
                  </div>

                  {expandedLicense === lic.reference && (
                    <div className="border-t border-border p-5">
                      <div className="mb-5 grid gap-3 sm:grid-cols-2">
                        <CopyField label="Bearer Token" value={lic.token} />
                        <CopyField label="Domain" value={lic.domain} />
                      </div>

                      <h3 className="mb-3 font-serif text-base font-semibold">Subdomain Configurations</h3>

                      {(configs[lic.reference] ?? []).length === 0 ? (
                        <div className="mb-4 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                          No subdomains configured yet. Add one below.
                        </div>
                      ) : (
                        <div className="mb-4 space-y-2">
                          {(configs[lic.reference] ?? []).map((cfg) => (
                            <div key={cfg.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-sm font-medium">{cfg.subdomain}.{lic.domain}</span>
                                <span className="text-xs text-muted-foreground">{cfg.record_type} → {cfg.record_value}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <SslBadge status={cfg.ssl_status} />
                                <button
                                  onClick={() => handleRemoveConfig(cfg.id, lic.reference)}
                                  className="text-xs text-muted-foreground hover:text-destructive"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {addConfigLicense === lic.reference ? (
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                          <div className="grid gap-3 sm:grid-cols-4">
                            <div>
                              <label className="text-xs text-muted-foreground">Subdomain</label>
                              <input
                                value={newSubdomain}
                                onChange={(e) => setNewSubdomain(e.target.value)}
                                placeholder="api"
                                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Record type</label>
                              <select
                                value={newRecordType}
                                onChange={(e) => setNewRecordType(e.target.value)}
                                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                              >
                                <option value="A">A</option>
                                <option value="AAAA">AAAA</option>
                                <option value="CNAME">CNAME</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-xs text-muted-foreground">Value</label>
                              <input
                                value={newRecordValue}
                                onChange={(e) => setNewRecordValue(e.target.value)}
                                placeholder="192.168.1.1 or target.domain.com"
                                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                              />
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleAddConfig(lic.reference)}
                              disabled={addingConfig || !newSubdomain || !newRecordValue}
                              className="rounded-md bg-ink px-4 py-2 text-xs font-medium text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                            >
                              {addingConfig ? "Adding…" : "Add subdomain"}
                            </button>
                            <button
                              onClick={() => { setAddConfigLicense(""); setNewSubdomain(""); setNewRecordType("A"); setNewRecordValue(""); }}
                              className="rounded-md border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddConfigLicense(lic.reference)}
                          className="rounded-md border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          + Add subdomain
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
