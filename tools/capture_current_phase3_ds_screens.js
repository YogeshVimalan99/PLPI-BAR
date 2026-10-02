const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'tmp_ds_wireframe_update', 'screenshots');
const mainUrl = new URL(`file:///${path.join(root, 'wireframe', 'index.html').replace(/\\/g, '/')}`);
const handheldUrl = `file:///${path.join(root, 'wireframe', 'handheld-production-controller', 'index.html').replace(/\\/g, '/')}`;

fs.mkdirSync(outputDir, { recursive: true });

async function capture(page, selector, filename) {
  const target = page.locator(selector).first();
  await target.waitFor({ state: 'visible' });
  await target.screenshot({
    path: path.join(outputDir, filename),
    animations: 'disabled'
  });
}

async function openModule(page, demo) {
  const url = new URL(mainUrl.href);
  url.searchParams.set('demo', demo);
  await page.goto(url.href, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof renderStage === 'function');
  await page.waitForTimeout(450);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1440 }, deviceScaleFactor: 1 });

  await openModule(page, 'pre-assembly');
  await capture(page, '.plpi-app', 'image1.png');
  await page.locator('[data-open-preassembly]').first().click();
  await page.waitForTimeout(300);
  await capture(page, '.plpi-app', 'image2.png');

  await page.goto(handheldUrl, { waitUntil: 'load' });
  await page.waitForTimeout(250);
  await capture(page, '.seuic-device', 'image3.png');
  await page.evaluate(() => showReferenceScreen('details'));
  await page.waitForTimeout(150);
  await capture(page, '.seuic-device', 'image4.png');
  await page.evaluate(() => showReferenceScreen('verify'));
  await page.waitForTimeout(150);
  await capture(page, '.seuic-device', 'image5.png');
  await page.evaluate(() => showReferenceScreen('clearance'));
  await page.waitForTimeout(150);
  await capture(page, '.seuic-device', 'image6.png');

  await openModule(page, 'assembly');
  await capture(page, '.plpi-app', 'image7.png');
  await page.locator('[data-open-assembly]').first().click();
  await page.waitForTimeout(250);
  await capture(page, '.plpi-app', 'image8.png');
  await page.locator('#app-confirm-yes').click();
  await page.waitForTimeout(400);
  await capture(page, '.plpi-app', 'image9.png');
  await page.locator('[data-assembly-tab="samples"]').click();
  await page.waitForTimeout(200);
  await capture(page, '.plpi-app', 'image10.png');
  await page.locator('[data-assembly-tab="ipc"]').click();
  await page.waitForTimeout(200);
  await page.locator('[data-assembly-add-ipc]').click();
  await page.waitForTimeout(200);
  await capture(page, '.plpi-app', 'image11.png');
  await page.locator('[data-assembly-tab="recon"]').click();
  await page.waitForTimeout(200);
  await capture(page, '.plpi-app', 'image12.png');

  await openModule(page, 'post-assembly');
  await capture(page, '.plpi-app', 'image13.png');
  await page.locator('[data-open-postassembly]').first().click();
  await page.waitForTimeout(300);
  await capture(page, '.plpi-app', 'image14.png');

  await browser.close();
})();
