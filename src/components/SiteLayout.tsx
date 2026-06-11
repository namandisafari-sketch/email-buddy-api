import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { BRAND, NAV } from "@/lib/site-data";
import { NlscLogo } from "@/components/NlscLogo";

function NoticeBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="bg-accent/60 text-accent-foreground text-sm">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-2.5">
        <span className="mt-0.5 text-primary font-semibold">!</span>
        <p className="flex-1 leading-relaxed">
          <strong>Notice:</strong> Due to our open long-term partnership and ongoing advertising-litigation
          matters, the public website at <code className="font-mono">nlscug.com</code> has been{" "}
          <strong>discontinued for front-end visitors</strong>. It remains fully operational for licensed{" "}
          <code className="font-mono">api.nlscug.com</code> machine-to-machine connections. Please continue
          browsing here.
        </p>
        <button
          aria-label="Dismiss notice"
          onClick={() => setOpen(false)}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-serif text-lg font-bold text-primary-foreground">
            S
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight">{BRAND.name}</span>
          <span className="hidden text-xs font-medium tracking-widest text-muted-foreground sm:inline">
            · {BRAND.tag}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/services"
            className="hidden rounded-md bg-ink px-4 py-2 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Buy a license
          </Link>
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden text-foreground"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border px-4 py-3 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-muted-foreground"
              activeProps={{ className: "text-primary font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-serif text-lg font-bold text-primary-foreground">
              S
            </span>
            <span className="font-serif text-lg font-semibold">{BRAND.name}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Sovereign Email SMTP & automation APIs, signed in Kampala and settled across East Africa.
          </p>
        </div>
        <div>
          <h4 className="font-serif text-sm font-semibold">Browse</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-sm font-semibold">Compliance</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>URA-registered</li>
            <li>NITA-U compliant</li>
            <li>Settlement · Pesapal East Africa</li>
            <li>Edge-served · Vercel</li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href={`mailto:${BRAND.email}`} className="hover:text-foreground">
                {BRAND.email}
              </a>
            </li>
            <li>Kampala, Republic of Uganda</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BRAND.name}. Disputes adjudicated under the laws of the Republic of Uganda.
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NoticeBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
