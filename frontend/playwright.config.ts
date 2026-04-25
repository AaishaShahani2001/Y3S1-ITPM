import { defineConfig, devices } from "@playwright/test";

const devPort = process.env.PW_PORT === "5174" ? "5174" : "5173";
const baseURL = `http://localhost:${devPort}`;

/**
 * Playwright runs against the Vite dev server. BookAppointment calls the API at
 * http://localhost:3000; e2e tests mock those URLs with page.route().
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
