import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { BRAND, SERVICES, LICENSE_TERMS, PAYMENT_METHODS } from "@/lib/site-data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Lifetime Licenses — NLSC Email SMTP & Automation" },
      {
        name: "description",
        content:
          "Browse NLSC lifetime licenses: transactional SMTP relay, bulk campaigns, automation flows, inbound parse and Server Authority tokens.",
      },
      { property: "og:title", content: "Lifetime Licenses — NLSC" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>Lifetime catalog</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Email SMTP & Automation services</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Each license is {BRAND.price} for a lifetime valid license, issued once to your registered
            organisation and held for the life of your stack. Settled in UGX to {BRAND.legalName}.
          </p>
        </div>
      </section>

      {/* What the license includes */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>What every license includes</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
            One lifetime license. Full ownership.
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {LICENSE_TERMS.map((t) => (
              <li key={t} className="flex gap-3 rounded-lg border border-border bg-card p-5 text-sm">
                <span className="text-primary">◆</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Payment methods */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>How to pay</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
            Pay through any bank — to {BRAND.legalName}.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Payment is accepted through all banks. Receipts are issued instantly on confirmation.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {PAYMENT_METHODS.map((p) => (
              <div key={p.title} className="rounded-xl border border-border bg-card p-7 shadow-sm">
                <h3 className="font-serif text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-muted-foreground">
            <strong className="text-foreground">Registered organisations only.</strong> You must be a
            registered organisation to hold a license. If we find that you provided false information, the
            service is discontinued and no refund is issued.
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <article
              key={s.slug}
              className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="mb-3 inline-flex w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                {s.badge}
              </span>
              <h2 className="font-serif text-xl font-semibold">{s.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.blurb}</p>
              <p className="mt-4 font-serif text-2xl font-semibold">{BRAND.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {s.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-primary">◆</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/process"
                className="mt-6 rounded-md bg-ink px-4 py-2.5 text-center text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90"
              >
                Buy this license →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
