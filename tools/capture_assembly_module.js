const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outputDir = path.resolve(__dirname, '..', 'assembly_module_document', 'screenshots');
fs.mkdirSync(outputDir, { recursive: true });

async function capture(page, name) {
  await page.locator('.plpi-app').screenshot({
    path: path.join(outputDir, name),
    animations: 'disabled'
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1440 }, deviceScaleFactor: 1 });
  const wireframeUrl = new URL('file:///' + path.resolve(__dirname, '..', 'wireframe', 'index.html').replace(/\\/g, '/'));
  wireframeUrl.searchParams.set('demo', 'assembly');
  await page.goto(wireframeUrl.href, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof renderStage === 'function');
  await page.waitForTimeout(500);

  await capture(page, '01-assembly-batch-queue.png');

  const startButton = page.locator('[data-open-assembly]').first();
  await startButton.click();
  await page.waitForTimeout(250);
  await capture(page, '02-start-batch-confirmation.png');
  await page.locator('#app-confirm-yes').click();
  await page.waitForTimeout(400);

  await capture(page, '03-initial-checks.png');

  await page.locator('[data-assembly-tab="samples"]').click();
  await page.waitForTimeout(200);
  await capture(page, '04-random-sample-check.png');

  await page.locator('[data-assembly-tab="ipc"]').click();
  await page.waitForTimeout(200);
  await capture(page, '05-ipc-checks.png');

  await page.locator('[data-assembly-tab="recon"]').click();
  await page.waitForTimeout(200);
  await capture(page, '06-reconciliation-closure.png');

  await browser.close();
})();


