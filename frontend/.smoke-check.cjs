const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push('console.error: ' + msg.text());
  });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'C:\\Users\\hp\\AppData\\Local\\Temp\\claude\\c--Users-hp-APAG-ZariaFinance\\2d894ef8-23ff-4dee-bf73-53e9f9de2c6b\\scratchpad\\screenshot1.png', fullPage: true });

  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));

  console.log('TITLE:', title);
  console.log('BODY_SNIPPET:', bodyText);
  console.log('ERRORS:', JSON.stringify(errors, null, 2));

  await browser.close();
})().catch((e) => {
  console.error('SCRIPT_FAILED:', e.message);
  process.exit(1);
});
