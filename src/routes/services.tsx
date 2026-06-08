import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { BRAND, SERVICES, LICENSE_TERMS, PAYMENT_METHODS } from "@/lib/site-data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Lifetime Licenses — SelfUgaApi Email SMTP & Automation" },
      {
        name: "description",
        content:
          "Browse SelfUgaApi lifetime licenses: transactional SMTP relay, bulk campaigns, automation flows, inbound parse and Server Authority tokens.",
      },
      { property: "og:title", content: "Lifetime Licenses — SelfUgaApi" },
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
            Each license is {BRAND.price}, issued once in your verified legal name, and held for the life of
            your stack. Settled in UGX through Pesapal East Africa.
          </p>
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
