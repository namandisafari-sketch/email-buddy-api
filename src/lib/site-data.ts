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
  bundlePrice: "USh 680,000",
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

// Twilio → NLSCEVO migration map
export const EVO_TWILIO_MAP = [
  {
    twilio: "POST /Messages.json (Body)",
    evo: "POST /message/sendText/{instance}",
    note: "Plain text WhatsApp message. Swap From/To for your instance name + recipient number.",
  },
  {
    twilio: "POST /Messages.json (MediaUrl)",
    evo: "POST /message/sendMedia/{instance}",
    note: "Images, audio, video and documents via public URL or base64 — no MMS surcharge.",
  },
  {
    twilio: "Messaging Services / Sender Pools",
    evo: "POST /instance/create",
    note: "Create an instance per number you own. No reseller-leased numbers.",
  },
  {
    twilio: "Inbound webhook (TwiML / status callback)",
    evo: "POST /webhook/set/{instance}",
    note: "Receive messages.upsert and connection.update as clean JSON at your endpoint.",
  },
  {
    twilio: "Content Templates (HX... approval)",
    evo: "POST /message/sendText / sendButtons",
    note: "No Meta + Twilio template gatekeeping — send freely on session messages.",
  },
  {
    twilio: "Conversations API (groups)",
    evo: "POST /group/create/{instance}",
    note: "Create groups, send invites and list participants natively.",
  },
  {
    twilio: "Account SID + Auth Token",
    evo: "Authorization: Bearer <token>",
    note: "One sovereign token bound to your verified organisation and lifetime license.",
  },
];

export const MIGRATION_STEPS = [
  "Provision your NLSCEVO lifetime license and copy your Bearer token from Settings → API Reference.",
  "Create an instance with POST /instance/create and scan the pairing QR with the number you own.",
  "Re-point each Twilio Messages.json call to /message/sendText/{instance}; replace From/To with instance + number.",
  "Move Twilio status callbacks to POST /webhook/set/{instance} listening for messages.upsert and connection.update.",
  "Delete Twilio sender pools and stop monthly number rentals — your number stays authenticated for life.",
  "Verify everything in the Try It console below before cutting production traffic over.",
];

// Why a local Ugandan company can offer this
export const EVOLUTION_FAQ = {
  question:
    "How can a local Ugandan company provide a high-tech, top-ranking WhatsApp & email automation service?",
  answer: "Evolution Foundation",
  detail:
    "NLSCEVO is built on the open-source Evolution engine, stewarded by the Evolution Foundation. By self-hosting the Evolution stack on sovereign Ugandan infrastructure and pairing it with our own Email Automation API, NLSC delivers world-class capability without renting it from Twilio or any foreign reseller. The Foundation supplies the proven engine; NLSC supplies the hosting, legal identity, NITA-U compliance and lifetime support — so the ranking is earned locally, not imported.",
};

// WhatsApp API must be purchased together with Email Automation
export const BUNDLE = {
  title: "NLSCEVO ships with the Email Automation API",
  body: "The NLSCEVO WhatsApp API is sold as one sovereign bundle with the Email Automation API. Together they cover every customer touchpoint — WhatsApp, transactional and bulk email — under a single lifetime license and a single financial handle.",
  items: [
    { name: "NLSCEVO WhatsApp API", price: "USh 760,000" },
    { name: "Email Automation API", price: "USh 500,000" },
  ],
  bundleNote: "Bought together as your activation bundle.",
};

export const CRYPTO_OPTIONS = [
  { coin: "USDT (TRC-20)", network: "Tron", note: "Lowest network fee — recommended" },
  { coin: "USDT (ERC-20)", network: "Ethereum", note: "Higher gas; confirm in 12 blocks" },
  { coin: "Bitcoin (BTC)", network: "Bitcoin", note: "Settled at on-receipt UGX rate" },
];

export const DISCOUNT = {
  amount: "USh 100,000",
  day: "14th",
  why: "The 14th of every month is our financial reconciliation date. Activations settled on the 14th clear in the same batch our finance handle remits to the bank, saving us processing overhead — so we pass USh 100,000 of that saving straight back to you.",
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
    title: "Pay any bank to Nile Logic & Secure Cloud Ltd",
    body: "Walk into any bank and state you are paying Nile Logic & Secure Cloud Ltd. Settlement is confirmed against your order reference.",
  },
  {
    title: "Pay from your desk",
    body: "Pay online directly to the engineer and guide integrator from your desk, and receive your receipt instantly.",
  },
];

export const MOMO_INFO = {
  number: "+256 700 000 000",
  name: "NLSC LTD — Mobile Money",
  network: "MTN / Airtel",
  note: "Send exactly USh 680,000 and include your order reference as the payment reason.",
};

export const API_DELIVERY = {
  smtp: {
    server: "smtp.resend.com",
    port: 587,
    security: "STARTTLS",
    authMethod: "CRAM-MD5",
  },
  emailApi: {
    baseUrl: "https://api.nlscug.com/v1",
    endpoints: {
      sendTransactional: "POST /email/send",
      sendBulk: "POST /email/bulk",
      webhooks: "POST /webhooks/email",
    },
  },
  whatsappApi: {
    baseUrl: "https://evo.nlscug.com",
    endpoints: {
      sendText: "POST /message/sendText/{instance}",
      sendMedia: "POST /message/sendMedia/{instance}",
      createInstance: "POST /instance/create",
      webhook: "POST /webhook/set/{instance}",
    },
  },
  support: {
    email: "api@nlscug.com",
    phone: "0326 338 014",
    docs: "https://docs.nlscug.com",
  },
};

export const NAV = [
  { to: "/services", label: "Services" },
  { to: "/process", label: "Process" },
  { to: "/docs", label: "API Docs" },
  { to: "/nlscevo", label: "WhatsApp API" },
  { to: "/migration", label: "Migrate" },
  { to: "/cart", label: "Cart" },
  { to: "/billing", label: "Billing" },
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
