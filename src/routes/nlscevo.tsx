import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { CodeBlock, Eyebrow } from "@/components/ui/primitives";
import { BRAND, EVO_LICENSE, EVO_COMPARISON, EVOLUTION_FAQ, BUNDLE } from "@/lib/site-data";

export const Route = createFileRoute("/nlscevo")({
  head: () => ({
    meta: [
      { title: "NLSCEVO API — Full WhatsApp Services | NLSC" },
      {
        name: "description",
        content:
          "NLSCEVO is the sovereign Evolution-based WhatsApp API by NLSC — full inbound and outbound WhatsApp messaging that fully replaces Twilio. Lifetime license at USh 760,000.",
      },
      { property: "og:title", content: "NLSCEVO API — Full WhatsApp Services | NLSC" },
      {
        property: "og:description",
        content:
          "Full WhatsApp services, no third-party providers. Lifetime license, full-time support and free updates.",
      },
    ],
  }),
  component: NlscEvoPage,
});

const NAV_LINKS = [
  { id: "introduction", label: "Introduction" },
  { id: "authentication", label: "Authentication" },
  { id: "base-url", label: "Base URL" },
  { id: "instances", label: "Instance Controller" },
  { id: "send-text", label: "Send Text Message" },
  { id: "send-media", label: "Send Media" },
  { id: "groups", label: "Groups" },
  { id: "webhooks", label: "Webhooks" },
  { id: "errors", label: "Errors" },
  { id: "comparison", label: "vs Twilio" },
  { id: "pricing", label: "Pricing & License" },
];

type Endpoint = { method: string; path: string; desc: string };

const ENDPOINTS: Record<string, Endpoint[]> = {
  instances: [
    { method: "POST", path: "/instance/create", desc: "Create a new WhatsApp instance" },
    { method: "GET", path: "/instance/connect/{instance}", desc: "Fetch the pairing QR / code" },
    { method: "GET", path: "/instance/connectionState/{instance}", desc: "Check connection status" },
    { method: "DELETE", path: "/instance/logout/{instance}", desc: "Log out & disconnect an instance" },
  ],
  send: [
    { method: "POST", path: "/message/sendText/{instance}", desc: "Send a plain text WhatsApp message" },
    { method: "POST", path: "/message/sendMedia/{instance}", desc: "Send image, video, audio or document" },
    { method: "POST", path: "/message/sendButtons/{instance}", desc: "Send interactive button message" },
  ],
  groups: [
    { method: "POST", path: "/group/create/{instance}", desc: "Create a WhatsApp group" },
    { method: "POST", path: "/group/sendInvite/{instance}", desc: "Send group invite links" },
    { method: "GET", path: "/group/participants/{instance}", desc: "List group participants" },
  ],
};

function EndpointRow({ e }: { e: Endpoint }) {
  const color =
    e.method === "GET"
      ? "bg-accent text-accent-foreground"
      : e.method === "DELETE"
        ? "bg-destructive/10 text-destructive"
        : "bg-primary/10 text-primary";
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-0 sm:flex-row sm:items-baseline sm:gap-4">
      <code className={`inline-flex w-16 justify-center rounded px-2 py-0.5 font-mono text-xs font-semibold ${color}`}>
        {e.method}
      </code>
      <code className="font-mono text-sm text-foreground">{e.path}</code>
      <span className="text-sm text-muted-foreground sm:ml-auto sm:text-right">{e.desc}</span>
    </div>
  );
}

function NlscEvoPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <Eyebrow>NLSCEVO · WhatsApp API Reference</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">NLSCEVO API</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            Full WhatsApp services — built on the Evolution engine and operated sovereignly by NLSC. Send and
            receive WhatsApp messages, media, groups and status directly, fully eliminating third-party
            providers like Twilio. REST over HTTPS, JSON in, JSON out.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 lg:grid-cols-[210px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              API Reference
            </p>
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
          <section id="introduction" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Introduction</h2>
            <p className="mt-3 text-muted-foreground">
              The NLSCEVO API exposes full WhatsApp capabilities through a clean REST interface. Create
              instances, pair your own number, and send or receive messages, media and group events — with no
              per-message fees and no foreign reseller in the path.
            </p>
          </section>

          <section id="authentication" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Authentication</h2>
            <p className="mt-3 text-muted-foreground">
              In <strong>Settings</strong>, select the <strong>API Reference</strong> option. Copy the
              generated token and use it in the <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Authorization</code>{" "}
              header on your requests as <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Bearer &lt;copied token&gt;</code>.
            </p>
            <div className="mt-4">
              <CodeBlock>{`curl ${BRAND.evoApiBase}/instance/fetchInstances \\
  -H "Authorization: Bearer <copied token>"`}</CodeBlock>
            </div>
            <p className="mt-3 text-muted-foreground">
              Every NLSCEVO token is bound to your verified organisation and your lifetime license. Keep it
              server-side — it grants full control of your WhatsApp instances.
            </p>
          </section>

          <section id="base-url" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Base URL</h2>
            <p className="mt-3 text-muted-foreground">
              All endpoints are served from:
            </p>
            <div className="mt-4">
              <CodeBlock>{BRAND.evoApiBase}</CodeBlock>
            </div>
          </section>

          <section id="instances" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Instance Controller</h2>
            <p className="mt-3 text-muted-foreground">
              An instance is a connected WhatsApp number. Create one, scan the pairing code, and it stays
              authenticated for the life of your license.
            </p>
            <div className="mt-5 rounded-lg border border-border bg-card px-4">
              {ENDPOINTS.instances.map((e) => (
                <EndpointRow key={e.method + e.path} e={e} />
              ))}
            </div>
            <div className="mt-4">
              <CodeBlock>{`curl -X POST "${BRAND.evoApiBase}/instance/create" \\
  -H "Authorization: Bearer <copied token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instanceName": "sales-team",
    "qrcode": true
  }'`}</CodeBlock>
            </div>
          </section>

          <section id="send-text" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Send Text Message</h2>
            <div className="mt-5 rounded-lg border border-border bg-card px-4">
              {ENDPOINTS.send.slice(0, 1).map((e) => (
                <EndpointRow key={e.method + e.path} e={e} />
              ))}
            </div>
            <div className="mt-4">
              <CodeBlock>{`curl -X POST "${BRAND.evoApiBase}/message/sendText/sales-team" \\
  -H "Authorization: Bearer <copied token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "number": "256700000000",
    "text": "Hello from NLSCEVO 👋"
  }'`}</CodeBlock>
            </div>
          </section>

          <section id="send-media" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Send Media</h2>
            <p className="mt-3 text-muted-foreground">
              Send images, video, audio and documents. Provide a public URL or base64 payload.
            </p>
            <div className="mt-5 rounded-lg border border-border bg-card px-4">
              {ENDPOINTS.send.slice(1).map((e) => (
                <EndpointRow key={e.method + e.path} e={e} />
              ))}
            </div>
            <div className="mt-4">
              <CodeBlock>{`curl -X POST "${BRAND.evoApiBase}/message/sendMedia/sales-team" \\
  -H "Authorization: Bearer <copied token>" \\
  -d '{
    "number": "256700000000",
    "mediatype": "image",
    "media": "https://yourdomain.ug/receipt.png",
    "caption": "Your receipt"
  }'`}</CodeBlock>
            </div>
          </section>

          <section id="groups" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Groups</h2>
            <div className="mt-5 rounded-lg border border-border bg-card px-4">
              {ENDPOINTS.groups.map((e) => (
                <EndpointRow key={e.method + e.path} e={e} />
              ))}
            </div>
          </section>

          <section id="webhooks" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Webhooks</h2>
            <p className="mt-3 text-muted-foreground">
              Receive every inbound message, delivery receipt and connection event as JSON at your endpoint.
            </p>
            <div className="mt-4">
              <CodeBlock>{`curl -X POST "${BRAND.evoApiBase}/webhook/set/sales-team" \\
  -H "Authorization: Bearer <copied token>" \\
  -d '{
    "url": "https://app.yourdomain.ug/whatsapp/hook",
    "events": ["messages.upsert", "connection.update"]
  }'`}</CodeBlock>
            </div>
          </section>

          <section id="errors" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Errors</h2>
            <div className="mt-4">
              <CodeBlock>{`{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or missing Bearer token"
}`}</CodeBlock>
            </div>
            <p className="mt-3 text-muted-foreground">
              Standard HTTP codes: 400 invalid input, 401 invalid token, 404 instance not found, 409 instance
              already connected, 429 rate-limited, 5xx server.
            </p>
          </section>

          <section id="comparison" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">NLSCEVO vs Twilio</h2>
            <p className="mt-3 text-muted-foreground">
              NLSCEVO delivers full WhatsApp services in-house. Here is how it compares to third-party
              providers like Twilio.
            </p>
            <div className="mt-5 overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold">Feature</th>
                    <th className="px-4 py-3 font-semibold text-primary">NLSCEVO</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Twilio & others</th>
                  </tr>
                </thead>
                <tbody>
                  {EVO_COMPARISON.map((r) => (
                    <tr key={r.feature} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{r.feature}</td>
                      <td className="px-4 py-3 text-foreground">{r.evo}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.twilio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="pricing" className="scroll-mt-24">
            <h2 className="font-serif text-2xl font-semibold">Pricing & License</h2>
            <div className="mt-5 rounded-xl border border-border bg-card p-7">
              <p className="font-serif text-3xl font-semibold">{BRAND.evoPrice}</p>
              <p className="mt-1 text-sm text-muted-foreground">One-time payment · lifetime valid license</p>
              <ul className="mt-6 space-y-3">
                {EVO_LICENSE.map((t) => (
                  <li key={t} className="flex gap-3 text-sm">
                    <span className="text-primary">◆</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/services"
                className="mt-7 inline-block rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90"
              >
                Buy the NLSCEVO lifetime license
              </Link>
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
