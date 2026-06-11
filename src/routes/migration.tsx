import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { CodeBlock, Eyebrow } from "@/components/ui/primitives";
import { BRAND, EVO_TWILIO_MAP, MIGRATION_STEPS } from "@/lib/site-data";

export const Route = createFileRoute("/migration")({
  head: () => ({
    meta: [
      { title: "Twilio → NLSCEVO Migration Guide | NLSC" },
      {
        name: "description",
        content:
          "Map every Twilio WhatsApp feature to its NLSCEVO Evolution API endpoint, with recommended configuration steps to cut over from Twilio to sovereign WhatsApp.",
      },
      { property: "og:title", content: "Twilio → NLSCEVO Migration Guide | NLSC" },
      {
        property: "og:description",
        content: "A feature-by-feature map from Twilio to the NLSCEVO Evolution WhatsApp API.",
      },
    ],
  }),
  component: MigrationPage,
});

function MigrationPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <Eyebrow>Migration · Twilio → NLSCEVO</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
            Leave Twilio. Keep every feature.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            This guide maps each Twilio messaging feature to its NLSCEVO Evolution API equivalent, then walks
            you through the recommended configuration steps to move production WhatsApp traffic over — without
            per-message fees, leased numbers or template gatekeeping.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-serif text-2xl font-semibold">Feature map</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Find your Twilio call on the left; use the NLSCEVO endpoint on the right.
        </p>
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left">
                <th className="px-4 py-3 font-semibold text-muted-foreground">Twilio</th>
                <th className="px-4 py-3 font-semibold text-primary">NLSCEVO endpoint</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {EVO_TWILIO_MAP.map((r) => (
                <tr key={r.twilio} className="border-b border-border align-top last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.twilio}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{r.evo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="font-serif text-2xl font-semibold">Recommended configuration steps</h2>
          <ol className="mt-6 space-y-4">
            {MIGRATION_STEPS.map((s, i) => (
              <li key={s} className="flex gap-4 rounded-lg border border-border bg-card p-5 text-sm">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-serif text-2xl font-semibold">Before / after</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Twilio (before)</p>
            <CodeBlock>{`curl -X POST \\
  "https://api.twilio.com/2010-04-01/Accounts/AC.../Messages.json" \\
  --data-urlencode "From=whatsapp:+14155238886" \\
  --data-urlencode "To=whatsapp:+256700000000" \\
  --data-urlencode "Body=Hello" \\
  -u AC...:auth_token`}</CodeBlock>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-primary">NLSCEVO (after)</p>
            <CodeBlock>{`curl -X POST "${BRAND.evoApiBase}/message/sendText/sales-team" \\
  -H "Authorization: Bearer <copied token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "number": "256700000000",
    "text": "Hello"
  }'`}</CodeBlock>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/nlscevo"
            className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-ink-foreground hover:opacity-90"
          >
            Open the NLSCEVO API reference →
          </Link>
          <Link
            to="/cart"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            Start your migration bundle
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
