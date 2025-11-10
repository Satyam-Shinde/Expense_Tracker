// tests/EditExpenseModal.spec.cjs
const dotenv = require('dotenv');
dotenv.config();

const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
require('chromedriver');

const APP_URL = 'http://localhost:5173';
const DEFAULT_TIMEOUT = 20000;
const tokenFromEnv = process.env.VITE_USER_TOKEN;
const MOCK_TOKEN = 'mock-test-token-12345';
const TOKEN = tokenFromEnv && tokenFromEnv.length ? tokenFromEnv : MOCK_TOKEN;

describe('EditExpenseModal Component Tests (Authenticated)', function () {
    this.timeout(60000);
    let driver;

    before(async () => {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.get(APP_URL);

        // Inject JWT token before running component tests
        await driver.executeScript('localStorage.setItem("token", arguments[0]);', TOKEN);
        await driver.navigate().refresh();

        await driver.wait(until.elementLocated(By.css('body')), DEFAULT_TIMEOUT);
    });

    after(async () => {
        if (driver) await driver.quit();
    });

    // ----------------------------------------------------------
    // ✅ Test Case 1: Modal opens with prefilled expense data
    // ----------------------------------------------------------
    it('should render EditExpenseModal with pre-filled fields', async () => {
        await driver.executeScript(`
      const event = new CustomEvent('openEditModalTest', {
        detail: {
          expense: {
            _id: '123',
            amount: 1200,
            category: 'Travel',
            description: 'Business trip',
            date: '2025-11-10'
          }
        }
      });
      document.dispatchEvent(event);
    `);

        const modal = await driver.wait(
            until.elementLocated(By.css('[data-testid="edit-expense-modal"]')),
            DEFAULT_TIMEOUT
        );
        assert.ok(await modal.isDisplayed(), 'Modal should be visible');

        const amountInput = await driver.findElement(By.css('[data-testid="edit-amount"]'));
        const descInput = await driver.findElement(By.css('[data-testid="edit-description"]'));

        const amountVal = await amountInput.getAttribute('value');
        const descVal = await descInput.getAttribute('value');

        assert.strictEqual(amountVal, '1200');
        assert.strictEqual(descVal, 'Business trip');
    });

    // ----------------------------------------------------------
    // ✅ Test Case 2: Form submission with updated data
    // ----------------------------------------------------------
    it('should allow editing fields and submit successfully', async () => {
        const amountInput = await driver.findElement(By.css('[data-testid="edit-amount"]'));
        await amountInput.clear();
        await amountInput.sendKeys('999.99');

        const submitBtn = await driver.findElement(By.css('[data-testid="edit-submit"]'));
        await driver.executeScript('arguments[0].scrollIntoView(true);', submitBtn);
        await driver.wait(until.elementIsEnabled(submitBtn), DEFAULT_TIMEOUT);
        await submitBtn.click();

        // Wait for modal to close
        await driver.wait(until.stalenessOf(submitBtn), DEFAULT_TIMEOUT);
        assert.ok(true, 'Form submitted and modal closed successfully');
    });

    // ----------------------------------------------------------
    // ✅ Test Case 3: Simulated server error display
    // ----------------------------------------------------------
    it('should display error message when backend fails', async () => {
        // Mock a failed fetch inside the app
        await driver.executeScript(`
      window.fetch = async () => ({
        ok: false,
        json: async () => ({ message: 'Failed to update expense' })
      });
      const event = new CustomEvent('openEditModalTest', {
        detail: {
          expense: {
            _id: '404',
            amount: 100,
            category: 'Food',
            description: 'Testing Error',
            date: '2025-11-10'
          }
        }
      });
      document.dispatchEvent(event);
    `);

        const modal = await driver.wait(
            until.elementLocated(By.css('[data-testid="edit-expense-modal"]')),
            DEFAULT_TIMEOUT
        );

        const submitBtn = await driver.findElement(By.css('[data-testid="edit-submit"]'));
        await driver.executeScript('arguments[0].click()', submitBtn);

        const errorBox = await driver.wait(
            until.elementLocated(By.css('[data-testid="edit-error"]')),
            DEFAULT_TIMEOUT
        );

        const errorText = await errorBox.getText();
        assert.ok(errorText.includes('Failed to update expense'));
    });
});
