export const BRAND = {
  name: "SelfUgaApi",
  tag: "UGANDA",
  product: "Email SMTP & Automation",
  apiBase: "https://api.selfugaapi.ug/v1",
  email: "api@selfugaapi.ug",
  legalName: "SelfUga Api Ltd",
  price: "USh 500,000",
};

export const LICENSE_TERMS = [
  "Lifetime valid license — pay once, own it forever",
  "Full ownership of your issued API & Server Authority token",
  "No reselling — the license is bound to your verified organisation",
  "Production of unlimited domain-based professional email addresses",
  "Receipt issued instantly on payment",
];

export const PAYMENT_METHODS = [
  {
    title: "Pay any bank to SelfUga Api Ltd",
    body: "Walk into any bank and state you are paying SelfUga Api Ltd. Settlement is confirmed against your order reference.",
  },
  {
    title: "Pay from your desk",
    body: "Pay online directly to the engineer and guide integrator from your desk, and receive your receipt instantly.",
  },
];

export const NAV = [
  { to: "/services", label: "Services" },
  { to: "/process", label: "Process" },
  { to: "/docs", label: "API Docs" },
  { to: "/license", label: "License" },
  { to: "/who-we-are", label: "Who we are" },
  { to: "/policy", label: "Policy & Law" },
  { to: "/track-order", label: "Track order" },
] as const;

export type Service = {
  slug: string;
  badge: string;
  title: string;
  blurb: string;
  features: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "smtp-relay",
    badge: "Lifetime",
    title: "Transactional SMTP Relay",
    blurb: "Lifetime authenticated SMTP relay for transactional mail — receipts, OTPs, password resets — with TLS and DKIM signing.",
    features: [
      "Authenticated SMTP over TLS (ports 587 / 465)",
      "Lifetime license — no renewals, no expiry",
      "Automatic DKIM, SPF & DMARC alignment",
    ],
  },
  {
    slug: "bulk-campaigns",
    badge: "Lifetime",
    title: "Bulk Campaign API",
    blurb: "Lifetime bulk-sending API for newsletters and announcements with list management, suppression and per-domain throttling.",
    features: [
      "Batch send up to 50,000 recipients per call",
      "Lifetime license — no renewals, no expiry",
      "Suppression lists, bounces & unsubscribe handling",
    ],
  },
  {
    slug: "automation-flows",
    badge: "Lifetime",
    title: "Automation Flows API",
    blurb: "Lifetime event-driven automation — triggers, delays and conditional branches that send the right email at the right moment.",
    features: [
      "Webhook & schedule triggers, multi-step flows",
      "Lifetime license — no renewals, no expiry",
      "Conditional branching & template variables",
    ],
  },
  {
    slug: "inbound-parse",
    badge: "Lifetime",
    title: "Inbound Parse & Webhooks",
    blurb: "Lifetime inbound mail processing — route replies and incoming messages to your endpoints as clean, structured JSON.",
    features: [
      "MX-routed inbound mail to JSON webhooks",
      "Lifetime license — no renewals, no expiry",
      "Attachment extraction & spam scoring",
    ],
  },
  {
    slug: "auth-token",
    badge: "Lifetime",
    title: "Server Authority Token",
    blurb: "A sovereign ED25519 keypair bound to your verified legal identity, used to sign JWTs that every SelfUgaApi service trusts.",
    features: [
      "ED25519 keypair bound to legal identity",
      "Lifetime license — no renewals, no expiry",
      "JWKS endpoint & token introspection",
    ],
  },
];

export const TIMELINE = [
  {
    date: "May 2026",
    title: "SelfUgaApi clears 1 billion emails delivered",
    body: "Our relay now settles over a billion lifetime-licensed messages with 99.98% delivery.",
  },
  {
    date: "Mar 2026",
    title: "Pesapal East Africa renews settlement partnership",
    body: "Multi-year MoU keeps UGX settlement instant across all SelfUgaApi services.",
  },
  {
    date: "Nov 2025",
    title: "Vercel Edge powers SelfUgaApi globally",
    body: "Sub-50ms p95 latency from Kampala to Frankfurt on the new edge runtime.",
  },
  {
    date: "Aug 2009",
    title: "SelfUgaApi founded in Kampala",
    body: "First sovereign Ugandan mail-delivery registry — operating continuously since 2009.",
  },
];
