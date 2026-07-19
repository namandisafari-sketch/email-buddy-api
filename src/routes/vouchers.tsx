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
  return prefix ? `${prefix}-${code}` : code;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function voucherHtml(hotspotName: string, packageName: string, price: string, duration: string, today: string, sheets: { code: string; index: number }[][]): string {
  const sheetHtml = sheets.map((sheet) => `
    <div class="sheet">
      ${sheet.map((v) => `
        <div class="card">
          <div class="card-header">
            <span class="hotspot-name">${hotspotName}</span>
            <span class="card-num">${v.index}</span>
          </div>
          <div class="card-code">${v.code}</div>
          <div class="card-body">
            <div class="card-package">${packageName}</div>
            <div class="card-price">UGX ${Number(price).toLocaleString()}</div>
            <div class="card-duration">${duration}</div>
          </div>
          <div class="card-footer">Issued ${today}<br/>Powered by NLSC</div>
        </div>
      `).join("")}
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>NLSC Vouchers</title>
<style>
  @page { margin: 8mm; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6mm; page-break-after: always; padding: 0; }
  .card { border: 2px solid #374151; border-radius: 6px; padding: 5mm; display: flex; flex-direction: column; min-height: 50mm; }
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2mm; }
  .hotspot-name { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; }
  .card-num { font-size: 8px; font-family: monospace; background: #f3f4f6; padding: 1px 4px; border-radius: 3px; color: #6b7280; }
  .card-code { font-size: 16px; font-weight: 700; letter-spacing: 1px; text-align: center; color: #111827; margin: 3mm 0; font-family: monospace; }
  .card-body { text-align: center; flex: 1; }
  .card-package { font-size: 11px; font-weight: 600; color: #1f2937; }
  .card-price { font-size: 14px; font-weight: 700; color: #111827; margin-top: 1mm; }
  .card-duration { font-size: 9px; color: #6b7280; margin-top: 0.5mm; }
  .card-footer { text-align: center; font-size: 7px; color: #9ca3af; margin-top: auto; padding-top: 2mm; line-height: 1.4; }
</style></head>
<body>${sheetHtml}</body></html>`;
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
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(voucherHtml(hotspotName, packageName, price, duration, today, sheets));
    w.document.close();
    w.focus();
    w.onafterprint = () => w.close();
    setTimeout(() => { w.print(); }, 300);
  }, [hotspotName, packageName, price, duration, today, sheets]);

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


    </SiteLayout>
  );
}
