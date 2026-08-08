import { defineConfig } from "@playwright/test";

/**
 * E2E tests require a real Supabase instance (anonymous auth enabled) and the
 * env vars from .env.example. They are therefore opt-in:
 *   pnpm exec playwright install chromium && pnpm test:e2e
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  use: {
    baseURL: process.env["E2E_BASE_URL"] ?? "http://localhost:5173",
    trace: "retain-on-failure"
  },
  webServer: process.env["E2E_BASE_URL"]
    ? undefined
    : { command: "pnpm dev", url: "http://localhost:5173", reuseExistingServer: true }
});
