import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 45_000,
  workers: 2,
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  use: { baseURL: process.env.DEMO_URL || "http://127.0.0.1:5186", headless: true, trace: "retain-on-failure" },
  webServer: process.env.DEMO_URL ? undefined : { command: process.env.BUILT_PREVIEW ? "npx vite preview --host 127.0.0.1 --port 5186 --strictPort" : "VITE_TEST=1 npx vite --host 127.0.0.1 --port 5186 --strictPort", url: "http://127.0.0.1:5186", reuseExistingServer: false },
});
