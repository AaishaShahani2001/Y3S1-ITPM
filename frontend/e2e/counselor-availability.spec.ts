import { expect, test, type Page } from "@playwright/test";

async function seedLoggedInCounselor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        token: "e2e-counselor-token",
        id: 17,
        name: "Dr. E2E Counselor",
        email: "counselor@test.local",
        role: "counselor",
      })
    );
  });
}

async function mockManagePlanApis(page: Page): Promise<void> {
  let plans: Array<{
    id: number;
    appointment_id: number;
    counsellor_id: number;
    counsellor_name: string;
    student_id: number;
    student_name: string;
    title: string;
    description: string;
    status: string;
    steps_data: unknown;
    updated_at: string;
  }> = [];

  await page.route("**/api/counsellor/profile/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        fullName: "Dr. E2E Counselor",
        specialization: "Stress Management",
        profileImage: "",
      }),
    });
  });

  await page.route("**/api/counsellor/location/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ location: "Colombo" }),
    });
  });

  await page.route("**/api/appointments/counselor", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 501,
          student_id: 72,
          student_name: "E2E Student",
          date: "2026-05-05",
          time_slot: "10:00 AM - 11:00 AM",
          mood: "stressed",
          status: "confirmed",
        },
      ]),
    });
  });

  await page.route("**/api/treatment-plans", async (route) => {
    const req = route.request();
    if (req.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(plans),
      });
      return;
    }

    if (req.method() === "POST") {
      const body = req.postDataJSON() as {
        appointment_id: number;
        counsellor_id: number;
        student_id: number;
        title: string;
        description: string;
        status: string;
        steps_data: unknown;
      };

      const created = {
        id: 9001,
        appointment_id: body.appointment_id,
        counsellor_id: body.counsellor_id,
        counsellor_name: "Dr. E2E Counselor",
        student_id: body.student_id,
        student_name: "E2E Student",
        title: body.title,
        description: body.description,
        status: body.status,
        steps_data: body.steps_data,
        updated_at: "2026-05-01T08:00:00.000Z",
      };
      plans = [created];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(created),
      });
      return;
    }

    await route.continue();
  });
}

test("adds treatment plan for an appointment in ManagePlansTab", async ({ page }) => {
  await seedLoggedInCounselor(page);
  await mockManagePlanApis(page);
  await page.goto("/counselor-dashboard");

  await page.getByRole("button", { name: "Manage Treatment Plans" }).click();
  await expect(page.getByText("Treatment Plans Hub")).toBeVisible();

  await page.getByRole("button", { name: /Add Plan/i }).click();
  await expect(page.getByText("Create New Treatment Plan")).toBeVisible();

  const selects = page.locator("select");
  await selects.nth(0).selectOption("501");
  await selects.nth(1).selectOption("Stress Reduction & Breathing Routine");

  await page.getByPlaceholder("e.g. Reduce panic symptoms").fill("Reduce exam-related panic symptoms");
  await selects.nth(2).selectOption("Active");

  await page.getByPlaceholder("Step title").nth(0).fill("Breathing reset");
  await page.getByPlaceholder("Step title").nth(1).fill("Thought journaling");
  await page.getByPlaceholder("Step title").nth(2).fill("Time-block planning");
  await page.getByPlaceholder("Step title").nth(3).fill("Weekly review");

  await page
    .getByPlaceholder("Instructions / notes for the student")
    .nth(0)
    .fill("Practice 4-7-8 breathing each morning for 10 minutes.");
  await page
    .getByPlaceholder("Instructions / notes for the student")
    .nth(1)
    .fill("Write stress triggers and alternate balanced thoughts.");
  await page
    .getByPlaceholder("Instructions / notes for the student")
    .nth(2)
    .fill("Create daily 2-hour focused study blocks.");
  await page
    .getByPlaceholder("Instructions / notes for the student")
    .nth(3)
    .fill("Review progress and blockers every Sunday.");

  await page.getByPlaceholder("Morning routine...").fill("Wake at 6:30 AM, hydrate, 10-minute breathwork.");
  await page.getByPlaceholder("Books, articles...").fill("Read one anxiety-management article daily.");
  await page.getByPlaceholder("Physical activities...").fill("30-minute walk, 5 days per week.");

  await page.getByRole("button", { name: "Generate & Publish Plan" }).click();
  await expect(page.getByText("Treatment plan added successfully!")).toBeVisible();

  await expect(page.getByText("E2E Student")).toBeVisible();
  await expect(page.getByText("Reduce exam-related panic symptoms")).toBeVisible();
});