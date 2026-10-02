const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1800 },
    deviceScaleFactor: 1
  });
  const url = new URL('file:///' + path.join(root, 'wireframe', 'index.html').replace(/\\/g, '/'));
  url.searchParams.set('demo', 'pre-assembly');
  await page.goto(url.href, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof renderStage === 'function');
  await page.locator('[data-open-preassembly]').first().click();
  await page.waitForTimeout(300);
  const detail = page.locator('.plpi-app').first();
  const info = await detail.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    width: element.clientWidth
  }));
  console.log(info);
  await detail.screenshot({
    path: path.join(root, 'tmp_ds_format_update', 'preassembly-full.png'),
    animations: 'disabled'
  });
  await browser.close();
})();
