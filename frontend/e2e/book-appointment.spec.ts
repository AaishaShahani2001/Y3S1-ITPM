import { expect, test, type Page } from "@playwright/test";

// --- Mocks & helpers (BookAppointment → http://localhost:3000; use `**/api/...` for IPv4/IPv6) ---

/** Mirrors `ValidCategories` in `backend/controllers/moodController.go`. */
const MOOD_CONTROLLER_CATEGORIES = [
  "Academic Support",
  "Career Guidance",
  "Mental Health Specialist",
  "Emotional Regulation Expert",
  "Stress Management",
] as const;

type MoodAnalyzeResponse = { mood: string; suggest: string; urgency: number };

function futureIsoDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type MockBookingApisOptions = {
  analyze?: MoodAnalyzeResponse;
  counsellorUserId?: string;
  availabilityDate?: string;
};

async function mockBookingApis(
  page: Page,
  opts: MockBookingApisOptions = {}
): Promise<{ counsellorUserId: string; availabilityDate: string; analyze: MoodAnalyzeResponse }> {
  const analyze: MoodAnalyzeResponse = opts.analyze ?? {
    mood: "stressed",
    suggest: "Stress Management",
    urgency: 7,
  };
  const counsellorUserId = opts.counsellorUserId ?? "1";
  const availabilityDate = opts.availabilityDate ?? futureIsoDate(30);

  await page.route("**/api/mood/analyze", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(analyze),
    });
  });

  await page.route("**/api/counsellor/all", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          userId: Number(counsellorUserId),
          id: 99,
          fullName: "Dr. E2E Counselor",
          specialization: analyze.suggest,
          experience: 5,
          workplace: "Wellness Center W101",
          profileImage: "",
        },
      ]),
    });
  });

  await page.route(`**/api/counsellor/availability/${counsellorUserId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: 1, date: availabilityDate, startTime: "10:00", endTime: "11:00" },
      ]),
    });
  });

  await page.route("**/api/appointments/booked-slots**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ bookedSlots: [] }),
    });
  });

  await page.route("**/api/appointments/create", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { id: 1 }, message: "created" }),
    });
  });

  return { counsellorUserId, availabilityDate, analyze };
}

async function seedLoggedInStudent(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        token: "e2e-test-token",
        name: "E2E Student",
        email: "e2e-student@test.local",
        id: 1,
      })
    );
  });
}

async function selectMockedCounsellor(page: Page): Promise<void> {
  await page.getByText("Dr. E2E Counselor").click();
}

async function pickFirstDateAndSlot(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: /\w{3} \d{1,2}, (Mon|Tue|Wed|Thu|Fri|Sat|Sun)/ })
    .first()
    .click();
  await page
    .getByRole("button", { name: /\d{1,2}:\d{2} (AM|PM) - \d{1,2}:\d{2} (AM|PM)/ })
    .first()
    .click();
}

// --- Tests: `/book-appointment` (BookAppointment.jsx) ---
// Step-4 field rules live in `computeStep4Errors` (age, LK phones, notes length, file type/size).

test.describe("Counselling appointment booking", () => {
  test.beforeEach(async ({ page }) => {
    await seedLoggedInStudent(page);
  });

  test.describe("Validations (validateStep1, validateStep3, computeStep4Errors)", () => {
    test("step 1: empty description → “Description is required”", async ({ page }) => {
      await mockBookingApis(page);
      await page.goto("/book-appointment");
      await page.getByRole("button", { name: "Stressed" }).click();
      await page.getByPlaceholder(/Describe your situation/i).fill("");
      await page.getByRole("button", { name: /Analyze Mood/i }).click();
      await expect(page.getByText("Description is required")).toBeVisible();
    });

    test("step 1: short description → “Minimum 10 characters required”", async ({ page }) => {
      await mockBookingApis(page);
      await page.goto("/book-appointment");
      await page.getByRole("button", { name: "Happy" }).click();
      await page.getByPlaceholder(/Describe your situation/i).fill("short");
      await page.getByRole("button", { name: /Analyze Mood/i }).click();
      await expect(page.getByText("Minimum 10 characters required")).toBeVisible();
    });

    test("step 1: Analyze disabled until a mood is selected", async ({ page }) => {
      await mockBookingApis(page);
      await page.goto("/book-appointment");
      await page
        .getByPlaceholder(/Describe your situation/i)
        .fill("Ten chars ok description text here");
      await expect(page.getByRole("button", { name: /Analyze Mood/i })).toBeDisabled();
    });

    test("step 1: over 300 characters → “Maximum 300 characters allowed”", async ({ page }) => {
      await mockBookingApis(page);
      await page.goto("/book-appointment");
      await page.getByRole("button", { name: "Neutral" }).click();
      await page.getByPlaceholder(/Describe your situation/i).fill("a".repeat(301));
      await page.getByRole("button", { name: /Analyze Mood/i }).click();
      await expect(page.getByText("Maximum 300 characters allowed")).toBeVisible();
    });

    test("step 3: Continue disabled until date and slot are selected", async ({ page }) => {
      await mockBookingApis(page);
      await page.goto("/book-appointment");
      await page.getByRole("button", { name: "Sad" }).click();
      await page
        .getByPlaceholder(/Describe your situation/i)
        .fill("I feel sad and need support from counseling today.");
      await page.getByRole("button", { name: /Analyze Mood/i }).click();
      await selectMockedCounsellor(page);
      await page.getByRole("button", { name: /Select Scheduling Slots/i }).click();

      const continueBtn = page.getByRole("button", { name: /Continue to Summary/i });
      await expect(continueBtn).toBeDisabled();
      await pickFirstDateAndSlot(page);
      await expect(continueBtn).toBeEnabled();
    });

    test("step 4: review shows counselor, date, and confirm action", async ({ page }) => {
      await mockBookingApis(page);
      await page.goto("/book-appointment");

      await page.getByRole("button", { name: "Sad" }).click();
      await page
        .getByPlaceholder(/Describe your situation/i)
        .fill("I feel sad and need support today from counseling.");
      await page.getByRole("button", { name: /Analyze Mood/i }).click();
      await selectMockedCounsellor(page);
      await page.getByRole("button", { name: /Select Scheduling Slots/i }).click();
      await pickFirstDateAndSlot(page);
      await page.getByRole("button", { name: /Continue to Summary/i }).click();

      await expect(page.getByRole("heading", { name: /Review & Finalize/i })).toBeVisible();
      await expect(page.getByText("Dr. E2E Counselor")).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Confirm (Appointment|Booking)/i })
      ).toBeVisible();
    });
  });

  test.describe("Mood recommendation (moodController ValidCategories)", () => {
    for (const category of MOOD_CONTROLLER_CATEGORIES) {
      test(`step 2: heading shows “You need ${category}” when analyze returns it`, async ({
        page,
      }) => {
        await mockBookingApis(page, {
          analyze: { mood: "neutral", suggest: category, urgency: 5 },
        });

        await page.goto("/book-appointment");
        await page.getByRole("button", { name: "Neutral" }).click();
        await page
          .getByPlaceholder(/Describe your situation/i)
          .fill(`Testing recommendation display for ${category} category here.`);
        await page.getByRole("button", { name: /Analyze Mood/i }).click();

        await expect(page.getByRole("heading", { name: `You need ${category}` })).toBeVisible();
      });
    }

    test("recommended specialist list matches mocked specialization", async ({ page }) => {
      await mockBookingApis(page, {
        analyze: { mood: "sad", suggest: "Mental Health Specialist", urgency: 6 },
      });
      await page.goto("/book-appointment");
      await page.getByRole("button", { name: "Sad" }).click();
      await page
        .getByPlaceholder(/Describe your situation/i)
        .fill("I feel down and need someone to talk to about my mood.");
      await page.getByRole("button", { name: /Analyze Mood/i }).click();

      await expect(page.getByText(/Recommended Specialists \(Mental Health Specialist\)/)).toBeVisible();
      await expect(page.getByText("Dr. E2E Counselor")).toBeVisible();
      await selectMockedCounsellor(page);
      await page.getByRole("button", { name: /Select Scheduling Slots/i }).click();
      await pickFirstDateAndSlot(page);
      await page.getByRole("button", { name: /Continue to Summary/i }).click();
      await expect(page.getByText("Mental Health Specialist")).toBeVisible();
    });
  });

  test("full flow: confirm appointment reaches success (mocked APIs)", async ({ page }) => {
    await mockBookingApis(page, {
      analyze: { mood: "stressed", suggest: "Stress Management", urgency: 7 },
    });

    await page.goto("/book-appointment");

    await page.getByRole("button", { name: "Stressed" }).click();
    await page
      .getByPlaceholder(/Describe your situation/i)
      .fill("I am stressed about exams and deadlines and need support.");
    await page.getByRole("button", { name: /Analyze Mood/i }).click();

    await expect(page.getByRole("heading", { name: /You need Stress Management/i })).toBeVisible();

    await selectMockedCounsellor(page);
    await page.getByRole("button", { name: /Select Scheduling Slots/i }).click();
    await pickFirstDateAndSlot(page);
    await page.getByRole("button", { name: /Continue to Summary/i }).click();

    await page.getByPlaceholder("Age").fill("21");
    await page.getByPlaceholder("07XXXXXXXX").first().fill("0771234567");
    await page.getByPlaceholder("07XXXXXXXX").nth(1).fill("0779876543");

    await page.getByRole("button", { name: /Confirm (Appointment|Booking)/i }).click();

    await expect(page.getByRole("heading", { name: /Appointment Secured!/i })).toBeVisible();
    await expect(page.getByText(/Dr\. E2E Counselor/)).toBeVisible();
  });
});
