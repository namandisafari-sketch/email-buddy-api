import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { TIMELINE } from "@/lib/site-data";

export const Route = createFileRoute("/who-we-are")({
  head: () => ({
    meta: [
      { title: "Who We Are — NLSC" },
      {
        name: "description",
        content:
          "NLSC is a sovereign Ugandan mail-delivery registry operating continuously since 2009, settled through Pesapal and edge-served by Vercel.",
      },
      { property: "og:title", content: "Who We Are — NLSC" },
    ],
  }),
  component: WhoWeArePage,
});

function WhoWeArePage() {
  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>NLSC · Operating since 2009</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            A sovereign Ugandan email authority.
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
            From a Kampala desk to East Africa's edge, NLSC has issued lifetime, court-enforceable
            email infrastructure licenses for 17 years. Every API is signed in Uganda, settled in UGX, and
            delivered globally.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-serif text-2xl font-semibold">Proudly powered by</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col rounded-xl border border-border bg-card p-7">
            <span className="font-serif text-2xl font-semibold">Pesapal East Africa</span>
            <p className="mt-2 text-sm text-muted-foreground">Settlement partner since 2011 — instant UGX settlement via Mobile Money, Visa and Mastercard.</p>
          </div>
          <div className="flex flex-col rounded-xl border border-border bg-card p-7">
            <span className="font-serif text-2xl font-semibold">Vercel</span>
            <p className="mt-2 text-sm text-muted-foreground">Edge infrastructure since 2020 — sub-50ms p95 latency from Kampala to Frankfurt.</p>
          </div>
        </div>

        <h2 className="mt-16 font-serif text-2xl font-semibold">From the desk · 17 years of NLSC</h2>
        <div className="mt-6 space-y-6 border-l-2 border-primary/40 pl-6">
          {TIMELINE.map((t) => (
            <div key={t.title}>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{t.date}</p>
              <h3 className="mt-1 font-serif text-lg font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
