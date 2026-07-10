import { defineConfig, devices } from "@playwright/test";

/**
 * Investor-demo smoke tests. Run with:
 *   bunx playwright test
 * Dev server on http://localhost:8080 must be running (vite dev).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: process.env.PW_CHROMIUM_EXECUTABLE
          ? { executablePath: process.env.PW_CHROMIUM_EXECUTABLE }
          : undefined,
      },
    },
  ],
});
