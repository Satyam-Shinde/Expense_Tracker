import dotenv from "dotenv";
dotenv.config();

import { Builder, By, until } from "selenium-webdriver";
import * as firefox from "selenium-webdriver/firefox.js";
import { expect } from "chai";

const token = process.env.VITE_USER_TOKEN;

describe("Expense Modal Tests", function () {
  this.timeout(40000);
  let driver;

  before(async () => {
    const options = new firefox.Options();
    driver = await new Builder()
      .forBrowser("firefox")
      .setFirefoxOptions(options)
      .build();
    await driver.get("http://localhost:5173");
    await driver.executeScript(
      `localStorage.setItem("token", arguments[0]);`,
      token,
    );

    await driver.navigate().refresh();
  });

  after(async () => {
    await driver.quit();
  });

  it("should fill and close Add Expense modal", async () => {
    const addBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Add Expense')]"),
    );
    await addBtn.click();

    await driver.wait(until.elementLocated(By.css("#amount")), 10000);
    await driver.findElement(By.id("amount")).sendKeys("25");
    await driver.findElement(By.id("description")).sendKeys("Test Expense");

    const cancelBtn = await driver.findElement(
      By.xpath("//button[contains(., 'Cancel')]"),
    );
    await cancelBtn.click();

    const modals = await driver.findElements(By.css(".main"));
    expect(modals.length).to.equal(0);
  });
});
