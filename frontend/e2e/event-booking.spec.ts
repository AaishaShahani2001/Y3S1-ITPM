import { expect, test, type Page } from "@playwright/test";

type RegistrationPayload = {
  event_id: number;
  name: string;
  email: string;
  phone: string;
  university: string;
  faculty: string;
  level: string;
  degree: string;
  gender: string;
};

async function mockEventApis(page: Page) {
  let capturedPayload: RegistrationPayload | null = null;
  let capturedAuthorization = "";

  await page.route("**/api/events/1", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ID: 1,
        Title: "MindBridge Workshop",
        Location: "Main Hall",
        Date: "2026-06-15",
        Image: "",
      }),
    });
  });

  await page.route("**/api/events/register", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    capturedAuthorization = route.request().headers().authorization ?? "";
    capturedPayload = route.request().postDataJSON() as RegistrationPayload;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "ok" }),
    });
  });

  return {
    getCapturedPayload: () => capturedPayload,
    getCapturedAuthorization: () => capturedAuthorization,
  };
}

async function seedLoggedInStudent(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        token: "e2e-event-token",
        id: 1,
        name: "Event Student",
      })
    );
  });
}

async function fillValidRegistrationForm(page: Page): Promise<void> {
  const registrationForm = page.locator("form").filter({
    has: page.getByPlaceholder("Full Name"),
  });

  await registrationForm.getByPlaceholder("Full Name").fill("Test Student");
  await registrationForm.getByPlaceholder("Email").fill("student@test.local");
  await registrationForm.getByPlaceholder("Mobile Number").fill("0771234567");
  await registrationForm.getByPlaceholder("University Name").fill("MindBridge University");
  await registrationForm.locator('select[name="faculty"]').selectOption("Computing");
  await registrationForm.getByLabel("Undergraduate").check();
  await registrationForm.getByPlaceholder("Degree Programme").fill("BSc in Software Engineering");
  await registrationForm.getByLabel("Female").check();
  await registrationForm.locator('input[name="agree"]').check();
}

test.describe("Event booking registration", () => {
  test("shows login error when user is not authenticated", async ({ page }) => {
    await mockEventApis(page);
    await page.goto("/register-event/1");

    await page.getByRole("button", { name: "Confirm Registration" }).click();

    await expect(page.getByText("User not logged in")).toBeVisible();
  });

  test("validates email format before submit", async ({ page }) => {
    await seedLoggedInStudent(page);
    await mockEventApis(page);
    await page.goto("/register-event/1");

    await fillValidRegistrationForm(page);
    await page.locator('form input[name="email"]').fill("not-an-email");
    await page.getByRole("button", { name: "Confirm Registration" }).click();

    await expect(page.getByText("Enter a valid email address")).toBeVisible();
  });

  test("requires other faculty text when faculty is Other", async ({ page }) => {
    await seedLoggedInStudent(page);
    await mockEventApis(page);
    await page.goto("/register-event/1");

    await fillValidRegistrationForm(page);
    await page.locator('select[name="faculty"]').selectOption("Other");
    await page.getByRole("button", { name: "Confirm Registration" }).click();

    await expect(page.getByText("Please enter your faculty")).toBeVisible();
  });

  test("submits registration and shows success state", async ({ page }) => {
    await seedLoggedInStudent(page);
    const registrationSpy = await mockEventApis(page);
    await page.goto("/register-event/1");

    await fillValidRegistrationForm(page);
    await page.getByRole("button", { name: "Confirm Registration" }).click();

    await expect(page.getByText("🎉 Registration Successful!")).toBeVisible();

    await expect.poll(registrationSpy.getCapturedAuthorization).toBe("Bearer e2e-event-token");
    await expect.poll(registrationSpy.getCapturedPayload).toEqual({
      event_id: 1,
      name: "Test Student",
      email: "student@test.local",
      phone: "0771234567",
      university: "MindBridge University",
      faculty: "Computing",
      level: "Undergraduate",
      degree: "BSc in Software Engineering",
      gender: "Female",
    });
  });
});
