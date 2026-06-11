import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Order — NLSC" },
      {
        name: "description",
        content: "Track the review status of your NLSC lifetime license order using your Pesapal reference.",
      },
      { property: "og:title", content: "Track Order — NLSC" },
    ],
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const [ref, setRef] = useState("");
  const [status, setStatus] = useState<null | string>(null);

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <Eyebrow>Order status</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Track your license review</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Enter the Pesapal reference from your settlement confirmation. School orders are reviewed within
            2 working days.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-4 py-16">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStatus(
              ref.trim()
                ? "In compliance review — your Server Authority Token will be issued within 2 working days."
                : "Please enter a valid Pesapal reference.",
            );
          }}
          className="rounded-xl border border-border bg-card p-7 shadow-sm"
        >
          <label className="block text-sm font-medium" htmlFor="ref">
            Pesapal reference
          </label>
          <input
            id="ref"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="e.g. PSP-01HX..."
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90"
          >
            Check status
          </button>
          {status && (
            <p className="mt-4 rounded-md bg-accent px-4 py-3 text-sm text-accent-foreground">{status}</p>
          )}
        </form>
      </section>
    </SiteLayout>
  );
}
