import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Eyebrow } from "@/components/ui/primitives";
import { loginCustomer } from "@/lib/api/account";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — NLSC" },
      { name: "description", content: "Sign in to your NLSC customer account." },
      { property: "og:title", content: "Sign In — NLSC" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await loginCustomer({ data: { email, password } });
      if (result.success) {
        localStorage.setItem("nlsc_session", result.token);
        router.navigate({ to: "/account" });
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
        <Eyebrow>Welcome back</Eyebrow>
        <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Access your NLSC account to manage everything you own.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
              placeholder="you@company.com"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
              placeholder="Your password"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </div>
          {error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}
          <button type="submit" disabled={loading || !email || !password}
            className="w-full rounded-md bg-ink px-5 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-40">
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="/register" className="text-primary hover:underline">Create one</a>
          </p>
        </form>
      </section>
    </SiteLayout>
  );
}
