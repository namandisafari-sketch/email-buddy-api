import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { getSessionCustomer, getCustomerOrders, updateProfile, changePassword } from "@/lib/api/account";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — NLSC" },
      { name: "description", content: "Manage your NLSC domains, licenses, credentials and account settings." },
      { property: "og:title", content: "My Account — NLSC" },
    ],
  }),
  component: AccountPage,
});

type Customer = { id: string; email: string; orgName: string | null; phone: string | null; createdAt?: string };
type DomainOrder = { reference: string; domain: string; tld: string; years: number; total: number; currency: string; status: string; created_at: string };
type Activation = { reference: string; org_name: string; contact_email: string; status: string; created_at: string; token?: string; smtp_password?: string };
type SubdomainLicense = { reference: string; org_name: string; contact_email: string; domain: string; token: string; status: string; total: number; currency: string; created_at: string };

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-primary/10 text-primary",
    activated: "bg-primary/10 text-primary",
    pending: "bg-accent/50 text-accent-foreground",
    processing: "bg-blue-50 text-blue-700",
    failed: "bg-destructive/10 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
    revoked: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium capitalize ${styles[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
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

function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [domains, setDomains] = useState<DomainOrder[]>([]);
  const [activations, setActivations] = useState<Activation[]>([]);
  const [subdomainLicenses, setSubdomainLicenses] = useState<SubdomainLicense[]>([]);
  const [nsisLicenses, setNsisLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editOrgName, setEditOrgName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState("");

  const [expandedCreds, setExpandedCreds] = useState<string | null>(null);

  const sessionToken = localStorage.getItem("nlsc_session");

  useEffect(() => {
    const token = localStorage.getItem("nlsc_session");
    if (!token) {
      router.navigate({ to: "/login" });
      return;
    }
    (async () => {
      try {
        const { customer: c } = await getSessionCustomer({ data: { token } });
        if (!c) {
          localStorage.removeItem("nlsc_session");
          router.navigate({ to: "/login" });
          return;
        }
        setCustomer(c);
        setEditOrgName(c.orgName ?? "");
        setEditPhone(c.phone ?? "");
        const orders = await getCustomerOrders({ data: { token } });
        setDomains(orders.domains);
        setActivations(orders.activations);
        setSubdomainLicenses(orders.subdomainLicenses ?? []);
        setNsisLicenses(orders.nsisLicenses ?? []);
      } catch {
        localStorage.removeItem("nlsc_session");
        router.navigate({ to: "/login" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSaveProfile() {
    if (!sessionToken) return;
    setProfileSaving(true);
    setProfileMessage("");
    try {
      await updateProfile({ data: { token: sessionToken, orgName: editOrgName, phone: editPhone } });
      setCustomer((prev) => prev ? { ...prev, orgName: editOrgName, phone: editPhone } : prev);
      setProfileMessage("Profile updated");
    } catch (err) {
      setProfileMessage(String(err instanceof Error ? err.message : err));
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!sessionToken) return;
    if (newPw !== confirmPw) { setPwMessage("Passwords do not match"); return; }
    setPwSaving(true);
    setPwMessage("");
    try {
      await changePassword({ data: { token: sessionToken, currentPassword: currentPw, newPassword: newPw } });
      setPwMessage("Password changed");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      setPwMessage(String(err instanceof Error ? err.message : err));
    } finally {
      setPwSaving(false);
    }
  }

  function handleSignOut() {
    localStorage.removeItem("nlsc_session");
    router.navigate({ to: "/" });
  }

  const pendingDomains = domains.filter((d) => d.status === "pending");
  const activeDomains = domains.filter((d) => d.status === "active");
  const activeLicenses = activations.filter((a) => a.status === "activated");

  if (loading) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-5xl px-4 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-4 w-72 rounded bg-muted" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-24 rounded-xl bg-muted" />
              <div className="h-24 rounded-xl bg-muted" />
              <div className="h-24 rounded-xl bg-muted" />
            </div>
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
              <Eyebrow>Customer dashboard</Eyebrow>
              <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">My account</h1>
              {customer?.createdAt && (
                <p className="mt-2 text-xs text-muted-foreground">Member since {formatDate(customer.createdAt)}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/domains" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90">
                Buy a domain
              </Link>
              <button onClick={handleSignOut}
                className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Active domains" value={activeDomains.length} />
            <StatCard label="API licenses" value={activeLicenses.length} />
            <StatCard label="Subdomain licenses" value={subdomainLicenses.filter((l) => l.status === "active").length} />
            <StatCard label="NSIS licenses" value={nsisLicenses.filter((l: any) => l.status === "active").length} />
          </div>
        </div>
      </section>

      {/* Profile configuration */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm">👤</span>
            <div>
              <Eyebrow>Configuration</Eyebrow>
              <h2 className="mt-1 font-serif text-2xl font-semibold">Profile settings</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-medium">Personal details</h3>
              <p className="mt-1 text-xs text-muted-foreground">Your email is fixed. Update your organisation name and phone number below.</p>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="mt-0.5 font-medium">{customer?.email}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Organisation</label>
                  <input value={editOrgName} onChange={(e) => setEditOrgName(e.target.value)}
                    placeholder="Your organisation name"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Phone</label>
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="07XX XXX XXX"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <button onClick={handleSaveProfile} disabled={profileSaving}
                  className="rounded-md bg-ink px-5 py-2 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40">
                  {profileSaving ? "Saving…" : "Save changes"}
                </button>
                {profileMessage && (
                  <p className={`text-xs ${profileMessage === "Profile updated" ? "text-primary" : "text-destructive"}`}>
                    {profileMessage}
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-medium">Change password</h3>
              <p className="mt-1 text-xs text-muted-foreground">Minimum 8 characters.</p>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Current password</label>
                  <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">New password</label>
                  <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Confirm new password</label>
                  <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <button onClick={handleChangePassword} disabled={pwSaving || !currentPw || !newPw || !confirmPw}
                  className="rounded-md bg-ink px-5 py-2 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40">
                  {pwSaving ? "Changing…" : "Update password"}
                </button>
                {pwMessage && (
                  <p className={`text-xs ${pwMessage === "Password changed" ? "text-primary" : "text-destructive"}`}>
                    {pwMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pending orders */}
      {pendingDomains.length > 0 && (
        <section className="border-b border-border bg-accent/10">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/30 text-sm">⏳</span>
              <div>
                <Eyebrow>Pending</Eyebrow>
                <h2 className="mt-1 font-serif text-2xl font-semibold">Orders awaiting processing</h2>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {pendingDomains.map((d) => (
                <div key={d.reference} className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-4">
                    <span className="text-lg">⏳</span>
                    <div>
                      <p className="font-serif font-semibold">{d.domain}{d.tld}</p>
                      <p className="text-xs text-muted-foreground">Ref: {d.reference} · Ordered {formatDate(d.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{d.currency} {Number(d.total).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{d.years} {d.years === 1 ? "year" : "years"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Domain orders */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="flex items-center justify-between">
            <div>
              <Eyebrow>Domains</Eyebrow>
              <h2 className="mt-1 font-serif text-2xl font-semibold">Your domain orders</h2>
            </div>
            <Link to="/domains" className="text-sm font-medium text-primary hover:underline">
              Buy another →
            </Link>
          </div>
          {domains.length === 0 ? (
            <div className="mt-6 rounded-xl border-2 border-dashed border-border bg-card p-10 text-center">
              <p className="text-3xl">🌐</p>
              <p className="mt-3 text-sm text-muted-foreground">You haven't ordered any domains yet.</p>
              <Link to="/domains" className="mt-4 inline-block rounded-md bg-ink px-6 py-2 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90">
                Browse domains
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {domains.map((d) => (
                <div key={d.reference} className="flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-lg">
                      {d.tld.slice(1)}
                    </span>
                    <div>
                      <p className="font-serif font-semibold">{d.domain}{d.tld}</p>
                      <p className="text-xs text-muted-foreground">
                        Ref: {d.reference} · {d.years} {d.years === 1 ? "year" : "years"} · Ordered {formatDate(d.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{d.currency} {Number(d.total).toLocaleString()}</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subdomain Security Licenses */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="flex items-center justify-between">
            <div>
              <Eyebrow>Subdomain Security</Eyebrow>
              <h2 className="mt-1 font-serif text-2xl font-semibold">Your subdomain security licenses</h2>
            </div>
            <Link to="/subdomains" className="text-sm font-medium text-primary hover:underline">
              Manage subdomains →
            </Link>
          </div>
          {subdomainLicenses.length === 0 ? (
            <div className="mt-6 rounded-xl border-2 border-dashed border-border bg-card p-10 text-center">
              <p className="text-3xl">🛡</p>
              <p className="mt-3 text-sm text-muted-foreground">You haven't purchased a Subdomain Security License yet.</p>
              <Link to="/subdomains" className="mt-4 inline-block rounded-md bg-ink px-6 py-2 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90">
                Buy license
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {subdomainLicenses.map((l) => (
                <div key={l.reference} className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-lg">🛡</span>
                    <div>
                      <p className="font-medium">{l.domain}</p>
                      <p className="text-xs text-muted-foreground">Ref: {l.reference} · {formatDate(l.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm">{l.currency} {Number(l.total).toLocaleString()}</p>
                    <StatusBadge status={l.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NSIS Installation Licenses */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="flex items-center justify-between">
            <div>
              <Eyebrow>Installer Licenses</Eyebrow>
              <h2 className="mt-1 font-serif text-2xl font-semibold">Your NSIS installation licenses</h2>
            </div>
            <Link to="/nsis" className="text-sm font-medium text-primary hover:underline">
              Buy another →
            </Link>
          </div>
          {nsisLicenses.length === 0 ? (
            <div className="mt-6 rounded-xl border-2 border-dashed border-border bg-card p-10 text-center">
              <p className="text-3xl">📦</p>
              <p className="mt-3 text-sm text-muted-foreground">You haven't purchased an NSIS Installation License yet.</p>
              <Link to="/nsis" className="mt-4 inline-block rounded-md bg-ink px-6 py-2 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90">
                Buy license
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {nsisLicenses.map((l: any) => (
                <div key={l.reference} className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-lg">📦</span>
                    <div>
                      <p className="font-medium">{l.org_name}</p>
                      <p className="text-xs text-muted-foreground">Ref: {l.reference} · {formatDate(l.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm">{l.currency} {Number(l.total).toLocaleString()}</p>
                    <StatusBadge status={l.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* API Licenses + Credentials */}
      <section className="bg-background">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="flex items-center justify-between">
            <div>
              <Eyebrow>Licenses</Eyebrow>
              <h2 className="mt-1 font-serif text-2xl font-semibold">Your API licenses & credentials</h2>
            </div>
            <Link to="/services" className="text-sm font-medium text-primary hover:underline">
              Browse licenses →
            </Link>
          </div>
          {activations.length === 0 ? (
            <div className="mt-6 rounded-xl border-2 border-dashed border-border bg-card p-10 text-center">
              <p className="text-3xl">🔑</p>
              <p className="mt-3 text-sm text-muted-foreground">You don't have any API licenses yet.</p>
              <Link to="/services" className="mt-4 inline-block rounded-md bg-ink px-6 py-2 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90">
                View licenses
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {activations.map((a) => (
                <div key={a.reference}>
                  <div className="flex items-center justify-between rounded-t-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-lg">🔑</span>
                      <div>
                        <p className="font-medium">{a.org_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Ref: {a.reference} · {a.contact_email} · {formatDate(a.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={a.status} />
                      {a.status === "activated" && a.token && (
                        <button onClick={() => setExpandedCreds(expandedCreds === a.reference ? null : a.reference)}
                          className="text-xs font-medium text-primary hover:underline">
                          {expandedCreds === a.reference ? "Hide credentials" : "View credentials"}
                        </button>
                      )}
                    </div>
                  </div>
                  {expandedCreds === a.reference && a.token && (
                    <div className="rounded-b-xl border-x border-b border-border bg-muted/30 p-5">
                      <p className="mb-3 text-xs font-medium text-muted-foreground">
                        Use these credentials to connect to the NLSC API. Keep them secure — they grant full access to your license.
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <CopyField label="Bearer token" value={a.token} />
                        <CopyField label="SMTP password" value={a.smtp_password ?? "—"} />
                        <CopyField label="SMTP server" value="smtp.resend.com" />
                        <CopyField label="SMTP port" value="587" />
                        <CopyField label="API base URL" value="https://api.nlscug.com/v1" />
                        <CopyField label="WhatsApp API" value="https://evo.nlscug.com" />
                      </div>
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
