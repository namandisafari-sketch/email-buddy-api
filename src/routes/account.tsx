import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { getSessionCustomer, getCustomerOrders } from "@/lib/api/account";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — NLSC" },
      { name: "description", content: "Manage your NLSC domains, licenses and account settings." },
      { property: "og:title", content: "My Account — NLSC" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<{ id: string; email: string; orgName: string | null; phone: string | null; createdAt?: string } | null>(null);
  const [domains, setDomains] = useState<any[]>([]);
  const [activations, setActivations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        const orders = await getCustomerOrders({ data: { token } });
        setDomains(orders.domains);
        setActivations(orders.activations);
      } catch {
        localStorage.removeItem("nlsc_session");
        router.navigate({ to: "/login" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleSignOut() {
    localStorage.removeItem("nlsc_session");
    router.navigate({ to: "/" });
  }

  if (loading) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-4xl px-4 py-16">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="flex items-start justify-between">
            <div>
              <Eyebrow>Customer dashboard</Eyebrow>
              <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">My account</h1>
              <p className="mt-2 text-sm text-muted-foreground">{customer?.email}</p>
              {customer?.orgName && <p className="text-sm text-muted-foreground">{customer.orgName}</p>}
            </div>
            <button onClick={handleSignOut}
              className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              Sign out
            </button>
          </div>
        </div>
      </section>

      {/* Domain orders */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <Eyebrow>Domains</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl font-semibold">Your domain orders</h2>
          {domains.length === 0 ? (
            <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No domains yet.</p>
              <Link to="/domains" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
                Buy a domain →
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {domains.map((d) => (
                <div key={d.reference} className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
                  <div>
                    <p className="font-serif font-semibold">{d.domain}{d.tld}</p>
                    <p className="text-xs text-muted-foreground">Ref: {d.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{d.currency} {Number(d.total).toLocaleString()}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                      d.status === "active" ? "bg-primary/10 text-primary" :
                      d.status === "pending" ? "bg-accent/50 text-accent-foreground" :
                      "bg-destructive/10 text-destructive"
                    }`}>{d.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* API Licenses */}
      <section className="bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <Eyebrow>Licenses</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl font-semibold">Your API licenses</h2>
          {activations.length === 0 ? (
            <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No API licenses yet.</p>
              <Link to="/services" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
                Browse licenses →
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {activations.map((a) => (
                <div key={a.reference} className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
                  <div>
                    <p className="font-medium">{a.org_name}</p>
                    <p className="text-xs text-muted-foreground">Ref: {a.reference} · {a.contact_email}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    a.status === "activated" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
