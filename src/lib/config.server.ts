import process from "node:process";

// Server-only config. The .server.ts suffix prevents Vite from bundling
// this file into the client — values here never reach the browser.
//
// On Cloudflare Workers, env binds at REQUEST time. Module-scope reads
// (e.g. `const x = process.env.X`) resolve to undefined — always read
// process.env INSIDE a function or handler.
//
// When to use which env-access pattern:
//   - .server.ts module (this file): server-only helpers reused across
//     handlers. Wrap reads in a function so they run per-request.
//   - inline process.env inside a createServerFn handler: one-off reads
//     not reused elsewhere.
//   - import.meta.env.VITE_FOO: PUBLIC config readable from both client
//     and server (analytics IDs, public URLs). Define in .env with the
//     VITE_ prefix. Never put secrets here — they ship to the browser.

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    momo: {
      subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? "bca0c92d326a46cd885f443d51b859f1",
      apiUser: process.env.MTN_MOMO_API_USER ?? "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      apiKey: process.env.MTN_MOMO_API_KEY ?? "d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6",
      environment: process.env.MTN_MOMO_ENVIRONMENT ?? "sandbox",
    },
  };
}
