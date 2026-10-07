const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const root = path.resolve(__dirname, '..');
  const out = path.join(root, 'Phase 3 Doc', 'screenshots');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  async function shot(name, selector = '.plpi-app') {
    const target = page.locator(selector).first();
    await target.waitFor({ state: 'visible' });
    await target.screenshot({ path: path.join(out, name) });
  }
  async function mainModule(mode, prefix, openSelector) {
    await page.goto(`file:///${path.join(root, 'wireframe', 'index.html').replace(/\\/g, '/')}?demo=${mode}`, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    await shot(`${prefix}-queue.png`);
    await page.locator(openSelector).first().click();
    await page.waitForTimeout(300);
    await shot(`${prefix}-detail.png`);
  }
  await mainModule('pre-assembly', '01-pre-assembly', '[data-open-preassembly]');
  await mainModule('post-assembly', '04-post-assembly', '[data-open-postassembly]');

  await page.goto(`file:///${path.join(root, 'wireframe', 'handheld-production-controller', 'handheld-production-controller.html').replace(/\\/g, '/')}`, { waitUntil: 'load' });
  await page.waitForTimeout(250);
  await shot('02-handheld-menu.png', '.seuic-device');
  await page.evaluate(() => showReferenceScreen('details'));
  await page.waitForTimeout(150);
  await shot('02-handheld-stock-take-out.png', '.seuic-device');
  await page.evaluate(() => showReferenceScreen('verify'));
  await page.waitForTimeout(150);
  await shot('02-handheld-box-verification.png', '.seuic-device');
  await page.evaluate(() => showReferenceScreen('clearance'));
  await page.waitForTimeout(150);
  await shot('02-handheld-line-clearance.png', '.seuic-device');
  await browser.close();
})();
