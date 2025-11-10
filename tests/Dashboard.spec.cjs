// tests/Dashboard.spec.cjs
const dotenv = require('dotenv');
dotenv.config();

const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
require('chromedriver');

const APP_URL = 'http://localhost:5173';
const DEFAULT_TIMEOUT = 15000;

// Get JWT token from .env or fallback mock
const tokenFromEnv = process.env.VITE_USER_TOKEN;
const MOCK_TOKEN = 'mock-test-token-12345';
const TOKEN = tokenFromEnv && tokenFromEnv.length ? tokenFromEnv : MOCK_TOKEN;

describe('Dashboard Component Tests (with JWT auth)', function () {
    this.timeout(60000);
    let driver;

    before(async () => {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.get(APP_URL);

        // 1️⃣ Inject JWT token before running dashboard tests
        await driver.executeScript('localStorage.setItem("token", arguments[0]);', TOKEN);
        await driver.navigate().refresh();

        // Wait until Dashboard container loads
        await driver.wait(until.elementLocated(By.css('[data-testid="dashboard-container"]')), DEFAULT_TIMEOUT);
    });

    // 2️⃣ After each test, restore token if removed
    afterEach(async () => {
        const token = await driver.executeScript('return localStorage.getItem("token");');
        if (!token) {
            console.log('🔁 Token missing — restoring JWT...');
            await driver.executeScript('localStorage.setItem("token", arguments[0]);', TOKEN);
            await driver.navigate().refresh();
            await driver.wait(until.elementLocated(By.css('[data-testid="dashboard-container"]')), DEFAULT_TIMEOUT);
        }
    });

    after(async () => {
        if (driver) await driver.quit();
    });

    // -----------------------------------------------------
    // ✅ TEST CASE 1 — Dashboard Header Rendering
    // -----------------------------------------------------
    it('should render Dashboard header with title and user info', async () => {
        const title = await driver.findElement(By.css('[data-testid="dashboard-title"]')).getText();
        assert.strictEqual(title, 'Expense Tracker', 'Dashboard title should match');

        const refreshBtn = await driver.findElement(By.css('[data-testid="dashboard-refresh-btn"]'));
        const logoutBtn = await driver.findElement(By.css('[data-testid="dashboard-logout-btn"]'));

        assert.ok(await refreshBtn.isDisplayed(), 'Refresh button visible');
        assert.ok(await logoutBtn.isDisplayed(), 'Logout button visible');
    });

    // -----------------------------------------------------
    // ✅ TEST CASE 2 — Add Expense Modal Trigger
    // -----------------------------------------------------
    it('should open Add Expense modal on button click', async () => {
        const openModalBtn = await driver.findElement(By.css('[data-testid="open-add-expense"]'));
        await driver.wait(until.elementIsVisible(openModalBtn), DEFAULT_TIMEOUT);

        await openModalBtn.click();

        // Wait for modal to appear
        const modal = await driver.wait(
            until.elementLocated(By.css('[data-testid="expense-modal"]')),
            DEFAULT_TIMEOUT
        );

        assert.ok(await modal.isDisplayed(), 'Add Expense modal should be visible');
    });

    // -----------------------------------------------------
    // ✅ TEST CASE 3 — Refresh & Logout Buttons
    // -----------------------------------------------------
    it('should allow clicking refresh and logout without error', async () => {
        const refreshBtn = await driver.findElement(By.css('[data-testid="dashboard-refresh-btn"]'));
        const logoutBtn = await driver.findElement(By.css('[data-testid="dashboard-logout-btn"]'));

        await driver.executeScript('arguments[0].click()', refreshBtn);
        await driver.sleep(1000); // minor delay to simulate reload
        await driver.executeScript('arguments[0].click()', logoutBtn);

        // Confirm token removed temporarily
        const tokenAfterLogout = await driver.executeScript('return localStorage.getItem("token");');
        assert.strictEqual(tokenAfterLogout, null, 'Token should be removed after logout simulation');
    });
});
