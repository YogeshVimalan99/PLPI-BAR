const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'temp_grc_update', 'wireframe', 'index.html');
const output = path.join(root, 'temp_grc_update', 'screenshots');
fs.mkdirSync(output, { recursive: true });

async function annotate(page, items, screenName) {
  const result = await page.evaluate(({ items, screenName }) => {
    document.querySelectorAll('.ds-grc-callout').forEach((element) => element.remove());
    document.querySelectorAll('[data-ds-grc-target]').forEach((element) => {
      element.style.removeProperty('outline');
      element.style.removeProperty('outline-offset');
      element.style.removeProperty('box-shadow');
      element.removeAttribute('data-ds-grc-target');
    });

    const missing = [];
    let matched = 0;
    for (const item of items) {
      const candidates = Array.from(document.querySelectorAll(item.selector));
      const element = candidates[item.index || 0];
      if (!element) {
        missing.push(item.n);
        continue;
      }

      matched += 1;
      element.dataset.dsGrcTarget = `${screenName}-${item.n}`;
      element.style.outline = '4px solid #c00000';
      element.style.outlineOffset = '-2px';
      element.style.boxShadow = '0 0 0 3px rgba(255,242,204,0.95)';

      const rect = element.getBoundingClientRect();
      const badge = document.createElement('div');
      badge.className = 'ds-grc-callout';
      badge.textContent = String(item.n);
      Object.assign(badge.style, {
        position: 'fixed',
        left: `${Math.max(5, Math.min(window.innerWidth - 38, rect.left - 14))}px`,
        top: `${Math.max(5, Math.min(window.innerHeight - 38, rect.top - 14))}px`,
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#c00000',
        color: '#ffffff',
        border: '3px solid #ffffff',
        boxShadow: '0 1px 5px rgba(0,0,0,0.75)',
        font: 'bold 16px Arial, sans-serif',
        lineHeight: '32px',
        textAlign: 'center',
        zIndex: '2147483647',
        pointerEvents: 'none',
      });
      document.body.appendChild(badge);
    }
    return { matched, missing };
  }, { items, screenName });

  if (result.missing.length) {
    throw new Error(`Missing ${screenName} callouts: ${result.missing.join(', ')}`);
  }
  console.log(`${screenName}: ${result.matched}/${items.length}`);
}

async function capture(page, filename) {
  await page.screenshot({
    path: path.join(output, filename),
    animations: 'disabled',
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  await page.goto(`file:///${source.replace(/\\/g, '/')}`, { waitUntil: 'load' });
  await page.locator('[onclick="loadDemoData()"]' ).click();
  await page.waitForTimeout(500);

  const clipboard = page.locator('.clipboard-container');
  await clipboard.evaluate((element) => { element.scrollTop = 0; });
  await annotate(page, [
    { n: 1, selector: '#form-status' },
    { n: 2, selector: '.toolbar-actions' },
    { n: 3, selector: 'tr:has(#po-number)' },
    { n: 4, selector: 'tr:has(#vehicle-no)' },
    { n: 5, selector: 'tr:has(#delivery-address)' },
    { n: 6, selector: '.evidence-panel' },
  ], 'Checklist overview');
  await capture(page, '11-grc-overview-details.png');

  await clipboard.evaluate((element) => { element.scrollTop = 470; });
  await page.waitForTimeout(250);
  await annotate(page, [
    { n: 1, selector: 'tr:has(#delivery-note-address)' },
    { n: 2, selector: '.vehicle-checklist-grid' },
    { n: 3, selector: '.line-clearance-wrapper' },
    { n: 4, selector: 'tr:has(#receiver-name)' },
    { n: 5, selector: 'tr:has(#receiver-comments)' },
    { n: 6, selector: '.confirmation-section' },
  ], 'Receiving checks');
  await capture(page, '12-grc-receiving-clearance.png');

  await clipboard.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await page.waitForTimeout(250);
  await annotate(page, [
    { n: 1, selector: '.confirmation-section .split-cell-3' },
    { n: 2, selector: '.qa-options' },
    { n: 3, selector: '.qa-comment-box' },
    { n: 4, selector: 'tr:has(#qa-name)' },
    { n: 5, selector: '.progress-card' },
    { n: 6, selector: '[onclick="submitForm()"]' },
  ], 'Confirmation and QA');
  await capture(page, '13-grc-confirmation-qa.png');

  await browser.close();
  console.log(`CAPTURED=${output}`);
})();
