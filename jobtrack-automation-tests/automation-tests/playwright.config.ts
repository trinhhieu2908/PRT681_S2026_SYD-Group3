import { defineConfig, devices } from "@playwright/test";

/**
 * JobTrack automation suite.
 *  - "api" project: black-box tests against the ASP.NET Core API (no browser).
 *  - "ui"  project: end-to-end tests that drive the React frontend in Chromium.
 *
 * Both expect the backend (http://localhost:5100) and frontend (http://localhost:5173)
 * to already be running. Override with FRONTEND_URL / API_URL environment variables.
 */
export const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
export const API_URL = (process.env.API_URL ?? "http://localhost:5100/api").replace(/\/$/, "");

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  // The Vite dev server compiles pages on demand; too many parallel browsers on a
  // slow machine cause load timeouts. Override with --workers=N.
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],
  use: {
    baseURL: FRONTEND_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "api", testDir: "./tests/api" },
    { name: "ui", testDir: "./tests/ui", use: { ...devices["Desktop Chrome"] } },
  ],
});
