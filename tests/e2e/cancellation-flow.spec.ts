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

test("cancelled shifts disappear from the employee upcoming experience", async ({ browser }) => {
  const unique = Date.now();
  const employeeName = `Cancel Flow Employee ${unique}`;
  const employeeEmail = `cancel.employee.${unique}@shiftflow.dev`;
  const eventName = `Cancel Flow Event ${unique}`;
  const shiftTitle = `Cancel Flow Shift ${unique}`;

  const managerContext = await browser.newContext();
  const employeeContext = await browser.newContext();
  const managerPage = await managerContext.newPage();
  const employeePage = await employeeContext.newPage();
  const sidebar = managerPage.locator("aside");

  await signIn(managerPage, managerEmail, seededPassword);

  await sidebar.getByRole("link", { name: "Employees", exact: true }).click();
  await managerPage.getByRole("link", { name: "New employee" }).click();
  await managerPage.getByLabel("Full name").fill(employeeName);
  await managerPage.getByLabel("Email").fill(employeeEmail);
  await managerPage.getByLabel("Phone").fill("2065550199");
  await managerPage.getByLabel("Temporary password").fill(seededPassword);
  await managerPage.getByRole("button", { name: "Create employee" }).click();
  await expect(managerPage.getByText("Employee created successfully.")).toBeVisible();

  await sidebar.getByRole("link", { name: "Events", exact: true }).click();
  await managerPage.getByRole("link", { name: "New event" }).click();
  await managerPage.getByLabel("Name").fill(eventName);
  await managerPage.getByLabel("Location").fill("Seattle Convention Center");
  await managerPage.getByLabel("Start date").fill("2026-08-30T08:00");
  await managerPage.getByLabel("End date").fill("2026-08-30T18:00");
  await managerPage.getByRole("button", { name: "Create event" }).click();
  await expect(managerPage.getByText("Event created successfully.")).toBeVisible();

  await sidebar.getByRole("link", { name: "Shifts", exact: true }).click();
  await managerPage.getByRole("link", { name: "New shift" }).click();
  await managerPage.getByLabel("Event").selectOption({ label: eventName });
  await managerPage.getByLabel("Title").fill(shiftTitle);
  await managerPage.getByLabel("Start time").fill("2026-08-30T09:00");
  await managerPage.getByLabel("End time").fill("2026-08-30T13:00");
  await managerPage.getByLabel("Required workers").fill("1");
  await managerPage.getByRole("button", { name: "Create shift" }).click();
  await expect(managerPage.getByText("Shift created successfully.")).toBeVisible();
  await managerPage.getByRole("link", { name: new RegExp(`^${escapeRegExp(shiftTitle)}`) }).click();

  const employeeSelect = managerPage.getByLabel("Employee", { exact: true });
  const employeeOptionValue = await employeeSelect.evaluate((select, email) => {
    const option = Array.from((select as HTMLSelectElement).options).find((candidate) => candidate.text.includes(email));

    if (!option) {
      throw new Error(`Employee option not found for ${email}`);
    }

    return option.value;
  }, employeeEmail);

  await employeeSelect.selectOption(employeeOptionValue);
  await managerPage.getByRole("button", { name: "Assign employee" }).click();
  await expect(managerPage.getByText("Employee assigned successfully.")).toBeVisible();

  await signIn(employeePage, employeeEmail, seededPassword);
  await expect(employeePage.getByRole("heading", { name: "My dashboard" })).toBeVisible();
  await expect(employeePage.getByText(shiftTitle).first()).toBeVisible();
  await employeePage.getByRole("link", { name: "Schedule", exact: true }).click();
  await expect(employeePage.getByText(shiftTitle).first()).toBeVisible();

  await managerPage.goto("/shifts");
  await managerPage.getByRole("link", { name: new RegExp(`^${escapeRegExp(shiftTitle)}`) }).click();

  const dialogPromise = managerPage.waitForEvent("dialog");
  await Promise.all([
    dialogPromise.then((dialog) => dialog.accept()),
    managerPage.getByRole("button", { name: "Cancel shift" }).click(),
  ]);
  await expect(managerPage.getByText("CANCELLED", { exact: true })).toBeVisible();

  await employeePage.goto("/dashboard");
  await expect(employeePage.getByRole("heading", { name: "My dashboard" })).toBeVisible();
  await expect(employeePage.getByText(shiftTitle)).toHaveCount(0);
  await employeePage.getByRole("link", { name: "Schedule", exact: true }).click();
  await expect(employeePage.getByText(shiftTitle)).toHaveCount(0);
});
