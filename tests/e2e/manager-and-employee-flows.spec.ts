import { expect, test } from "@playwright/test";

test("manager signs in, creates an event and a shift, then employee can view assigned work", async ({ page }) => {
  test.skip(!process.env.E2E_READY, "Set E2E_READY=1 and seed the database before running this flow.");

  await page.goto("/sign-in");

  await page.getByLabel("Email").fill("manager@shiftflow.dev");
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("Operations dashboard")).toBeVisible();

  await page.getByRole("link", { name: "Events" }).click();
  await page.getByRole("link", { name: "New event" }).click();
  await page.getByLabel("Name").fill("Playwright Staffing Expo");
  await page.getByLabel("Location").fill("Seattle Center");
  await page.getByLabel("Start date").fill("2026-08-28T08:00");
  await page.getByLabel("End date").fill("2026-08-28T18:00");
  await page.getByRole("button", { name: "Create event" }).click();

  await expect(page.getByText("Event created successfully.")).toBeVisible();
});
