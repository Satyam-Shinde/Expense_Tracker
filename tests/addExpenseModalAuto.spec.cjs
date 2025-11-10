// tests/addExpenseModalAuto.spec.cjs
const dotenv = require('dotenv');
dotenv.config();

const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
require('chromedriver'); // or require('edgedriver') if you switch to Edge

const tokenFromEnv = process.env.VITE_USER_TOKEN;
const MOCK_TOKEN = 'mock-test-token-12345';
const TOKEN = tokenFromEnv && tokenFromEnv.length ? tokenFromEnv : MOCK_TOKEN;

const APP_URL = 'http://localhost:5173';
const DEFAULT_TIMEOUT = 15000;

describe('AddExpenseModal Auto-Fill Test', function () {
    this.timeout(60000);
    let driver;

    before(async function () {
        try {
            driver = await new Builder().forBrowser('chrome').build();
            await driver.get(APP_URL);

            // Inject token so API works
            await driver.executeScript('localStorage.setItem("token", arguments[0]);', TOKEN);
            await driver.navigate().refresh();

            await driver.wait(until.elementLocated(By.css('body')), DEFAULT_TIMEOUT);
        } catch (err) {
            if (driver) await driver.quit();
            throw err;
        }
    });

    after(async function () {
        if (driver) {
            try {
                await driver.quit();
            } catch (_) { }
        }
    });

    it('should auto-fill and submit AddExpenseModal successfully', async function () {
        // 1️⃣ Open Add Expense Modal (trigger button)
        const openModalBtn = await driver.wait(
            until.elementLocated(By.css('[data-testid="open-add-expense"]')),
            DEFAULT_TIMEOUT
        );
        await driver.wait(until.elementIsVisible(openModalBtn), DEFAULT_TIMEOUT);
        await openModalBtn.click();

        // 2️⃣ Wait for modal to appear
        const modal = await driver.wait(until.elementLocated(By.css('.main')), DEFAULT_TIMEOUT);
        await driver.wait(until.elementIsVisible(modal), DEFAULT_TIMEOUT);
        assert.strictEqual(await modal.isDisplayed(), true, 'Modal should be visible');

        // 3️⃣ Fill inputs
        const mockExpense = {
            amount: '499.99',
            category: 'Travel',
            date: '2025-11-10',
            description: 'Weekend trip to Goa',
        };

        const amountInput = await driver.findElement(By.id('amount'));
        const categorySelect = await driver.findElement(By.id('category'));
        const dateInput = await driver.findElement(By.id('date'));
        const descInput = await driver.findElement(By.id('description'));

        await amountInput.clear();
        await amountInput.sendKeys(mockExpense.amount);
        await categorySelect.sendKeys(mockExpense.category);
        await dateInput.clear();
        await dateInput.sendKeys(mockExpense.date);
        await descInput.clear();
        await descInput.sendKeys(mockExpense.description);

        // 4️⃣ Submit form safely
        const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
        await driver.executeScript('arguments[0].scrollIntoView(true);', submitBtn);
        await driver.wait(until.elementIsVisible(submitBtn), 5000);
        await driver.wait(until.elementIsEnabled(submitBtn), 5000);
        await submitBtn.click();

        // 5️⃣ Wait for modal to close
        await driver.wait(until.stalenessOf(modal), DEFAULT_TIMEOUT, 'Modal did not close after submission');

        // 6️⃣ Confirm modal gone
        const modals = await driver.findElements(By.css('.main'));
        assert.strictEqual(modals.length, 0, 'Modal should be gone after success');
    });

    it('should display an error if no token is in localStorage', async function () {
        // Remove token and refresh so app state resets
        await driver.executeScript('localStorage.removeItem("token");');
        await driver.navigate().refresh();

        // Wait for page re-render
        await driver.wait(until.elementLocated(By.css('[data-testid="open-add-expense"]')), DEFAULT_TIMEOUT);
        await driver.sleep(500);

        // 1️⃣ Find Add Expense trigger again
        const openModalBtn = await driver.findElement(By.css('[data-testid="open-add-expense"]'));
        await driver.wait(until.elementIsVisible(openModalBtn), DEFAULT_TIMEOUT);
        await openModalBtn.click();

        // 2️⃣ Wait for modal
        const modal = await driver.wait(until.elementLocated(By.css('.main')), DEFAULT_TIMEOUT);
        await driver.wait(until.elementIsVisible(modal), DEFAULT_TIMEOUT);

        // 3️⃣ Fill minimal fields
        const amountInput = await driver.findElement(By.id('amount'));
        const descInput = await driver.findElement(By.id('description'));
        await amountInput.clear();
        await amountInput.sendKeys('250');
        await descInput.clear();
        await descInput.sendKeys('No token test');

        // 4️⃣ Submit form
        const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
        await driver.executeScript('arguments[0].scrollIntoView(true);', submitBtn);
        await driver.wait(until.elementIsVisible(submitBtn), 5000);
        await driver.wait(until.elementIsEnabled(submitBtn), 5000);
        await submitBtn.click();

        // 5️⃣ Verify error
        const errorBox = await driver.wait(
            until.elementLocated(By.css('[data-testid="error-message"]')),
            DEFAULT_TIMEOUT / 2
        );
        await driver.wait(until.elementIsVisible(errorBox), DEFAULT_TIMEOUT / 2);
        assert.ok(await errorBox.isDisplayed(), 'Error message should appear');

        // 6️⃣ Close modal
        const cancelBtn = await driver.findElement(By.xpath("//button[contains(normalize-space(.), 'Cancel')]"));
        await driver.wait(until.elementIsVisible(cancelBtn), DEFAULT_TIMEOUT);
        await cancelBtn.click();

        // Restore token for next runs
        await driver.executeScript('localStorage.setItem("token", arguments[0]);', TOKEN);
        await driver.navigate().refresh();
    });
});
