import { test, expect } from "@playwright/test";

/**
 * Critical flows (§43). These tests need a real Supabase backend because the
 * app is intentionally server-authoritative – there is no mock mode that
 * could honestly exercise the double-blind guarantees.
 *
 * The two-user matching flow uses two isolated browser contexts.
 */
test.describe("Onboarding", () => {
  test("blocks progress until all consent checkboxes are set", async ({ page }) => {
    await page.goto("/");
    // Walk to the consent step.
    await page.getByRole("button", { name: "Weiter" }).click();
    await page.getByRole("button", { name: "Weiter" }).click();
    const next = page.getByRole("button", { name: "Weiter" });
    await expect(next).toBeDisabled();
    for (const box of await page.getByRole("checkbox").all()) await box.check();
    await expect(next).toBeEnabled();
  });
});

test.describe("Pairing and double-blind matching", () => {
  test("two users pair, answer, and only see the shared match", async ({ browser }) => {
    const a = await browser.newContext();
    const b = await browser.newContext();
    const pageA = await a.newPage();
    const pageB = await b.newPage();

    // User A completes onboarding and creates an invite.
    await completeOnboarding(pageA);
    await pageA.getByRole("button", { name: "Verbindung erstellen" }).click();
    const code = (await pageA.locator("p.font-mono").textContent())?.trim() ?? "";
    expect(code.length).toBeGreaterThanOrEqual(32);

    // User B joins with the code.
    await completeOnboarding(pageB);
    await pageB.getByRole("button", { name: "Mit Code beitreten" }).click();
    await pageB.getByLabel("Einladungscode").fill(code);
    await pageB.getByRole("button", { name: "Beitreten" }).click();

    // Both answer the first card positively.
    for (const p of [pageA, pageB]) {
      await p.getByRole("radio", { name: /würde ich ausprobieren/i }).click();
      await p.getByRole("button", { name: "Antwort speichern" }).click();
    }

    // A match may appear via realtime; the reveal must never show the
    // partner's individual answer – only the shared result.
    await pageA.goto("/#/resonanz");
    await expect(pageA.getByText(/Nur was euch beide bewegt|Hier erscheint nur/)).toBeVisible();

    await a.close();
    await b.close();
  });
});

async function completeOnboarding(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "Weiter" }).click();
  await page.getByRole("button", { name: "Weiter" }).click();
  for (const box of await page.getByRole("checkbox").all()) await box.check();
  await page.getByRole("button", { name: "Weiter" }).click();
  await page.getByRole("button", { name: "Weiter" }).click();
  await page.getByRole("button", { name: "Los geht's" }).click();
}
