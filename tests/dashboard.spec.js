import dotenv from "dotenv";
dotenv.config();

import { Builder, By, until } from "selenium-webdriver";
import * as firefox from "selenium-webdriver/firefox.js";
import { expect } from "chai";

const token = process.env.VITE_USER_TOKEN;
//const token = import.meta.env.VITE_USER_TOKEN;
console.log(token);

describe("Dashboard Tests", function () {
  this.timeout(40000);
  let driver;

  before(async () => {
    const options = new firefox.Options();
    driver = await new Builder()
      .forBrowser("firefox")
      .setFirefoxOptions(options)
      .build();
    await driver.get("http://localhost:5173");

    driver.sleep(1000);

    await driver.executeScript(
      `localStorage.setItem("token", arguments[0]);`,
      token,
    );

    await driver.navigate().refresh();
  });

  after(async () => {
    await driver.quit();
  });

  it("should display Dashboard header", async () => {
    const header = await driver.wait(
      until.elementLocated(By.css("h1.text-3xl")),
      10000,
    );
    const text = await header.getText();
    expect(text).to.include("Expense Tracker");
  });

  it("should open Add Expense modal", async () => {
    const addButton = await driver.findElement(
      By.xpath("//button[contains(., 'Add Expense')]"),
    );
    await addButton.click();

    const modal = await driver.wait(
      until.elementLocated(By.css(".main")),
      10000,
    );
    const title = await modal.findElement(By.css("h2"));
    const text = await title.getText();

    expect(text).to.include("Add Expense");
  });
});
