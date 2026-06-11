import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { CodeBlock, Eyebrow } from "@/components/ui/primitives";
import { BRAND } from "@/lib/site-data";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "API Documentation — NLSC Email SMTP & Automation" },
      {
        name: "description",
        content:
          "REST over HTTPS. JSON in, JSON out. NLSC Email SMTP and automation API reference: send, campaigns, automation flows, inbound parse and auth tokens.",
      },
      { property: "og:title", content: "API Documentation — NLSC" },
    ],
  }),
  component: DocsPage,
});

type Endpoint = { method: string; path: string; desc: string };
type DocSection = {
  id: string;
  title: string;
  intro: string;
  endpoints?: Endpoint[];
  curl?: string;
};

const NAV_LINKS = [
  { id: "overview", label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "errors", label: "Errors" },
  { id: "rate-limits", label: "Rate limits" },
  { id: "smtp-relay", label: "SMTP Relay" },
  { id: "send", label: "Send API" },
  { id: "campaigns", label: "Campaigns" },
  { id: "automation", label: "Automation" },
  { id: "inbound", label: "Inbound Parse" },
  { id: "auth-token", label: "Server Authority" },
];

const SECTIONS: DocSection[] = [
  {
    id: "smtp-relay",
    title: "Transactional SMTP Relay",
    intro:
      "Authenticated SMTP over TLS for transactional mail. Connect any mail client or framework to the relay host using credentials minted from your Server Authority Token.",
    endpoints: [
      { method: "HOST", path: "smtp.nlscug.com:587", desc: "STARTTLS submission endpoint" },
      { method: "HOST", path: "smtp.nlscug.com:465", desc: "Implicit TLS submission endpoint" },
      { method: "POST", path: "/v1/smtp/credentials", desc: "Mint scoped SMTP username & password" },
    ],
    curl: `curl -X POST "${BRAND.apiBase}/smtp/credentials" \\
  -H "Authorization: Bearer $SLF_TOKEN" \\
  -d '{"label":"app-prod","scope":"send"}'`,
  },
  {
    id: "send",
    title: "Send API",
    intro:
      "Send a single transactional email — receipts, OTPs, password resets — over HTTPS instead of SMTP. Supports HTML, plain text, templates and attachments.",
    endpoints: [
      { method: "POST", path: "/v1/send", desc: "Send one transactional message" },
      { method: "GET", path: "/v1/messages/{message_id}", desc: "Fetch delivery status & events" },
      { method: "GET", path: "/v1/messages?status={s}", desc: "List recent messages by status" },
    ],
    curl: `curl -X POST "${BRAND.apiBase}/send" \\
  -H "Authorization: Bearer $SLF_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "noreply@yourdomain.ug",
    "to": "customer@example.com",
    "subject": "Your receipt",
    "html": "<h1>Thank you</h1>"
  }'`,
  },
  {
    id: "campaigns",
    title: "Bulk Campaign API",
    intro:
      "Send newsletters and announcements to managed lists with per-domain throttling, suppression and unsubscribe handling baked in.",
    endpoints: [
      { method: "POST", path: "/v1/campaigns", desc: "Create a campaign from a template & list" },
      { method: "POST", path: "/v1/campaigns/{id}/send", desc: "Queue the campaign for delivery" },
      { method: "GET", path: "/v1/campaigns/{id}/stats", desc: "Opens, clicks, bounces & unsubscribes" },
      { method: "POST", path: "/v1/lists/{id}/contacts", desc: "Add or upsert contacts to a list" },
    ],
    curl: `curl -X POST "${BRAND.apiBase}/campaigns" \\
  -H "Authorization: Bearer $SLF_TOKEN" \\
  -d '{"list_id":"lst_01","template_id":"tpl_news","subject":"March update"}'`,
  },
  {
    id: "automation",
    title: "Automation Flows API",
    intro:
      "Event-driven flows with triggers, delays and conditional branches. Send the right email at the right moment based on webhooks or schedules.",
    endpoints: [
      { method: "POST", path: "/v1/flows", desc: "Create an automation flow definition" },
      { method: "POST", path: "/v1/flows/{id}/trigger", desc: "Fire an event into a flow" },
      { method: "PATCH", path: "/v1/flows/{id}", desc: "Update steps, delays or branches" },
      { method: "GET", path: "/v1/flows/{id}/runs", desc: "Inspect flow run history" },
    ],
    curl: `curl -X POST "${BRAND.apiBase}/flows/flow_welcome/trigger" \\
  -H "Authorization: Bearer $SLF_TOKEN" \\
  -d '{"contact":"customer@example.com","data":{"name":"Amina"}}'`,
  },
  {
    id: "inbound",
    title: "Inbound Parse & Webhooks",
    intro:
      "Route incoming mail to your endpoints as structured JSON. Configure an MX-routed address and receive parsed replies, attachments and spam scores.",
    endpoints: [
      { method: "POST", path: "/v1/inbound/routes", desc: "Register an inbound address & webhook URL" },
      { method: "GET", path: "/v1/inbound/routes", desc: "List configured inbound routes" },
      { method: "GET", path: "/v1/inbound/messages/{id}", desc: "Fetch a parsed inbound message" },
    ],
    curl: `curl -X POST "${BRAND.apiBase}/inbound/routes" \\
  -H "Authorization: Bearer $SLF_TOKEN" \\
  -d '{"address":"support@yourdomain.ug","webhook":"https://app/hook"}'`,
  },
  {
    id: "auth-token",
    title: "Server Authority Token — Lifetime",
    intro:
      "A sovereign ED25519 keypair bound to your verified legal identity. Used to sign JWTs that every NLSC service trusts without further negotiation.",
    endpoints: [
      { method: "POST", path: "/v1/auth/token", desc: "Exchange a signed assertion for a short-lived bearer JWT" },
      { method: "GET", path: "/v1/auth/jwks", desc: "Public JWKS for downstream services" },
      { method: "POST", path: "/v1/auth/introspect", desc: "Validate a presented bearer token" },
    ],
    curl: `curl -X POST "${BRAND.apiBase}/auth/token" \\
  -H "Content-Type: application/json" \\
  -d '{"assertion":"eyJhbGciOiJFZERTQSI..."}'`,
  },
];

function EndpointRow({ e }: { e: Endpoint }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-0 sm:flex-row sm:items-baseline sm:gap-4">
      <code className="inline-flex w-fit rounded bg-accent px-2 py-0.5 font-mono text-xs font-semibold text-accent-foreground">
        {e.method}
      </code>
      <code className="font-mono text-sm text-foreground">{e.path}</code>
      <span className="text-sm text-muted-foreground sm:ml-auto sm:text-right">{e.desc}</span>
    </div>
  );
}

function DocsPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <Eyebrow>Reference</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">API Documentation</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            REST over HTTPS. JSON in, JSON out. All endpoints are versioned under{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">/v1</code> and require a bearer
            token issued from your{" "}
            <Link to="/services" className="text-primary hover:underline">
              Server Authority Token
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 lg:grid-cols-[200px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 max-w-3xl space-y-14">
          <section id="overview" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Overview</h2>
            <p className="mt-3 text-muted-foreground">
              Base URL:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{BRAND.apiBase}</code>
            </p>
            <p className="mt-3 text-muted-foreground">
              Every response carries <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">X-Request-Id</code>{" "}
              for support correlation. Timestamps are ISO-8601 UTC. All payloads are UTF-8 JSON.
            </p>
          </section>

          <section id="authentication" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Authentication</h2>
            <p className="mt-3 text-muted-foreground">
              Pass a JWT signed by your Server Authority Token in the{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Authorization</code> header.
            </p>
            <div className="mt-4">
              <CodeBlock>{`curl ${BRAND.apiBase}/send \\
  -H "Authorization: Bearer eyJhbGciOiJFZERTQSI..."`}</CodeBlock>
            </div>
            <p className="mt-3 text-muted-foreground">
              Tokens are minted by exchanging your signed assertion at{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">POST /v1/auth/token</code>.
            </p>
          </section>

          <section id="errors" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Errors</h2>
            <div className="mt-4">
              <CodeBlock>{`{
  "error": "not_found",
  "message": "No message matches id msg_9999",
  "request_id": "req_01HX..."
}`}</CodeBlock>
            </div>
            <p className="mt-3 text-muted-foreground">
              Standard HTTP status codes: 400 invalid input, 401 missing/invalid bearer, 403 license scope
              mismatch, 404 not found, 422 unsendable recipient, 429 rate-limited, 5xx server.
            </p>
          </section>

          <section id="rate-limits" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Rate limits</h2>
            <p className="mt-3 text-muted-foreground">
              Lifetime licenses include 100 messages/second per token, burst 400, and 50,000 recipients per
              campaign call. Need more throughput? Email{" "}
              <a href={`mailto:${BRAND.email}`} className="text-primary hover:underline">
                {BRAND.email}
              </a>
              .
            </p>
          </section>

          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="font-serif text-2xl font-semibold">{s.title}</h2>
              <p className="mt-3 text-muted-foreground">{s.intro}</p>
              {s.endpoints && (
                <div className="mt-5 rounded-lg border border-border bg-card px-4">
                  {s.endpoints.map((e) => (
                    <EndpointRow key={e.method + e.path} e={e} />
                  ))}
                </div>
              )}
              {s.curl && (
                <div className="mt-4">
                  <CodeBlock>{s.curl}</CodeBlock>
                </div>
              )}
            </section>
          ))}

          <div className="rounded-xl border border-border bg-secondary/50 p-6">
            <p className="text-sm text-muted-foreground">
              {BRAND.price} per API · Server Authority Token issued in 2 working days.
            </p>
            <Link to="/services" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
              Explore lifetime licenses →
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
