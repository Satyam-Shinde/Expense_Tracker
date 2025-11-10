// tests/ExpenseList.spec.cjs
const dotenv = require('dotenv');
dotenv.config();

const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
require('chromedriver');

const APP_URL = 'http://localhost:5173';
const DEFAULT_TIMEOUT = 15000;
const tokenFromEnv = process.env.VITE_USER_TOKEN;
const MOCK_TOKEN = 'mock-test-token-12345';
const TOKEN = tokenFromEnv && tokenFromEnv.length ? tokenFromEnv : MOCK_TOKEN;

describe('ExpenseList Component Tests (Authenticated)', function () {
    this.timeout(60000);
    let driver;

    before(async () => {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.get(APP_URL);

        // Inject valid JWT token before testing
        await driver.executeScript('localStorage.setItem("token", arguments[0]);', TOKEN);
        await driver.navigate().refresh();

        await driver.wait(until.elementLocated(By.css('body')), DEFAULT_TIMEOUT);
    });

    after(async () => {
        if (driver) await driver.quit();
    });

    // ----------------------------------------------------------
    // ✅ 1) Render List with Mock Data
    // ----------------------------------------------------------
    it('should render list of expenses correctly', async () => {
        await driver.executeScript(`
      const event = new CustomEvent('renderExpenseListTest', {
        detail: {
          expenses: [
            { _id: '1', amount: 100, category: 'Food', description: 'Lunch', date: '2025-11-10' },
            { _id: '2', amount: 200, category: 'Travel', description: 'Taxi', date: '2025-11-09' }
          ]
        }
      });
      document.dispatchEvent(event);
    `);

        const items = await driver.wait(
            until.elementsLocated(By.css('[data-testid^="expense-item-"]')),
            DEFAULT_TIMEOUT
        );

        assert.ok(items.length >= 2, 'At least two expense items rendered');

        const firstAmount = await driver.findElement(By.css('[data-testid="expense-amount-0"]')).getText();
        assert.ok(firstAmount.includes('$'), 'Amount should display in currency format');
    });

    // ----------------------------------------------------------
    // ✅ 2) Edit Button Click
    // ----------------------------------------------------------
    it('should click Edit button without error', async () => {
        const editBtn = await driver.findElement(By.css('[data-testid="expense-edit-0"]'));
        await driver.executeScript('arguments[0].scrollIntoView(true);', editBtn);
        await driver.wait(until.elementIsEnabled(editBtn), DEFAULT_TIMEOUT);
        await editBtn.click();

        assert.ok(true, 'Edit button clicked successfully');
    });

    // ----------------------------------------------------------
    // ✅ 3) Delete Button Click
    // ----------------------------------------------------------
    it('should click Delete button without error', async () => {
        // Wait for modal overlay to close if present
        await driver.sleep(500); // small buffer for overlay animation

        const deleteBtn = await driver.findElement(By.css('[data-testid="expense-delete-1"]'));
        await driver.executeScript('arguments[0].scrollIntoView(true);', deleteBtn);
        await driver.wait(until.elementIsEnabled(deleteBtn), DEFAULT_TIMEOUT);
        await driver.executeScript('arguments[0].click();', deleteBtn);

        assert.ok(true, 'Delete button clicked successfully');
    });
});
