import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { BRAND, BUNDLE } from "@/lib/site-data";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — NLSCEVO + Email Automation Bundle | NLSC" },
      {
        name: "description",
        content:
          "Your NLSCEVO WhatsApp API and Email Automation API activation bundle. Review your sovereign lifetime license cart and proceed to local billing.",
      },
      { property: "og:title", content: "Cart — NLSCEVO Activation Bundle | NLSC" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <Eyebrow>Cart · Activation bundle</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Your sovereign bundle</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            {BUNDLE.body}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
          <h2 className="font-serif text-xl font-semibold">{BUNDLE.title}</h2>
          <ul className="mt-6 divide-y divide-border">
            {BUNDLE.items.map((item) => (
              <li key={item.name} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Lifetime valid license</p>
                </div>
                <p className="font-serif text-lg font-semibold">{item.price}</p>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">{BUNDLE.bundleNote}</p>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Total</p>
              <p className="font-serif text-3xl font-semibold text-primary">{BRAND.bundlePrice}</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Pay on the 14th, save USh 100,000.</strong> Activations
            settled on the 14th of the month qualify for our reconciliation discount — see Billing for why.
          </div>

          <Link
            to="/billing"
            className="mt-6 block rounded-md bg-ink px-5 py-3 text-center text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90"
          >
            Proceed to local billing →
          </Link>
          <Link
            to="/services"
            className="mt-3 block text-center text-sm font-medium text-primary hover:underline"
          >
            ← Keep reviewing services
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
