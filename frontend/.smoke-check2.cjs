const { chromium } = require('@playwright/test');

const shotDir = 'C:\\Users\\hp\\AppData\\Local\\Temp\\claude\\c--Users-hp-APAG-ZariaFinance\\2d894ef8-23ff-4dee-bf73-53e9f9de2c6b\\scratchpad\\';

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push('console.error: ' + msg.text());
  });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });

  await page.getByLabel(/Username/i).fill('ceoadmin');
  await page.getByLabel(/Password/i).fill('Ceo@12345');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForTimeout(3000);
  await page.screenshot({ path: shotDir + 'screenshot2-dashboard.png', fullPage: true });
  console.log('AFTER LOGIN URL:', page.url());

  // Try navigating to donor-management grants list
  const targets = [
    { path: '/donor-management/grants', name: 'grants-list' },
    { path: '/donor-management/role-directory', name: 'role-directory' },
  ];

  for (const t of targets) {
    try {
      await page.goto('http://localhost:5173' + t.path, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: shotDir + 'screenshot-' + t.name + '.png', fullPage: true });
      console.log('Visited', t.path, '->', page.url());
    } catch (e) {
      console.log('FAILED to visit', t.path, e.message);
    }
  }

  console.log('ERRORS:', JSON.stringify(errors, null, 2));
  await browser.close();
})().catch((e) => {
  console.error('SCRIPT_FAILED:', e.message);
  process.exit(1);
});
