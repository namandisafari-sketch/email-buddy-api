import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { CERTIFICATION } from "@/lib/site-data";
import certificate from "@/assets/nita-certificate.png.asset.json";

export const Route = createFileRoute("/certifications")({
  head: () => ({
    meta: [
      { title: "Certifications — NITA-U Conformity Level 3 | NLSC" },
      {
        name: "description",
        content:
          "NLSC LTD is certified by the National Information Technology Authority – Uganda (NITA-U) under Conformity Certificate Level 3, valid 21 Feb 2025 to 21 Feb 2026.",
      },
      { property: "og:title", content: "Certifications — NITA-U Conformity Level 3 | NLSC" },
      {
        property: "og:description",
        content:
          "Proud to be certified by NITA-U under Conformity Certificate Level 3 across retail, computer programming, consultancy and information services.",
      },
      { property: "og:image", content: certificate.url },
    ],
  }),
  component: CertificationsPage,
});

function CertificationsPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>Certifications & Compliance</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            Certified by NITA-U — Conformity Certificate Level 3.
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
            We are proud to be certified by the{" "}
            <strong className="text-foreground">{CERTIFICATION.authority}</strong> under{" "}
            <strong className="text-foreground">{CERTIFICATION.level}</strong>. This certification, awarded in
            accordance with the {CERTIFICATION.regulation}, affirms our compliance and excellence in delivering
            IT products and services across key areas including retail, computer programming, consultancy, and
            information services. Valid from {CERTIFICATION.validFrom} to {CERTIFICATION.validTill}, this
            recognition reflects our commitment to quality, reliability, and innovation in Uganda's digital
            transformation journey.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Certificate image */}
          <figure className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <img
              src={certificate.url}
              alt="NITA-U Conformity Certificate Level 3 awarded to NLSC LTD, reference NITA/CCR/2023-332"
              className="w-full"
              loading="lazy"
            />
            <figcaption className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
              Official NITA-U Conformity Certificate · Reference {CERTIFICATION.reference}
            </figcaption>
          </figure>

          {/* Details */}
          <div>
            <h2 className="font-serif text-2xl font-semibold">Certificate details</h2>
            <dl className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
              <Row label="Certified entity" value={CERTIFICATION.holder} />
              <Row label="Awarding authority" value={CERTIFICATION.authority} />
              <Row label="Conformity level" value={CERTIFICATION.level} />
              <Row label="Regulation" value={CERTIFICATION.regulation} />
              <Row label="Reference number" value={CERTIFICATION.reference} />
              <Row label="Valid from" value={CERTIFICATION.validFrom} />
              <Row label="Valid till" value={CERTIFICATION.validTill} />
            </dl>

            <h3 className="mt-10 font-serif text-xl font-semibold">Certified scope of services</h3>
            <ul className="mt-4 space-y-3">
              {CERTIFICATION.scope.map((s) => (
                <li key={s} className="flex gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                  <span className="text-primary">◆</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border border-border bg-secondary/50 p-6 text-sm text-muted-foreground">
              Conformity Assurance does not, by itself, constitute a warranty of any service. To confirm
              certification status, contact NITA-Uganda Toll-Free 00800-7777111 or{" "}
              <a href="mailto:assurance@nita.go.ug" className="text-primary hover:underline">
                assurance@nita.go.ug
              </a>
              .
              <Link to="/services" className="mt-3 block font-medium text-primary hover:underline">
                Explore our certified lifetime licenses →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-40 shrink-0 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
