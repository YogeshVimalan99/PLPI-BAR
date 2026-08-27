const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'temp_correct_wireframe', 'index.html');
const output = path.join(root, 'temp_correct_wireframe', 'screenshots');
fs.mkdirSync(output, { recursive: true });

async function frame(page) {
  const handle = await page.waitForSelector('iframe');
  const target = await handle.contentFrame();
  await target.waitForSelector('#grc-wireframe');
  return target;
}

async function annotate(target, items) {
  const result = await target.evaluate((callouts) => {
    document.querySelectorAll('.ds-callout').forEach((node) => node.remove());
    document.querySelectorAll('[data-ds-target]').forEach((node) => {
      node.style.removeProperty('outline');
      node.style.removeProperty('outline-offset');
      node.style.removeProperty('box-shadow');
      node.removeAttribute('data-ds-target');
    });

    const missing = [];
    for (const item of callouts) {
      const element = document.querySelector(item.selector);
      if (!element) {
        missing.push(item.n);
        continue;
      }
      element.dataset.dsTarget = String(item.n);
      element.style.outline = '4px solid #c00000';
      element.style.outlineOffset = '-2px';
      element.style.boxShadow = '0 0 0 3px rgba(255,242,204,0.95)';
      const rect = element.getBoundingClientRect();
      const badge = document.createElement('div');
      badge.className = 'ds-callout';
      badge.textContent = String(item.n);
      Object.assign(badge.style, {
        position: 'fixed',
        left: `${Math.max(5, Math.min(window.innerWidth - 38, rect.left - 12))}px`,
        top: `${Math.max(5, Math.min(window.innerHeight - 38, rect.top - 12))}px`,
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#c00000',
        color: '#fff',
        border: '3px solid #fff',
        boxShadow: '0 1px 5px rgba(0,0,0,.75)',
        font: 'bold 16px Arial, sans-serif',
        lineHeight: '32px',
        textAlign: 'center',
        zIndex: '2147483647',
        pointerEvents: 'none',
      });
      document.body.appendChild(badge);
    }
    return missing;
  }, items);
  if (result.length) throw new Error(`Missing callouts: ${result.join(', ')}`);
}

async function screenshot(page, name) {
  await page.screenshot({
    path: path.join(output, name),
    animations: 'disabled',
  });
}

async function sign(page, target, selector) {
  const iframe = await page.locator('iframe').boundingBox();
  const box = await target.locator(selector).boundingBox();
  await page.mouse.move(iframe.x + box.x + 30, iframe.y + box.y + 55);
  await page.mouse.down();
  await page.mouse.move(iframe.x + box.x + 110, iframe.y + box.y + 85, { steps: 8 });
  await page.mouse.move(iframe.x + box.x + 190, iframe.y + box.y + 45, { steps: 8 });
  await page.mouse.up();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1 });
  await page.goto(`file:///${source.replace(/\\/g, '/')}`, { waitUntil: 'load' });
  const target = await frame(page);

  await annotate(target, [
    { n: 1, selector: '.stepper' },
    { n: 2, selector: '.prefill' },
    { n: 3, selector: '.split' },
    { n: 4, selector: '#driver-signature' },
    { n: 5, selector: '#to-checks' },
  ]);
  await screenshot(page, '11-grc-delivery.png');

  await target.locator('.ds-callout').evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
  await target.locator('#driver-name').fill('A. Driver');
  await target.locator('#delivery-note').fill('DN-2026-0618');
  await sign(page, target, '#driver-signature');
  await target.locator('#to-checks').click();
  await annotate(target, [
    { n: 1, selector: '.stepper' },
    { n: 2, selector: '.check-list' },
    { n: 3, selector: '.screen[data-screen="1"] .split' },
    { n: 4, selector: '#receiver-signature' },
    { n: 5, selector: '#to-review' },
  ]);
  await screenshot(page, '12-grc-goods-checks.png');

  for (const name of ['clean', 'nonpharma', 'damage', 'confirmed']) {
    await target.locator(`input[name="${name}"][value="Yes"]`).check();
  }
  await target.locator('#receiver-name').fill('G. Receiver');
  await target.locator('#receiver-comments').fill('No exceptions observed.');
  await sign(page, target, '#receiver-signature');
  await target.locator('#to-review').click();
  await annotate(target, [
    { n: 1, selector: '.stepper' },
    { n: 2, selector: '.review-grid' },
    { n: 3, selector: '#confirm-record' },
    { n: 4, selector: '#review-content .actions-end' },
  ]);
  await screenshot(page, '13-grc-review-file.png');

  await target.locator('#confirm-record').check();
  await target.locator('#complete-checklist').click();
  await annotate(target, [
    { n: 1, selector: '.preview-bar' },
    { n: 2, selector: '.doc-table' },
    { n: 3, selector: '.doc-table tbody tr:nth-child(10)' },
    { n: 4, selector: '.file-path' },
    { n: 5, selector: '#pdf-preview .viz-row' },
  ]);
  await screenshot(page, '14-grc-pdf-preview.png');

  await browser.close();
})();


