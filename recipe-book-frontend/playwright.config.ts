/// <reference types="node" />

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './system-tests/tests',
    timeout: 30_000,
    expect: {
        timeout: 5_000
    },
    fullyParallel: false,
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: 0,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ]
});