import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";

export const Route = createFileRoute("/vouchers")({
  head: () => ({
    meta: [
      { title: "Free WiFi Voucher Generator — NLSC" },
      { name: "description", content: "Generate and print free WiFi hotspot vouchers for your business. No signup required. Powered by NLSC." },
      { property: "og:title", content: "Free WiFi Voucher Generator — NLSC" },
    ],
  }),
  component: VouchersPage,
});

function generateCode(prefix: string, index: number, length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codeLen = 8;
  let code = "";
  for (let i = 0; i < codeLen; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  const padded = String(index + 1).padStart(String(length).length, "0");
  return prefix ? `${prefix}-${code}` : code;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function VouchersPage() {
  const [hotspotName, setHotspotName] = useState("My Hotspot");
  const [packageName, setPackageName] = useState("Daily Pass");
  const [price, setPrice] = useState("1000");
  const [duration, setDuration] = useState("24 Hours");
  const [quantity, setQuantity] = useState(8);
  const [prefix, setPrefix] = useState("NLSC");
  const [generated, setGenerated] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const today = formatDate(new Date());

  const vouchers = Array.from({ length: quantity }, (_, i) => ({
    code: generateCode(prefix, i, quantity),
    index: i + 1,
  }));

  const maxVouchersPerSheet = 8;
  const sheets: typeof vouchers[] = [];
  for (let i = 0; i < vouchers.length; i += maxVouchersPerSheet) {
    sheets.push(vouchers.slice(i, i + maxVouchersPerSheet));
  }

  const handleGenerate = useCallback(() => {
    setGenerated(true);
    setTimeout(() => {
      printRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-sm text-white">&#10003;</span>
            <Eyebrow>Free Tool — No Signup Required</Eyebrow>
          </div>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">WiFi Voucher Generator</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Create and print professional WiFi hotspot vouchers in seconds. Enter your hotspot details below, generate, and print.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold">Voucher details</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Hotspot / Business name</label>
                <input value={hotspotName} onChange={(e) => setHotspotName(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-sm font-medium">Package name</label>
                <input value={packageName} onChange={(e) => setPackageName(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-sm font-medium">Price (UGX)</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number"
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-sm font-medium">Duration</label>
                <input value={duration} onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 24 Hours, 7 Days, 30 Days"
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-sm font-medium">Number of vouchers</label>
                <input value={quantity} onChange={(e) => setQuantity(Math.min(50, Math.max(1, Number(e.target.value) || 1)))} type="number" min={1} max={50}
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                <p className="mt-1 text-xs text-muted-foreground">Max 50 per batch</p>
              </div>
              <div>
                <label className="text-sm font-medium">Code prefix (optional)</label>
                <input value={prefix} onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  placeholder="e.g. NLSC"
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <button onClick={handleGenerate}
              className="mt-6 w-full rounded-md bg-ink px-5 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 sm:w-auto">
              Generate {quantity} voucher{quantity > 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </section>

      {generated && (
        <section className="border-b border-border bg-background" ref={printRef}>
          <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Eyebrow>Ready to print</Eyebrow>
                <h2 className="font-serif text-2xl font-semibold">{quantity} voucher{quantity > 1 ? "s" : ""} generated</h2>
              </div>
              <button onClick={handlePrint}
                className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90">
                Print / Save PDF
              </button>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              {sheets.length} sheet{sheets.length > 1 ? "s" : ""} &middot; {maxVouchersPerSheet} vouchers per sheet &middot; Use the print button above or Ctrl+P
            </p>
            <div className="space-y-4">
              {sheets.map((sheet, sIdx) => (
                <div key={sIdx} className="voucher-sheet rounded-xl border-2 border-dashed border-border bg-white p-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {sheet.map((v) => (
                      <div key={v.code} className="voucher-card flex flex-col rounded-lg border-2 border-gray-300 bg-white p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{hotspotName}</span>
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-mono text-gray-500">{v.index}</span>
                        </div>
                        <div className="mt-1 text-center">
                          <p className="text-lg font-bold tracking-wide text-gray-900">{v.code}</p>
                        </div>
                        <div className="mt-1.5 text-center">
                          <p className="text-sm font-semibold text-gray-800">{packageName}</p>
                          <p className="text-base font-bold text-gray-900">UGX {Number(price).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-500">{duration}</p>
                        </div>
                        <div className="mt-auto pt-2 text-center">
                          <p className="text-[8px] text-gray-400">Issued {today}</p>
                          <p className="text-[8px] text-gray-400">Powered by NLSC</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <Eyebrow>Why use NLSC for your hotspot?</Eyebrow>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-5 text-sm">
              <span className="text-lg">&#10003;</span>
              <h3 className="mt-2 font-semibold">Free voucher tool</h3>
              <p className="mt-1 text-muted-foreground">Generate unlimited vouchers at zero cost. No signup, no fees, no limits.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5 text-sm">
              <span className="text-lg">&#10003;</span>
              <h3 className="mt-2 font-semibold">5% mobile money</h3>
              <p className="mt-1 text-muted-foreground">When you're ready for auto-payments, NLSC charges only 5% per transaction — half of what others take.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5 text-sm">
              <span className="text-lg">&#10003;</span>
              <h3 className="mt-2 font-semibold">Buy once, own it</h3>
              <p className="mt-1 text-muted-foreground">One-time hotspot license, lifetime validity. No monthly subscriptions. No hidden fees.</p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media print {
          @page { margin: 10mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          header, nav, footer, .no-print { display: none !important; }
          .voucher-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            page-break-after: always;
          }
          .voucher-card {
            border: 2px solid #374151 !important;
            border-radius: 8px !important;
            padding: 10px !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </SiteLayout>
  );
}
