// tests/Summary.spec.cjs
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

describe('Summary Component Tests (Authenticated)', function () {
    this.timeout(60000);
    let driver;

    before(async () => {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.get(APP_URL);

        // Inject JWT before test
        await driver.executeScript('localStorage.setItem("token", arguments[0]);', TOKEN);
        await driver.navigate().refresh();

        await driver.wait(until.elementLocated(By.css('body')), DEFAULT_TIMEOUT);
    });

    after(async () => {
        if (driver) await driver.quit();
    });

    // ✅ 1) Render summary with mock data
    it('should display monthly total and top categories correctly', async () => {
        await driver.executeScript(`
      const event = new CustomEvent('renderSummaryTest', {
        detail: {
          expenses: [
            { _id: '1', amount: 300, category: 'Food', date: new Date().toISOString() },
            { _id: '2', amount: 150, category: 'Travel', date: new Date().toISOString() },
            { _id: '3', amount: 50, category: 'Bills', date: new Date().toISOString() }
          ]
        }
      });
      document.dispatchEvent(event);
    `);

        const totalAmount = await driver.wait(
            until.elementLocated(By.css('[data-testid="summary-total-amount"]')),
            DEFAULT_TIMEOUT
        );

        const text = await totalAmount.getText();
        assert.ok(text.includes('$'), 'Total amount should be currency formatted');

        const categoryList = await driver.findElement(By.css('[data-testid="summary-category-list"]'));
        assert.ok(await categoryList.isDisplayed(), 'Category list should be visible');
    });

    // ✅ 2) Display “No data” message when expenses = []
    it('should show "No data to display yet" when no expenses exist', async () => {
        await driver.executeScript(`
      const event = new CustomEvent('renderSummaryTest', { detail: { expenses: [] } });
      document.dispatchEvent(event);
    `);

        const noDataElement = await driver.wait(
            until.elementLocated(By.css('[data-testid="summary-no-data"]')),
            DEFAULT_TIMEOUT
        );

        assert.ok(await noDataElement.isDisplayed(), 'No data message should be shown');
    });
});
