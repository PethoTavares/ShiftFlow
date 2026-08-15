import { expect, test, type Page } from "@playwright/test";

const managerEmail = "manager@shiftflow.dev";
const seededPassword = "DevelopmentPassword123!";

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

test("manager creates employee, event, shift, assigns employee, and employee sees the assignment", async ({ page }) => {
  const unique = Date.now();
  const sidebar = page.locator("aside");
  const employeeName = `E2E Employee ${unique}`;
  const employeeEmail = `e2e.employee.${unique}@shiftflow.dev`;
  const employeePassword = "DevelopmentPassword123!";
  const eventName = `E2E Event ${unique}`;
  const shiftTitle = `E2E Shift ${unique}`;

  await signIn(page, managerEmail, seededPassword);
  await expect(page.getByRole("heading", { name: "Operations dashboard" })).toBeVisible();

  await sidebar.getByRole("link", { name: "Employees", exact: true }).click();
  await page.getByRole("link", { name: "New employee" }).click();
  await page.getByLabel("Full name").fill(employeeName);
  await page.getByLabel("Email").fill(employeeEmail);
  await page.getByLabel("Phone").fill("2065550123");
  await page.getByLabel("Temporary password").fill(employeePassword);
  await page.getByRole("button", { name: "Create employee" }).click();
  await expect(page.getByText("Employee created successfully.")).toBeVisible();

  await sidebar.getByRole("link", { name: "Events", exact: true }).click();
  await page.getByRole("link", { name: "New event" }).click();
  await page.getByLabel("Name").fill(eventName);
  await page.getByLabel("Location").fill("Seattle Center");
  await page.getByLabel("Start date").fill("2026-08-28T08:00");
  await page.getByLabel("End date").fill("2026-08-28T18:00");
  await page.getByRole("button", { name: "Create event" }).click();
  await expect(page.getByText("Event created successfully.")).toBeVisible();

  await sidebar.getByRole("link", { name: "Shifts", exact: true }).click();
  await page.getByRole("link", { name: "New shift" }).click();
  await page.getByLabel("Event").selectOption({ label: eventName });
  await page.getByLabel("Title").fill(shiftTitle);
  await page.getByLabel("Start time").fill("2026-08-28T09:00");
  await page.getByLabel("End time").fill("2026-08-28T13:00");
  await page.getByLabel("Required workers").fill("1");
  await page.getByRole("button", { name: "Create shift" }).click();
  await expect(page.getByText("Shift created successfully.")).toBeVisible();
  await page.getByRole("link", { name: shiftTitle, exact: true }).click();

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

  await employeeSelect.selectOption(employeeOptionValue);
  await page.getByRole("button", { name: "Assign employee" }).click();
  await expect(page.getByText("That employee is already assigned to this shift.")).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in(?:\?.*)?$/, { timeout: 15_000 });

  await signIn(page, employeeEmail, employeePassword);
  await expect(page.getByRole("heading", { name: "My dashboard" })).toBeVisible();
  await expect(page.getByText(shiftTitle).first()).toBeVisible();

  await page.goto("/employees");
  await expect(page).toHaveURL(/\/dashboard/);
});
