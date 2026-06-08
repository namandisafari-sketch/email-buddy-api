import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "How a License Is Issued — SelfUgaApi" },
      {
        name: "description",
        content:
          "A serious process, because the license is forever. Submit information, settle through Pesapal, pass compliance review, and receive your API and token.",
      },
      { property: "og:title", content: "How a License Is Issued — SelfUgaApi" },
    ],
  }),
  component: ProcessPage,
});

const STEPS = [
  {
    n: "01",
    title: "Register & submit serious information",
    body: "You must be a registered organisation. Provide your legal name, registration and intended use. False information ends the service with no refund.",
  },
  {
    n: "02",
    title: "Pay any bank to SelfUga Api Ltd",
    body: "Pay through any bank — just say you are paying SelfUga Api Ltd — or pay from your desk to the engineer and guide integrator, and receive your receipt instantly.",
  },
  {
    n: "03",
    title: "Compliance review",
    body: "Our desk verifies your organisation details before issuing the lifetime license and Server Authority token.",
  },
  {
    n: "04",
    title: "Receive your API & token",
    body: "Delivered by encrypted email with full ownership, unlimited domain-based professional email, and your signed lifetime license certificate.",
  },
];

function ProcessPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>How a license is issued</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            A serious process, because the license is forever.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <ol className="grid gap-6 md:grid-cols-2">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-xl border border-border bg-card p-7 shadow-sm">
              <span className="font-serif text-3xl font-semibold text-primary">{s.n}</span>
              <h2 className="mt-3 font-serif text-xl font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </SiteLayout>
  );
}
