const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outputDir = path.resolve(__dirname, '..', 'temp_ds_build', 'screenshots');
fs.mkdirSync(outputDir, { recursive: true });

async function setState(page, script) {
  await page.evaluate((source) => {
    window.eval(`
      document.querySelectorAll('.modal-backdrop').forEach((item) => item.classList.add('hidden'));
      document.body.classList.remove('pre-login');
      currentLogin = { user: 'design.user', role: 'Design Review' };
      isAuthenticated = true;
      ${source}
    `);
  }, script);
  await page.waitForTimeout(500);
}

async function highlight(page, labels) {
  await page.evaluate((items) => {
    document.querySelectorAll('[data-ds-highlight]').forEach((element) => {
      element.style.removeProperty('background');
      element.style.removeProperty('outline');
      element.removeAttribute('data-ds-highlight');
    });
    document.querySelectorAll('th, button, .rp-tile-title').forEach((element) => {
      if (items.includes(element.textContent.trim())) {
        element.dataset.dsHighlight = 'true';
        element.style.background = '#fff2cc';
        element.style.outline = '3px solid #c00000';
        element.style.outlineOffset = '-2px';
      }
    });
  }, labels);
}

async function annotate(page, items, screenName) {
  const result = await page.evaluate(({ items, screenName }) => {
    document.querySelectorAll('.ds-callout-badge').forEach((element) => element.remove());
    document.querySelectorAll('[data-ds-callout]').forEach((element) => {
      element.style.removeProperty('outline');
      element.style.removeProperty('outline-offset');
      element.style.removeProperty('box-shadow');
      element.style.removeProperty('background-color');
      element.removeAttribute('data-ds-callout');
    });
    const app = document.querySelector('.plpi-app');
    if (!app) return { matched: 0, missing: items.map((item) => item.n) };
    app.style.position = 'relative';
    const appRect = app.getBoundingClientRect();
    const missing = [];
    let matched = 0;
    const visible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    for (const item of items) {
      let candidates = item.selector ? Array.from(document.querySelectorAll(item.selector)) : Array.from(document.querySelectorAll('button, th, td, label, span, h2, h3, h4, div'));
      candidates = candidates.filter(visible);
      if (item.match) {
        const wanted = item.match.trim().toLowerCase();
        candidates = candidates.filter((element) => element.textContent.trim().toLowerCase().includes(wanted));
        candidates.sort((a, b) => {
          const ar = a.getBoundingClientRect();
          const br = b.getBoundingClientRect();
          return (ar.width * ar.height) - (br.width * br.height);
        });
      }
      const element = candidates[item.index || 0];
      if (!element) { missing.push(item.n); continue; }
      matched += 1;
      element.dataset.dsCallout = `${screenName}-${item.n}`;
      element.style.outline = '4px solid #c00000';
      element.style.outlineOffset = '-2px';
      element.style.boxShadow = '0 0 0 3px rgba(255,242,204,0.95)';
      const rect = element.getBoundingClientRect();
      if (rect.width < 520 && rect.height < 160 && !['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) element.style.backgroundColor = '#fff2cc';
      const badge = document.createElement('div');
      badge.className = 'ds-callout-badge';
      badge.textContent = String(item.n);
      Object.assign(badge.style, {
        position: 'absolute', left: `${Math.max(4, Math.min(appRect.width - 34, rect.left - appRect.left - 13))}px`, top: `${Math.max(4, Math.min(appRect.height - 34, rect.top - appRect.top - 13))}px`,
        width: '30px', height: '30px', borderRadius: '50%', background: '#c00000', color: '#ffffff', border: '3px solid #ffffff', boxShadow: '0 1px 5px rgba(0,0,0,0.7)', font: 'bold 16px Arial, sans-serif', lineHeight: '30px', textAlign: 'center', zIndex: '2147483647', pointerEvents: 'none'
      });
      app.appendChild(badge);
    }
    return { matched, missing };
  }, { items, screenName });
  if (result.missing.length) throw new Error(`Unmatched callouts on ${screenName}: ${result.missing.join(', ')}`);
  console.log(`ANNOTATED ${screenName}: ${result.matched}/${items.length}`);
}
async function capture(page, fileName) {
  const app = page.locator('.plpi-app');
  await app.screenshot({ path: path.join(outputDir, fileName), animations: 'disabled' });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto('https://yogeshvimalan99.github.io/PLPI-BAR/wireframe/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof renderStage === 'function');

  await setState(page, `
    currentLogin = { user: 'goods.in', role: 'Goods-In User' };
    packingListMode = 'view';
    packingListSelectedPo = 'C13719';
    packingListSearch = 'C13719';
    packingListGenerated = false;
    packingLabelPrintRecords = {};
    renderStage('packing-list');
  `);
  await page.locator('.packing-grid-shell.tall').first().evaluate((element) => { element.scrollLeft = 1020; element.style.flex = '0 0 600px'; element.style.height = '600px'; element.style.minHeight = '600px'; });
  await highlight(page, ['VERIFY & PRINT', 'LOG']);
  await annotate(page, [
    { n: 1, selector: '.packing-view-search-row' },
    { n: 2, selector: '.wide-packing-table thead th:nth-child(13)' },
    { n: 3, selector: '.wide-packing-table thead th:nth-child(17)' },
    { n: 4, selector: '[data-generate-packing-list]' },
    { n: 5, selector: '[data-packing-tab="documents"]' }
  ], 'Packing List');
  await capture(page, '01-packing-list-verify-log.png');

  await setState(page, `
    currentLogin = { user: 'goods.in', role: 'Goods-In User' };
    ensureRpExampleWorkflows();
    packingListGenerated = true;
    packingListMode = 'documents';
    selectedRpPackPo = 'C13719';
    rpPackWorkflows['C13719'].documents.forEach((doc) => {
      doc.uploaded = true;
      doc.fileName = doc.fileName || ('C13719_' + doc.name.replace(/\\s+/g, '_') + '.pdf');
    });
    renderStage('packing-list');
  `);
  await annotate(page, [
    { n: 1, selector: '.rp-documents-header h3' },
    { n: 2, selector: '.rp-doc-tiles-grid' },
    { n: 3, selector: '.rp-doc-tile:nth-child(8)' },
    { n: 4, selector: '.rp-doc-tile:first-child .rp-tile-badge' },
    { n: 5, selector: '.rp-doc-signoff-row' },
    { n: 6, selector: '#rp-documents-signoff-button' }
  ], 'RPi Documents');
  await capture(page, '02-rpi-documents-goods-in.png');

  await setState(page, `
    currentLogin = { user: 'rp.user', role: 'Responsible Person' };
    ensureRpExampleWorkflows();
    packingListGenerated = true;
    selectedRpApprovalPo = 'C13719';
    rpPackWorkflows['C13719'].status = 'Signed Off';
    rpPackWorkflows['C13719'].signoff = { user: 'goods.in', dateTime: '17 Jul 2026, 10:15:00' };
    rpPackWorkflows['C13719'].rpTaskViewedDocs = {};
    renderStage('rp-pack');
  `);
  await annotate(page, [
    { n: 1, selector: '.rp-task-search-row' },
    { n: 2, selector: '.rp-task-po-card' },
    { n: 3, selector: '.rp-doc-tiles-grid' },
    { n: 4, selector: '.rp-doc-tile:first-child .rp-tile-badge' },
    { n: 5, selector: '.rp-checklist-placeholder' }
  ], 'RPi Document Review');
  await capture(page, '03-rpi-task-document-review.png');

  await setState(page, `
    currentLogin = { user: 'rp.user', role: 'Responsible Person' };
    ensureRpExampleWorkflows();
    packingListGenerated = true;
    selectedRpApprovalPo = 'C13719';
    const workflow = rpPackWorkflows['C13719'];
    workflow.status = 'Signed Off';
    workflow.signoff = { user: 'goods.in', dateTime: '17 Jul 2026, 10:15:00' };
    workflow.rpTaskViewedDocs = {};
    workflow.documents.forEach((doc) => { workflow.rpTaskViewedDocs[doc.id] = true; });
    workflow.rpTaskViewedDocs['generated-packing-list'] = true;
    workflow.rpChecklistOpen = true;
    renderStage('rp-pack');
  `);
  const checklistPanel = page.locator('.rp-task-checklist-scroll-panel');
  if (await checklistPanel.count()) await checklistPanel.evaluate((element) => { element.style.flex = '0 0 600px'; element.style.height = '600px'; element.style.minHeight = '600px'; });
  await annotate(page, [
    { n: 1, selector: '.modern-checklist-section:nth-of-type(1)' },
    { n: 2, selector: '.modern-checklist-section:nth-of-type(2)' },
    { n: 3, selector: '#rp-form-inactive-reason' },
    { n: 4, selector: '.modern-checklist-section:nth-of-type(3)' }
  ], 'RPi Checklist Top');
  await capture(page, '04-rpi-task-checklist-top.png');

  if (await checklistPanel.count()) {
    await checklistPanel.evaluate((element) => {
      const fullWindow = element.closest('.rp-checklist-full-window');
      if (fullWindow) {
        fullWindow.style.setProperty('height', '700px', 'important');
        fullWindow.style.setProperty('max-height', '700px', 'important');
      }
      element.querySelectorAll('.modern-checklist-section').forEach((section, index) => {
        if (index < 3) section.style.display = 'none';
      });
      element.style.flex = '0 0 420px';
      element.style.height = '420px';
      element.style.minHeight = '420px';
      element.scrollTop = element.scrollHeight;
    });
    await page.waitForTimeout(250);
  }
  await annotate(page, [
    { n: 1, selector: '.modern-checklist-section:nth-of-type(4)' },
    { n: 2, selector: '.modern-checklist-section:nth-of-type(5)' },
    { n: 3, selector: '#rp-form-comments' },
    { n: 4, selector: '.modern-check-card:has([data-rp-field="stock-suitable"])' },
    { n: 5, selector: '.modern-check-card:has([data-rp-field="deviation"])' },
    { n: 6, selector: '#rp-verify-signoff-btn' }
  ], 'RPi Checklist Bottom');
  await capture(page, '05-rpi-task-checklist-bottom.png');

  await setState(page, `
    currentLogin = { user: 'batch.checker', role: 'Batch Checker' };
    ensureRpExampleWorkflows();
    rpPackWorkflows['C13719'].status = 'RPi Approved';
    rpApprovalSignoffs['C13719'] = { user: 'rp.user', role: 'Responsible Person', dateTime: '17 Jul 2026, 11:00:00' };
    batchCheckerSelectedPo = 'C13719';
    batchCheckerDashboardOpen = true;
    selectedBatchCheckerRowKey = 0;
    renderStage('batch-checker');
  `);
  await page.locator('.batchchecker-check-table-wrap').evaluate((element) => { element.scrollLeft = 2500; });
  await highlight(page, ['Supplier Declaration', 'Temperature Record', 'Batch Check', 'Print PCL']);
  await annotate(page, [
    { n: 1, selector: '.batchchecker-live-header' },
    { n: 2, selector: '[data-batchchecker-view-supplier-declaration="0"]' },
    { n: 3, selector: '[data-batchchecker-view-temperature-record="0"]' },
    { n: 4, selector: '.batchchecker-selected-actions span' },
    { n: 5, selector: '#batchchecker-btn-check' },
    { n: 6, selector: '#batchchecker-generate-pcl' }
  ], 'Batch Checker');
  await capture(page, '06-batch-checker-new-controls.png');

  await setState(page, `
    currentLogin = { user: 'batch.checker', role: 'Batch Checker' };
    ensureRpExampleWorkflows();
    rpPackWorkflows['C13719'].status = 'RPi Approved';
    rpApprovalSignoffs['C13719'] = { user: 'rp.user', role: 'Responsible Person', dateTime: '17 Jul 2026, 11:00:00' };
    batchCheckerSelectedPo = 'C13719';
    batchCheckerDashboardOpen = true;
    selectedBatchCheckerRowKey = 0;
    renderStage('batch-checker');
    openBatchCheckVerifyPopup();
  `);
  await annotate(page, [
    { n: 1, selector: '#batch-check-verify-title' },
    { n: 2, selector: '.batchcheck-verification-row:nth-child(1)' },
    { n: 3, selector: '.batchcheck-verification-row:nth-child(4)' },
    { n: 4, selector: '.batchcheck-verification-row:nth-child(7)' },
    { n: 5, selector: '#batch-check-confirm-btn' },
    { n: 6, selector: '[data-close-batch-check-verify]' }
  ], 'Product Verification Top');
  await capture(page, '07-product-verification-popup.png');
  const batchVerifyBody = page.locator('#batch-check-verify-modal .confirm-body');
  await page.locator('#batch-check-verify-modal .confirm-window').evaluate((element) => { element.style.maxHeight = '90vh'; });
  await batchVerifyBody.evaluate((element) => {
    const grid = element.querySelector('.batchcheck-verification-grid');
    if (grid) {
      grid.style.maxHeight = 'none';
      grid.style.overflowY = 'visible';
      grid.style.gap = '4px';
    }
    element.querySelectorAll('.batchcheck-verification-row').forEach((row, index) => {
      if (index < 7) row.style.display = 'none';
      else {
        row.style.padding = '4px 8px';
        row.style.minHeight = '38px';
      }
    });
    element.style.maxHeight = '760px';
    element.style.overflowY = 'auto';
    element.scrollTop = 0;
  });
  await page.waitForTimeout(250);
  await annotate(page, [
    { n: 1, selector: '.batchcheck-verification-row:nth-child(8)' },
    { n: 2, selector: '.batchcheck-verification-row:nth-child(10)' },
    { n: 3, selector: '.batchcheck-verification-row:nth-child(11)' },
    { n: 4, selector: '.batchcheck-verification-row:nth-child(13)' },
    { n: 5, selector: '.batchcheck-verification-row:nth-child(15)' },
    { n: 6, selector: '.batchcheck-verification-row:nth-child(16)' },
    { n: 7, selector: '#batch-check-confirm-btn' },
    { n: 8, selector: '[data-close-batch-check-verify]' }
  ], 'Product Verification Bottom');
  await capture(page, '09-product-verification-popup-bottom.png');

  await setState(page, `
    currentLogin = { user: 'batch.checker', role: 'Batch Checker' };
    ensureRpExampleWorkflows();
    rpPackWorkflows['C13719'].status = 'RPi Approved';
    rpApprovalSignoffs['C13719'] = { user: 'rp.user', role: 'Responsible Person', dateTime: '17 Jul 2026, 11:00:00' };
    batchCheckerSelectedPo = 'C13719';
    batchCheckerDashboardOpen = true;
    selectedBatchCheckerRowKey = 0;
    renderStage('batch-checker');
    const rows = getBatchCheckerRows();
    const row = rows[0];
    const rowKey = getBatchCheckerRowKey(row);
    batchCheckerCheckedRows[rowKey] = true;
    batchCheckerVerifiedRows[rowKey] = { checker: 'batch.checker', role: 'Batch Checker', date: '17 Jul 2026', time: '11:20:00' };
    openGeneratePclPopup();
  `);
  await annotate(page, [
    { n: 1, selector: '#generate-pcl-title' },
    { n: 2, selector: '#pcl-sheet-container .pcl-row', index: 0 },
    { n: 3, selector: '#pcl-sheet-container .pcl-checkbox', index: 0 },
    { n: 4, selector: '#pcl-sheet-container span', match: 'Line clearance by PCL' },
    { n: 5, selector: '#pcl-clearance-submit-btn' },
    { n: 6, selector: '.confirm-actions [data-close-generate-pcl]' }
  ], 'PCL Preview Top');
  await capture(page, '08-pcl-preview.png');
  const pclBody = page.locator('#generate-pcl-modal .confirm-body');
  await pclBody.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await page.waitForTimeout(250);
  await annotate(page, [
    { n: 1, selector: '#pcl-sheet-container span', match: 'Manufacturer:' },
    { n: 2, selector: '#pcl-sheet-container span', match: 'Manufacturer Address:' },
    { n: 3, selector: '#pcl-sheet-container span', match: 'Foreign ECMA Holder:' },
    { n: 4, selector: '#pcl-sheet-container span', match: 'Foreign leaflet Date:' },
    { n: 5, selector: '#pcl-sheet-container div', match: 'Any Comments:' },
    { n: 6, selector: '#pcl-sheet-container span', match: 'Checks carried out by:' },
    { n: 7, selector: '#pcl-clearance-submit-btn' },
    { n: 8, selector: '.confirm-actions [data-close-generate-pcl]' }
  ], 'PCL Preview Bottom');
  await capture(page, '10-pcl-preview-bottom.png');

  await browser.close();
  console.log(`CAPTURED=${outputDir}`);
})();
