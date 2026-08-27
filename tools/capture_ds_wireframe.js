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
  await page.locator('.packing-grid-shell.tall').first().evaluate((element) => { element.scrollLeft = 1020; });
  await highlight(page, ['VERIFY & PRINT', 'LOG']);
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
  await capture(page, '04-rpi-task-checklist-top.png');
  const checklistPanel = page.locator('.rp-task-checklist-scroll-panel');
  if (await checklistPanel.count()) {
    await checklistPanel.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    await page.waitForTimeout(250);
  }
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
  await capture(page, '07-product-verification-popup.png');

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
  await capture(page, '08-pcl-preview.png');

  await browser.close();
  console.log(`CAPTURED=${outputDir}`);
})();
