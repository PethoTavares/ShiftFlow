import { expect, test, type Page } from "@playwright/test";

const managerEmail = "manager@shiftflow.dev";
const seededPassword = "DevelopmentPassword123!";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function signIn(page: Page, email: string, password: string) {
  if (!page.url().includes("/sign-in")) {
    await page.goto("/sign-in");
  }

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/, { timeout: 15_000 });
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in(?:\?.*)?$/, { timeout: 15_000 });
}

test("cancelled shifts disappear from the employee upcoming experience", async ({ page }) => {
  const unique = Date.now();
  const sidebar = page.locator("aside");
  const employeeName = `Cancel Flow Employee ${unique}`;
  const employeeEmail = `cancel.employee.${unique}@shiftflow.dev`;
  const eventName = `Cancel Flow Event ${unique}`;
  const shiftTitle = `Cancel Flow Shift ${unique}`;

  await signIn(page, managerEmail, seededPassword);

  await sidebar.getByRole("link", { name: "Employees", exact: true }).click();
  await page.getByRole("link", { name: "New employee" }).click();
  await page.getByLabel("Full name").fill(employeeName);
  await page.getByLabel("Email").fill(employeeEmail);
  await page.getByLabel("Phone").fill("2065550199");
  await page.getByLabel("Temporary password").fill(seededPassword);
  await page.getByRole("button", { name: "Create employee" }).click();
  await expect(page.getByText("Employee created successfully.")).toBeVisible();

  await sidebar.getByRole("link", { name: "Events", exact: true }).click();
  await page.getByRole("link", { name: "New event" }).click();
  await page.getByLabel("Name").fill(eventName);
  await page.getByLabel("Location").fill("Seattle Convention Center");
  await page.getByLabel("Start date").fill("2026-08-30T08:00");
  await page.getByLabel("End date").fill("2026-08-30T18:00");
  await page.getByRole("button", { name: "Create event" }).click();
  await expect(page.getByText("Event created successfully.")).toBeVisible();

  await sidebar.getByRole("link", { name: "Shifts", exact: true }).click();
  await page.getByRole("link", { name: "New shift" }).click();
  await page.getByLabel("Event").selectOption({ label: eventName });
  await page.getByLabel("Title").fill(shiftTitle);
  await page.getByLabel("Start time").fill("2026-08-30T09:00");
  await page.getByLabel("End time").fill("2026-08-30T13:00");
  await page.getByLabel("Required workers").fill("1");
  await page.getByRole("button", { name: "Create shift" }).click();
  await expect(page.getByText("Shift created successfully.")).toBeVisible();
  await page.getByRole("link", { name: new RegExp(`^${escapeRegExp(shiftTitle)}`) }).click();

  const employeeSelect = page.getByLabel("Employee", { exact: true });
  const employeeOptionValue = await employeeSelect.evaluate((select, email) => {
    const option = Array.from((select as HTMLSelectElement).options).find((candidate) => candidate.text.includes(email));

    if (!option) {
      throw new Error(`Employee option not found for ${email}`);
    }

    return option.value;
  }, employeeEmail);

  await employeeSelect.selectOption(employeeOptionValue);
  await page.getByRole("button", { name: "Assign employee" }).click();
  await expect(page.getByText("Employee assigned successfully.")).toBeVisible();

  await signOut(page);

  await signIn(page, employeeEmail, seededPassword);
  await expect(page.getByRole("heading", { name: "My dashboard" })).toBeVisible();
  await expect(page.getByText(shiftTitle).first()).toBeVisible();
  await page.getByRole("link", { name: "Schedule", exact: true }).click();
  await expect(page.getByText(shiftTitle).first()).toBeVisible();

  await signOut(page);

  await signIn(page, managerEmail, seededPassword);
  await page.goto("/shifts");
  await page.getByRole("link", { name: new RegExp(`^${escapeRegExp(shiftTitle)}`) }).click();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Cancel shift" }).click();
  await expect(page.getByText("Shift cancelled.")).toBeVisible();

  await signOut(page);

  await signIn(page, employeeEmail, seededPassword);
  await expect(page.getByRole("heading", { name: "My dashboard" })).toBeVisible();
  await expect(page.getByText(shiftTitle)).toHaveCount(0);
  await page.getByRole("link", { name: "Schedule", exact: true }).click();
  await expect(page.getByText(shiftTitle)).toHaveCount(0);
});
