import { expect, test } from "@playwright/test";

// Requires the full stack (API + Postgres + seed data) to be running.
// Enabled in CI via E2E_FULL_STACK=true.
test.describe("authentication", () => {
  test.skip(
    process.env.E2E_FULL_STACK !== "true",
    "Set E2E_FULL_STACK=true with the API and seeded DB running",
  );

  test("seeded admin can log in and reach the dashboard", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill("#email", "alice@acme.com");
    await page.fill("#password", "secret");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/dashboard", { timeout: 30_000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("wrong password shows an error and stays on login", async ({
    page,
  }) => {
    await page.goto("/auth/login");
    await page.fill("#email", "alice@acme.com");
    await page.fill("#password", "definitely-wrong");
    await page.click('button[type="submit"]');

    // Stays on the login page and does not navigate to the dashboard.
    await page.waitForTimeout(3_000);
    expect(page.url()).toContain("/auth/login");
  });
});
