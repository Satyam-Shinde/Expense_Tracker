const { Builder } = require('selenium-webdriver');
require('chromedriver');

(async () => {
    try {
        const driver = await new Builder().forBrowser('chrome').build();
        await driver.get('https://example.com');
        console.log('✅ Chrome launched successfully!');
        await driver.quit();
    } catch (err) {
        console.error('❌ Failed to launch Chrome:', err);
    }
})();
