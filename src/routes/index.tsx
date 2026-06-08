import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { BRAND, SERVICES, TIMELINE } from "@/lib/site-data";
import heroImg from "@/assets/hero-kampala.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SelfUgaApi — Lifetime Email SMTP & Automation API" },
      {
        name: "description",
        content:
          "SelfUgaApi issues lifetime licenses for sovereign Email SMTP and automation APIs. No expiry. No subscription. Settled via Pesapal East Africa.",
      },
      { property: "og:title", content: "SelfUgaApi — Email SMTP & Automation API" },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <img
          src={heroImg}
          alt="Aerial view of a Kampala neighbourhood — rooftops, mango trees and a red-earth road leading toward the city skyline."
          width={1600}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32">
          <div className="max-w-3xl">
            <Eyebrow>Originated in Uganda</Eyebrow>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-6xl">
              Sovereign email delivery, signed in{" "}
              <span className="text-primary">Kampala</span>, settled across East Africa.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-ink-foreground/80">
              SelfUgaApi issues lifetime licenses for the full {BRAND.product} API and Server Authority
              tokens. No expiry. No subscription. Backed by court-enforceable terms and verified through
              Pesapal East Africa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/services"
                className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Explore lifetime licenses
              </Link>
              <Link
                to="/process"
                className="rounded-md border border-ink-foreground/25 px-5 py-3 text-sm font-medium text-ink-foreground transition-colors hover:bg-ink-foreground/10"
              >
                How review works
              </Link>
            </div>

            <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                ["Lifetime", "No expiry, ever"],
                ["2 days", "School review SLA"],
                ["Pesapal", "East Africa rails"],
                ["Vercel", "Edge-served"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-serif text-2xl font-semibold text-primary">{k}</dt>
                  <dd className="text-sm text-ink-foreground/70">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-xs text-muted-foreground">
          <span>Settlement partner · Pesapal East Africa</span>
          <span>Powered by Vercel</span>
          <span>URA-registered · NITA-U compliant</span>
          <span>Disputes adjudicated under the laws of the Republic of Uganda</span>
        </div>
      </div>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Lifetime catalog</Eyebrow>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold sm:text-4xl">
              Pay once. Hold the license for the life of your stack.
            </h2>
          </div>
          <Link to="/services" className="text-sm font-medium text-primary hover:underline">
            View all services →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.slice(0, 3).map((s) => (
            <article
              key={s.slug}
              className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="mb-3 inline-flex w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                {s.badge}
              </span>
              <h3 className="font-serif text-xl font-semibold">{s.title}</h3>
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
                to="/services"
                className="mt-6 text-sm font-medium text-primary hover:underline"
              >
                Buy this license →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Zero scam */}
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <Eyebrow>Zero scam tolerance</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-serif text-3xl font-semibold sm:text-4xl">
            Violators are addressed in the courts of law.
          </h2>
          <p className="mt-5 max-w-3xl text-ink-foreground/80">
            Every license is issued in your verified legal name. Reselling, forging, or misrepresenting a
            SelfUgaApi license is a breach of contract and a violation of the Computer Misuse Act of Uganda.
          </p>
          <p className="mt-4 max-w-3xl text-ink-foreground/80">
            Confirmed violators are reported to NITA-U and pursued through the courts of the Republic of
            Uganda. We do not negotiate with bad faith actors.
          </p>
          <Link to="/policy" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
            Read the full policy & community guidelines →
          </Link>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <Eyebrow>From the desk · 17 years of SelfUgaApi</Eyebrow>
        <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
          {TIMELINE.map((t) => (
            <div key={t.title} className="bg-card p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t.date}
              </p>
              <h3 className="mt-2 font-serif text-lg font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          {BRAND.price} per API · Server Authority Token issued in 2 working days
        </p>
      </section>
    </SiteLayout>
  );
}
