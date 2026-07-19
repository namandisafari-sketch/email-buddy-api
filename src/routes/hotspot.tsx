import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { HOTSPOT_LICENSE } from "@/lib/site-data";
import {
  purchaseHotspotLicense,
  createVouchers,
  getVoucherStats,
  listVouchers,
  getHotspotLicense,
  type HotspotLicenseResult,
  type VoucherResult,
} from "@/lib/api/hotspot";

export const Route = createFileRoute("/hotspot")({
  head: () => ({
    meta: [
      { title: "Hotspot License — NLSC" },
      { name: "description", content: "Purchase the NLSC Hotspot License and validate WiFi vouchers through the cloud. Works with MikroTik, Ruijie, and any RADIUS-compatible router." },
      { property: "og:title", content: "Hotspot License — NLSC" },
    ],
  }),
  component: HotspotPage,
});

type Stats = { total: number; active: number; used: number; expired: number };

function HotspotPage() {
  const router = useRouter();
  const sessionToken = localStorage.getItem("nlsc_session");
  const [localToken, setLocalToken] = useState(() => localStorage.getItem("nlsc_hotspot_token") ?? "");

  const [license, setLicense] = useState<HotspotLicenseResult | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [vouchers, setVouchers] = useState<VoucherResult[]>([]);
  const [loading, setLoading] = useState(false);

  const [showPurchase, setShowPurchase] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState<HotspotLicenseResult | null>(null);
  const [purchaseError, setPurchaseError] = useState("");

  const [pkgName, setPkgName] = useState("Daily Pass");
  const [pkgPrice, setPkgPrice] = useState("1000");
  const [pkgHours, setPkgHours] = useState("24");
  const [pkgQty, setPkgQty] = useState("10");
  const [pkgPrefix, setPkgPrefix] = useState("NLSC");
  const [creating, setCreating] = useState(false);
  const [createdVouchers, setCreatedVouchers] = useState<VoucherResult[]>([]);
  const [createError, setCreateError] = useState("");

  const token = license?.token ?? localToken;

  async function loadDashboard(t: string) {
    if (!t) return;
    setLoading(true);
    try {
      const [lic, st, v] = await Promise.all([
        getHotspotLicense({ data: { token: t } }),
        getVoucherStats({ data: { token: t } }),
        listVouchers({ data: { token: t, limit: 50 } }),
      ]);
      if (lic) setLicense(lic as unknown as HotspotLicenseResult);
      setStats(st);
      setVouchers(v);
    } catch {
      // not a valid token
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadDashboard(token);
  }, []);

  useEffect(() => {
    if (purchased && purchased.token) {
      setLicense(purchased);
      localStorage.setItem("nlsc_hotspot_token", purchased.token);
      loadDashboard(purchased.token);
    }
  }, [purchased]);

  const handleTokenSubmit = useCallback(() => {
    if (localToken) {
      localStorage.setItem("nlsc_hotspot_token", localToken);
      loadDashboard(localToken);
    }
  }, [localToken]);

  async function handlePurchase() {
    if (!sessionToken) { router.navigate({ to: "/login" }); return; }
    setPurchasing(true);
    setPurchaseError("");
    try {
      const result = await purchaseHotspotLicense({
        data: { contactEmail, contactPhone, orgName, sessionToken },
      });
      if (result.success) setPurchased(result.license);
    } catch (err) {
      setPurchaseError(String(err instanceof Error ? err.message : err));
    } finally {
      setPurchasing(false);
    }
  }

  async function handleCreateVouchers() {
    if (!token) return;
    setCreating(true);
    setCreateError("");
    setCreatedVouchers([]);
    try {
      const result = await createVouchers({
        data: {
          token,
          packageName: pkgName,
          price: Number(pkgPrice) || 0,
          durationHours: Number(pkgHours) || 24,
          quantity: Math.min(500, Math.max(1, Number(pkgQty) || 1)),
          prefix: pkgPrefix.toUpperCase(),
        },
      });
      if (result.success) {
        setCreatedVouchers(result.vouchers);
        const [st, v] = await Promise.all([
          getVoucherStats({ data: { token } }),
          listVouchers({ data: { token, limit: 50 } }),
        ]);
        setStats(st);
        setVouchers(v);
      }
    } catch (err) {
      setCreateError(String(err instanceof Error ? err.message : err));
    } finally {
      setCreating(false);
    }
  }

  function copyCodes() {
    const codes = createdVouchers.map((v) => v.code).join("\n");
    navigator.clipboard.writeText(codes);
  }

  const showDashboard = license || (token && !loading);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-sm text-white">&#9881;</span>
            <Eyebrow>Hotspot Billing</Eyebrow>
          </div>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">{HOTSPOT_LICENSE.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{HOTSPOT_LICENSE.description}</p>
        </div>
      </section>

      {!showDashboard ? (
        <>
          <section className="border-b border-border bg-secondary/30">
            <div className="mx-auto max-w-5xl px-4 py-10">
              <Eyebrow>What's included</Eyebrow>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {HOTSPOT_LICENSE.features.map((f) => (
                  <div key={f} className="flex gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                    <span className="text-primary">◆</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-b border-border bg-background">
            <div className="mx-auto max-w-3xl px-4 py-10">
              <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
                <h2 className="font-serif text-2xl font-semibold">Enter your license token</h2>
                <p className="mt-1 text-sm text-muted-foreground">Already have a license? Paste your token to access the dashboard.</p>
                <div className="mt-4 flex gap-3">
                  <input value={localToken} onChange={(e) => setLocalToken(e.target.value)}
                    placeholder="hotspot_..."
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:border-primary" />
                  <button onClick={handleTokenSubmit}
                    className="rounded-md bg-ink px-5 py-2 text-sm font-medium text-ink-foreground hover:opacity-90">
                    Access
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-border bg-secondary/30">
            <div className="mx-auto max-w-3xl px-4 py-10">
              {!purchased ? (
                <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
                  <h2 className="font-serif text-2xl font-semibold">Purchase your license</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{HOTSPOT_LICENSE.currency} {HOTSPOT_LICENSE.price.toLocaleString()} &middot; Lifetime</p>
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
                      {purchasing ? "Processing..." : `Pay ${HOTSPOT_LICENSE.currency} ${HOTSPOT_LICENSE.price.toLocaleString()}`}
                    </button>
                    {purchaseError && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{purchaseError}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-primary/30 bg-card p-8 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg text-primary-foreground">&#10003;</span>
                    <div>
                      <Eyebrow>License activated</Eyebrow>
                      <h2 className="font-serif text-2xl font-semibold">Welcome, {orgName}</h2>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Reference: {purchased.reference} &middot; Token saved. The dashboard below is now unlocked.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <>
          {license && (
            <section className="border-b border-border bg-secondary/30">
              <div className="mx-auto max-w-5xl px-4 py-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{license.reference} &middot; {license.org_name}</p>
                    <p className="text-sm font-medium">{license.contact_email}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{license.status}</span>
                </div>
              </div>
            </section>
          )}

          {stats && (
            <section className="border-b border-border bg-background">
              <div className="mx-auto max-w-5xl px-4 py-8">
                <Eyebox>Overview</Eyebox>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  <StatCard label="Total" value={stats.total} />
                  <StatCard label="Active" value={stats.active} color="text-green-600" />
                  <StatCard label="Used" value={stats.used} color="text-blue-600" />
                  <StatCard label="Expired" value={stats.expired} color="text-gray-500" />
                </div>
              </div>
            </section>
          )}

          <section className="border-b border-border bg-secondary/30">
            <div className="mx-auto max-w-5xl px-4 py-10">
              <Eyebrow>Create vouchers</Eyebrow>
              <div className="mt-4 rounded-2xl border border-border bg-card p-7 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium">Package name</label>
                    <input value={pkgName} onChange={(e) => setPkgName(e.target.value)}
                      className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price (UGX)</label>
                    <input value={pkgPrice} onChange={(e) => setPkgPrice(e.target.value)} type="number"
                      className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Duration (hours)</label>
                    <input value={pkgHours} onChange={(e) => setPkgHours(e.target.value)} type="number"
                      className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <input value={pkgQty} onChange={(e) => setPkgQty(e.target.value)} type="number" min={1} max={500}
                      className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Code prefix</label>
                    <input value={pkgPrefix} onChange={(e) => setPkgPrefix(e.target.value.toUpperCase())}
                      className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                </div>
                <button onClick={handleCreateVouchers} disabled={creating || !token}
                  className="mt-6 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40">
                  {creating ? "Creating..." : `Create ${pkgQty || "0"} voucher${Number(pkgQty) !== 1 ? "s" : ""}`}
                </button>
                {createError && (
                  <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{createError}</div>
                )}
                {createdVouchers.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{createdVouchers.length} vouchers created</p>
                      <button onClick={copyCodes} className="text-xs text-primary hover:underline">Copy all codes</button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {createdVouchers.map((v) => (
                        <div key={v.id} className="rounded border border-border bg-background px-3 py-2 text-center">
                          <p className="font-mono text-xs font-bold">{v.code}</p>
                          <p className="text-[10px] text-muted-foreground">{v.package_name} &middot; UGX {Number(v.price).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {vouchers.length > 0 && (
            <section className="border-b border-border bg-background">
              <div className="mx-auto max-w-5xl px-4 py-10">
                <Eyebrow>Recent vouchers</Eyebrow>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground">
                        <th className="pb-2 font-medium">Code</th>
                        <th className="pb-2 font-medium">Package</th>
                        <th className="pb-2 font-medium">Price</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vouchers.map((v) => (
                        <tr key={v.id} className="border-b border-border/50">
                          <td className="py-2 font-mono text-xs">{v.code}</td>
                          <td className="py-2">{v.package_name}</td>
                          <td className="py-2">{Number(v.price).toLocaleString()}</td>
                          <td className="py-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              v.status === "active" ? "bg-green-100 text-green-700" :
                              v.status === "used" ? "bg-blue-100 text-blue-700" :
                              v.status === "expired" ? "bg-gray-100 text-gray-500" :
                              "bg-red-100 text-red-700"
                            }`}>{v.status}</span>
                          </td>
                          <td className="py-2 text-xs text-muted-foreground">
                            {new Date(v.expires_at).toLocaleDateString("en-GB")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          <section className="border-b border-border bg-secondary/30">
            <div className="mx-auto max-w-5xl px-4 py-10">
              <Eyebrow>MikroTik setup</Eyebrow>
              <div className="mt-4 rounded-2xl border border-border bg-card p-7 shadow-sm">
                <p className="text-sm text-muted-foreground">
                  Configure your MikroTik router to validate vouchers through NLSC cloud. Open your router's terminal and paste:
                </p>
                <pre className="mt-4 overflow-x-auto rounded-lg bg-ink p-4 text-xs text-ink-foreground">
{`/ip hotspot walled-garden add dst-host=api.nlscug.com
/radius add address=api.nlscug.com secret=${token || "<your-token>"} service=hotspot timeout=3000ms
/ip hotspot profile set [find] use-radius=yes`}
                </pre>
                <p className="mt-4 text-sm text-muted-foreground">
                  Replace <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{token ? "your token" : "&lt;your-token&gt;"}</code> with your license token above.
                  The captive portal will redirect users to the NLSC validation page where they enter their voucher code.
                </p>
                <div className="mt-6 rounded-lg border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">API Endpoint</p>
                  <p className="mt-1 font-mono text-sm">POST https://www.nlscug.com/api/hotspot/validate</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Request: {`{ "code": "NLSC-XXXXXX", "mac": "..." }`} &rarr; Response: {`{ "valid": true, "voucher": { ... } }`}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </SiteLayout>
  );
}

function Eyebox({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{children}</p>;
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-center">
      <p className={`text-2xl font-bold ${color ?? "text-foreground"}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
