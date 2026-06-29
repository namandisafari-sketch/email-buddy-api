import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { registerCustomer } from "@/lib/api/account";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — NLSC" },
      { name: "description", content: "Create your NLSC customer account to manage your domains and API licenses." },
      { property: "og:title", content: "Create Account — NLSC" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await registerCustomer({ data: { email, password, orgName: orgName || undefined, phone: phone || undefined } });
      if (result.success) {
        localStorage.setItem("nlsc_session", result.token);
        setSuccess(true);
        setTimeout(() => router.navigate({ to: "/account" }), 1000);
      }
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-lg px-4 py-16">
        <Eyebrow>Get started</Eyebrow>
        <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Create account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Register to manage your domains and licenses in one place.</p>

        {success ? (
          <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-6 text-sm">
            <p className="font-medium text-foreground">Account created!</p>
            <p className="mt-1 text-muted-foreground">Redirecting to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
                placeholder="you@company.com"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={8}
                placeholder="At least 8 characters"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Organisation <span className="text-muted-foreground">(optional)</span></label>
              <input value={orgName} onChange={(e) => setOrgName(e.target.value)}
                placeholder="Your company name"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone <span className="text-muted-foreground">(optional)</span></label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            {error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}
            <button type="submit" disabled={loading || !email || !password}
              className="w-full rounded-md bg-ink px-5 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40">
              {loading ? "Creating account…" : "Create account"}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline">Sign in</a>
            </p>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}
