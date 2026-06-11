export const BRAND = {
  name: "NLSC",
  fullName: "Nile Logic & Secure Cloud",
  tradingAs: "NLSCUG",
  tagline: "Nile Logic & Secure Cloud, Uganda",
  tag: "UGANDA",
  product: "Email SMTP & Automation",
  domain: "nlscug.com",
  apiBase: "https://api.nlscug.com/v1",
  email: "api@nlscug.com",
  legalName: "Nile Logic & Secure Cloud Ltd",
  price: "USh 500,000",
  evoPrice: "USh 760,000",
  evoApiBase: "https://evo.nlscug.com",
  bundlePrice: "USh 1,160,000",
};

export const CONTACT = {
  phone: "0326 338 014",
  address: "1st Floor Lunna Plaza, 25, Entebbe Road, Kampala, Uganda",
  poBox: "P.O Box: 6089",
};

export const CERTIFICATION = {
  authority: "National Information Technology Authority – Uganda (NITA-U)",
  level: "Conformity Certificate Level 3",
  regulation: "NITA-U IT Certification Regulations of 2016",
  holder: "NLSC LTD",
  reference: "NITA/CCR/2023-332",
  validFrom: "21st February 2025",
  validTill: "21st February 2026",
  scope: [
    "Retail (4741)",
    "Computer programming, consultancy and related activities (6201, 6202, 6209)",
    "Information Services (6311, 6312)",
  ],
};

export const EVO_LICENSE = [
  "Lifetime valid license — pay once, own NLSCEVO forever",
  "Full WhatsApp services — fully eliminates third-party providers like Twilio",
  "Full-time support & help, included for the life of your license",
  "New updates eligibility — every future NLSCEVO release at no extra cost",
  "Unlimited domain-based instances bound to your verified organisation",
];

export const EVO_COMPARISON = [
  { feature: "Pricing model", evo: "One-time USh 760,000 lifetime license", twilio: "Per-message + per-number monthly fees" },
  { feature: "WhatsApp sending & receiving", evo: "Full inbound & outbound, native", twilio: "Outbound + inbound via approved templates" },
  { feature: "Number ownership", evo: "Your own number, no reseller lock-in", twilio: "Number leased from provider" },
  { feature: "Message templates approval", evo: "No third-party gatekeeping", twilio: "Meta + Twilio template review" },
  { feature: "Media, groups & status", evo: "Images, audio, docs, groups, status", twilio: "Limited group / status support" },
  { feature: "Support", evo: "Full-time lifetime support included", twilio: "Paid support tiers" },
  { feature: "Updates", evo: "Lifetime free updates", twilio: "Subject to API version changes" },
  { feature: "Data sovereignty", evo: "Signed & settled in Uganda (UGX)", twilio: "Foreign billing & data residency" },
];

export const LICENSE_TERMS = [
  "Lifetime valid license — pay once, own it forever",
  "Full ownership of your issued API & Server Authority token",
  "No reselling — the license is bound to your verified organisation",
  "Production of unlimited domain-based professional email addresses",
  "Receipt issued instantly on payment",
];

export const PAYMENT_METHODS = [
  {
    title: "Pay any bank to Nile Logic & Secure Cloud Ltd",
    body: "Walk into any bank and state you are paying Nile Logic & Secure Cloud Ltd. Settlement is confirmed against your order reference.",
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
  { to: "/nlscevo", label: "WhatsApp API" },
  { to: "/license", label: "License" },
  { to: "/certifications", label: "Certifications" },
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
    blurb: "A sovereign ED25519 keypair bound to your verified legal identity, used to sign JWTs that every NLSC service trusts.",
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
    title: "NLSC clears 1 billion emails delivered",
    body: "Our relay now settles over a billion lifetime-licensed messages with 99.98% delivery.",
  },
  {
    date: "Mar 2026",
    title: "Pesapal East Africa renews settlement partnership",
    body: "Multi-year MoU keeps UGX settlement instant across all NLSC services.",
  },
  {
    date: "Nov 2025",
    title: "Vercel Edge powers NLSC globally",
    body: "Sub-50ms p95 latency from Kampala to Frankfurt on the new edge runtime.",
  },
  {
    date: "Aug 2009",
    title: "NLSC founded in Kampala",
    body: "First sovereign Ugandan mail-delivery registry — operating continuously since 2009.",
  },
];
