import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

// Detect if running in Docker/Cloud environment
const isDocker =
	process.env.DOCKER === 'true' ||
	process.env.CF_INSTANCE_INDEX !== undefined;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: './tests',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		['html'],
		['list'],
		['junit', { outputFile: 'test-results/junit.xml' }],
	],
	/* Maximum time one test can run for */
	timeout: 60 * 1000,
	/* Expect timeout */
	expect: {
		timeout: 10 * 1000,
	},
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL:
			process.env.BASE_URL ||
			'https://jsapps.c3ntdqbuek-citizenwa1-s1-public.model-t.cc.commerce.ondemand.com',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',

		/* Screenshot on failure */
		screenshot: 'only-on-failure',

		/* Video for all tests */
		video: 'on',

		/* Action timeout */
		actionTimeout: 15 * 1000,

		/* Navigation timeout */
		navigationTimeout: 30 * 1000,

		/* Force headless mode in Docker/Cloud environments */
		...(isDocker && { headless: true }),

		/* Browser launch options for Docker/Cloud environments */
		...(isDocker && {
			launchOptions: {
				args: [
					'--disable-dev-shm-usage',
					'--no-sandbox',
					'--disable-setuid-sandbox',
					'--disable-gpu',
				],
			},
		}),
	},

	/* Configure projects for major browsers */
	projects: [
		// All tests - default project for UI mode
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},

		// Critical checkout test (for CI/CD)
		{
			name: 'checkout-critical',
			testMatch: '**/smoke/checkout-flow.spec.ts',
			retries: 0,
			use: { ...devices['Desktop Chrome'] },
		},

		// Smoke tests without critical checkout test (for CI/CD)
		{
			name: 'smoke',
			testMatch: '**/smoke/*.spec.ts',
			testIgnore: '**/smoke/checkout-flow.spec.ts',
			retries: 0,
			use: { ...devices['Desktop Chrome'] },
		},

		// Feature tests (for CI/CD)
		{
			name: 'feature',
			testMatch: '**/feature/*.spec.ts',
			retries: 0,
			use: { ...devices['Desktop Chrome'] },
		},

		// Visual tests (for CI/CD)
		{
			name: 'visual',
			testMatch: '**/visual/*.spec.ts',
			use: { ...devices['Desktop Chrome'] },
		},

		// {
		//   name: 'firefox',
		//   use: { ...devices['Desktop Firefox'] },
		// },

		// {
		//   name: 'webkit',
		//   use: { ...devices['Desktop Safari'] },
		// },

		/* Test against mobile viewports. */
		// {
		//   name: 'Mobile Chrome',
		//   use: { ...devices['Pixel 5'] },
		// },
		// {
		//   name: 'Mobile Safari',
		//   use: { ...devices['iPhone 12'] },
		// },

		/* Test against branded browsers. */
		// {
		//   name: 'Microsoft Edge',
		//   use: { ...devices['Desktop Edge'], channel: 'msedge' },
		// },
		// {
		//   name: 'Google Chrome',
		//   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
		// },
	],

	/* Run your local dev server before starting the tests */
	// webServer: {
	//   command: 'npm run start',
	//   url: 'http://localhost:3000',
	//   reuseExistingServer: !process.env.CI,
	// },
});
