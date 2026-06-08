import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { BRAND } from "@/lib/site-data";

export const Route = createFileRoute("/policy")({
  head: () => ({
    meta: [
      { title: "Policy & Law — SelfUgaApi" },
      {
        name: "description",
        content:
          "SelfUgaApi acceptable-use policy, anti-abuse rules, and the legal framework governing lifetime email licenses under the laws of Uganda.",
      },
      { property: "og:title", content: "Policy & Law — SelfUgaApi" },
    ],
  }),
  component: PolicyPage,
});

const SECTIONS = [
  {
    h: "Acceptable use",
    p: "Licensed email APIs may only be used to send mail that recipients have consented to receive. Unsolicited bulk mail, phishing, malware distribution and identity spoofing are strictly prohibited and grounds for immediate revocation.",
  },
  {
    h: "Identity & licensing",
    p: "Every license is issued in your verified legal name. Reselling, forging, or misrepresenting a SelfUgaApi license is a breach of contract and a violation of the Computer Misuse Act of Uganda.",
  },
  {
    h: "Enforcement",
    p: "Confirmed violators are reported to NITA-U and pursued through the courts of the Republic of Uganda. We do not negotiate with bad faith actors. Suspended tokens are not eligible for refund.",
  },
  {
    h: "Deliverability obligations",
    p: "Licensees must maintain valid SPF, DKIM and DMARC records, honor unsubscribe requests promptly, and keep complaint rates below 0.1%. Persistent abuse of shared IP reputation may result in throttling.",
  },
  {
    h: "Governing law",
    p: "These terms, and all disputes arising from them, are governed by and adjudicated under the laws of the Republic of Uganda.",
  },
];

function PolicyPage() {
  return (
    <SiteLayout>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>Zero scam tolerance</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            Policy, community guidelines & law.
          </h1>
          <p className="mt-5 max-w-3xl text-ink-foreground/80">
            The trust behind a lifetime license depends on rules that hold. Questions? Email{" "}
            <a href={`mailto:${BRAND.email}`} className="text-primary hover:underline">
              {BRAND.email}
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="space-y-10">
          {SECTIONS.map((s) => (
            <div key={s.h}>
              <h2 className="font-serif text-2xl font-semibold">{s.h}</h2>
              <p className="mt-2 text-muted-foreground">{s.p}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
