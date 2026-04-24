import { expect, test, type Page } from "@playwright/test";

function futureIsoDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function seedLoggedInUser(page: Page, role = "counselor"): Promise<void> {
  await page.addInitScript((r) => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        token: "e2e-token",
        id: 17,
        name: "E2E Counselor",
        email: "counselor-e2e@test.local",
        role: r,
      })
    );
  }, role);
}

async function mockCounsellorDirectoryApis(page: Page): Promise<void> {
  await page.route("**/api/counsellor/all", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 17,
          fullName: "Dr. E2E Counselor",
          specialization: "Stress Management",
          experience: 6,
          workplace: "MindBridge Wellness",
          about: "E2E profile",
          profileImage: "",
        },
      ]),
    });
  });

  await page.route("**/api/counsellor/apply", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Application submitted" }),
    });
  });
}

async function mockDashboardApis(page: Page, date: string): Promise<void> {
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

  await page.route("**/api/appointments/counselor", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/counsellor/location/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ location: "Colombo" }),
    });
  });

  await page.route("**/api/counsellor/availability/17", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 1,
          date,
          startTime: "10:00",
          endTime: "11:00",
        },
      ]),
    });
  });

  await page.route("**/api/counsellor/availability", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    const body = route.request().postDataJSON() as {
      date: string;
      startTime: string;
      endTime: string;
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 200,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
      }),
    });
  });
}

test.describe("Counselor onboarding and availability", () => {
  test.beforeEach(async ({ page }) => {
    await seedLoggedInUser(page);
  });

  test("BecomeCounsellorModal: fills all steps and submits application", async ({ page }) => {
    await mockCounsellorDirectoryApis(page);
    await page.goto("/counsellors");

    await page.getByRole("button", { name: "Become a Counsellor" }).click();
    await expect(page.getByText("Join Our Expert Team")).toBeVisible();

    await page.getByPlaceholder("Dr. Jane Doe").fill("Jane Doe");
    await page.getByPlaceholder("jane@university.edu").fill("jane.doe@test.local");
    await page.getByPlaceholder("+94 77 123 4567").fill("0771234567");
    await page.getByPlaceholder("A short sentence about your expertise...").fill(
      "I provide student counseling."
    );
    await page.getByRole("button", { name: /Next Step/i }).click();

    await page.locator("select").first().selectOption("Stress Management");
    await page.getByPlaceholder("e.g. SLMC-123456").fill("SLMC-123456");
    await page.getByPlaceholder("e.g. Ph.D. in Clinical Psychology").fill("Clinical Psychology");
    await page.getByPlaceholder("5", { exact: true }).fill("5");
    await page.getByPlaceholder("University Wellness Center").fill("University Wellness Center");
    await page.getByRole("button", { name: /Next Step/i }).click();

    const nicFile = page.locator('input[type="file"]').nth(0);
    const certFiles = page.locator('input[type="file"]').nth(1);
    await nicFile.setInputFiles({
      name: "nic-front.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake image"),
    });
    await certFiles.setInputFiles([
      {
        name: "cert-1.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("fake certificate 1"),
      },
      {
        name: "cert-2.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("fake certificate 2"),
      },
    ]);

    await page.getByRole("button", { name: /Submit Application/i }).click();
    await expect(page.getByText("Application Received!")).toBeVisible();
  });

  test("AvailabilityTab: adds a new availability slot", async ({ page }) => {
    const targetDate = futureIsoDate(20);
    await mockDashboardApis(page, targetDate);
    await page.goto("/counselor-dashboard");

    await page.getByRole("button", { name: "Manage Availability" }).click();
    await expect(page.getByText("Availability Settings")).toBeVisible();

    await page.locator('input[type="date"]').first().fill(targetDate);
    await page.locator('input[type="time"]').nth(0).fill("13:00");
    await page.locator('input[type="time"]').nth(1).fill("14:00");
    await page.getByRole("button", { name: "Authorize Schedule Slot" }).click();

    await expect(page.getByText("1 slot(s) added successfully")).toBeVisible();
  });
});