const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const captureDirectory = process.env.PLPI_CAPTURE_SCREENSHOTS === '1'
  ? fs.mkdtempSync(path.join(os.tmpdir(), 'plpi-batch-checker-'))
  : null;
async function captureScreenshot(target, fileName) {
  if (captureDirectory) await target.screenshot({ path: path.join(captureDirectory, fileName) });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
    page.setDefaultTimeout(10000);
    await page.locator('#login-password').fill('test-confirmation');
    await page.locator('#login-submit').click();
    await page.evaluate(() => {
      window.print = () => {
        window.testPrintCount = (window.testPrintCount || 0) + 1;
        window.testDirectPrintContent = document.querySelector('#batchchecker-direct-print')?.textContent || '';
      };
      renderStage('batch-checker');
    });
    assert.equal(await page.locator('[data-batchchecker-open-po]').count(), 0, 'No PO queue on landing');
    assert.equal(await page.locator('[data-batchchecker-row-index]').count(), 0, 'No products before search');
    assert.equal(await page.locator('#batchchecker-po-search').inputValue(), 'C13719');
    assert.equal(await page.locator('[data-batchchecker-filter]').count(), 5, 'Earlier supplier/invoice/contract/batch/product fields restored');
    await captureScreenshot(page, 'batch-checker-landing-test.png');
    await page.locator('#batchchecker-po-search').fill('C13777');
    await page.locator('#batchchecker-po-search').press('Enter');
    assert.equal(await page.locator('[data-batchchecker-row-index]').count(), 4);
    assert.equal(await page.locator('.batchchecker-live-header').count(), 0, 'No PO dashboard/back-to-search banner');
    assert.deepEqual(await page.locator('.batchchecker-selected-actions button').evaluateAll(buttons => buttons.map(button => button.id)), ['batchchecker-btn-check', 'batchchecker-generate-pcl', 'batchchecker-final-check', 'batchchecker-generate-pcl-cold', 'batchchecker-print-box']);
    await page.locator('[data-batchchecker-row-select="0"]').check();
    assert(await page.locator('#batchchecker-generate-pcl').isDisabled());
    await page.locator('#batchchecker-btn-check').click();
    await page.locator('[data-batchcheck-field-check="0"]').check();
    await page.locator('#batch-check-confirm-btn').click();
    assert(await page.locator('#batchchecker-issue-dialog').isVisible(), 'Incomplete save asks for a comment');
    await captureScreenshot(page.locator('#batchchecker-issue-dialog'), 'batch-checker-issue-popup-test.png');
    await page.locator('[data-save-batchchecker-issue]').click();
    assert((await page.locator('#batchchecker-issue-error').innerText()).includes('Enter a comment'));
    assert.equal(await page.evaluate(() => Boolean(batchCheckerVerifiedRows[getBatchCheckerRowKey(getBatchCheckerRows()[0])])), false, 'No save without mandatory comment');
    await page.locator('[data-cancel-batchchecker-issue]').last().click();
    assert(await page.locator('[data-batchcheck-field-check="0"]').isChecked(), 'Cancel comment prompt preserves draft checks');
    await page.locator('#batch-check-confirm-btn').click();
    await page.locator('#batchchecker-issue-comment').fill('Invoice and expiry need correction.');
    await page.locator('[data-save-batchchecker-issue]').click();
    assert.equal(await page.locator('[data-batchchecker-summary]').count(), 0, 'No Batch Summary button in Batch Checker');
    assert(await page.evaluate(() => renderBatchVerificationSummary(getBatchCheckerRows()[0]).includes('Invoice and expiry need correction.')));
    const originalBnsCount = await page.evaluate(() => bnsProducts.length);
    assert(await page.locator('#batchchecker-generate-pcl').isDisabled(), 'Incomplete verification remains pending');
    assert(await page.locator('#batchchecker-final-check').isDisabled());
    assert.equal(await page.evaluate(() => bnsProducts.length), originalBnsCount);
    await page.locator('#batchchecker-btn-check').click();
    assert(await page.locator('[data-batchcheck-field-check="0"]').isChecked(), 'Saved progress resumes where the user left');
    assert(!(await page.locator('[data-batchcheck-field-check="8"]').isChecked()));
    for (const checkbox of await page.locator('[data-batchcheck-field-check]').all()) await checkbox.check();
    await page.locator('#batch-check-confirm-btn').click();
    assert.equal(await page.locator('#batchchecker-issue-dialog').count(), 0, 'Complete verification saves without comment popup');
    await page.locator('#batchchecker-generate-pcl').click();
    assert(await page.locator('[data-pcl-check-key="expiry"]').isChecked());
    assert.equal((await page.locator('#batchchecker-pcl-comments').innerText()).trim(), '', 'Old issue remains in summary, not the new optional PCL comment');
    assert(!(await page.locator('#pcl-clearance-submit-btn').isDisabled()), 'No comment required for complete verification');
    await page.locator('#batchchecker-pcl-comments').fill('Optional PCL note after team correction.');
    await page.locator('#pcl-clearance-submit-btn').click();
    assert.equal(await page.evaluate(() => pclBarRecords[getBatchCheckerRows()[0].batchNo].comments), 'Optional PCL note after team correction.');
    assert.equal(await page.evaluate(() => bnsProducts.length), originalBnsCount, 'PCL alone does not release');
    assert(!(await page.locator('#batchchecker-final-check').isDisabled()));
    await page.locator('[data-batchchecker-row-select="1"]').check();
    assert(await page.locator('#batchchecker-generate-pcl').isDisabled(), 'Other lines require their own saved verification');
    assert(await page.locator('#batchchecker-final-check').isDisabled());
    await page.locator('[data-batchchecker-row-select="0"]').check();
    await page.locator('#batchchecker-final-check').click();
    await page.locator('#batchchecker-completion-password').fill('wrong-password');
    await page.locator('[data-confirm-batchchecker-completion]').click();
    assert((await page.locator('#batchchecker-completion-error').innerText()).includes('does not match'));
    assert.equal(await page.evaluate(() => bnsProducts.length), originalBnsCount);
    await page.locator('#batchchecker-completion-password').fill('test-confirmation');
    await page.locator('[data-confirm-batchchecker-completion]').click();
    assert.equal(await page.evaluate(() => bnsProducts.length), originalBnsCount + 1);
    assert.equal(await page.evaluate(() => window.testPrintCount), 1);
    assert((await page.evaluate(() => window.testDirectPrintContent)).includes('PX8416'));
    assert(await page.locator('#print-preview-modal').isHidden(), 'Password confirmation prints without opening application preview');
    assert.equal(await page.locator('#batchchecker-direct-print').count(), 0, 'Temporary print content is cleaned up');
    assert(await page.locator('#batchchecker-btn-check').isDisabled());
    assert(await page.locator('#batchchecker-generate-pcl').isDisabled());
    assert(await page.locator('#batchchecker-final-check').isDisabled());
    assert(await page.locator('[data-batchchecker-split="0"]').isDisabled());
    assert(!(await page.locator('#batchchecker-print-box').isDisabled()));
    assert.equal(await page.locator('.batchchecker-completed-row').count(), 1);
    const completed = await page.evaluate(() => {
      const row = getBatchCheckerRows()[0];
      return { history: renderBatchVerificationSummary(row), downstreamSummary: renderQpSourceDocument(bnsProducts.at(-1), 'batch-summary'), saveBlocked: !saveBatchCheckerVerification(row, Array(15).fill(false), 'illegal edit') };
    });
    assert(completed.history.includes('Invoice and expiry need correction.'));
    assert(completed.history.includes('Corrected and verified'));
    assert(completed.downstreamSummary.includes('Invoice and expiry need correction.'));
    assert(completed.saveBlocked);
    await page.locator('#batchchecker-print-box').click();
    await page.locator('#batchchecker-reprint-reason').fill('Replacement for damaged label');
    await page.locator('#batchchecker-reprint-confirm').click();
    assert.equal(await page.evaluate(() => bnsProducts.length), originalBnsCount + 1, 'Reprint does not duplicate handoff');
    assert(await page.locator('#print-preview-modal').isHidden(), 'Label reprint also skips application preview');
    await captureScreenshot(page, 'batch-checker-completed-test.png');
    await page.locator('#batchchecker-po-search').fill('C13719');
    await page.locator('[data-batchchecker-search-btn]').click();
    const missingEcma = await page.evaluate(() => ({
      exampleVisible: getBatchCheckerRows().some(row => row.partNo === 'ESLUMEYE30'),
      allHaveEcma: getBatchCheckerRows().every(row => Boolean(String(row.ecma || '').trim()))
    }));
    assert.equal(missingEcma.exampleVisible, false, 'Packing line with no selected ECMA must not appear in Batch Checker');
    assert.equal(missingEcma.allHaveEcma, true);
    await page.evaluate(() => {
      packingListSearch = 'C13719'; packingListSelectedPo = 'C13719'; packingListMode = 'view'; renderStage('packing-list');
    });
    const exampleKey = await page.evaluate(() => getPackingLineKey(getPackingListRows().find(row => row.orderNo === 'C13719' && row.partNo === 'ESLUMEYE30')));
    const ecma = page.locator(`[data-packing-row-input="ecma"][data-packing-row-key="${exampleKey}"]`);
    assert.equal(await ecma.inputValue(), '');
    assert.equal(await ecma.locator('option').count(), 5, 'Placeholder plus four product ECMA options');
    await page.locator(`[data-pl-verify-print="${exampleKey}"]`).click();
    assert(await page.locator('#system-popup-modal').isVisible());
    assert((await page.locator('#system-popup-modal').innerText()).includes('Select ECMA from the product dropdown before verifying the line.'));
    await page.locator('#system-popup-modal .confirm-actions [data-system-popup-close]').click();
    await ecma.selectOption('ECMA-DEMO-03');
    assert.equal(await ecma.inputValue(), 'ECMA-DEMO-03');
    await page.evaluate(() => renderStage('batch-checker'));
    await page.locator('#batchchecker-po-search').fill('C13719');
    await page.locator('[data-batchchecker-search-btn]').click();
    const exampleIndex = await page.evaluate(() => getBatchCheckerRows().findIndex(row => row.partNo === 'ESLUMEYE30'));
    assert(exampleIndex >= 0);
    await page.locator(`[data-batchchecker-row-select="${exampleIndex}"]`).check();
    assert.equal(await page.evaluate(() => getBatchCheckerRows().find(row => row.partNo === 'ESLUMEYE30').ecma), 'ECMA-DEMO-03');
    await page.evaluate(() => {
      packingListSearch = 'C13719'; packingListSelectedPo = 'C13719'; packingListMode = 'view'; renderStage('packing-list');
    });
    await ecma.selectOption('ECMA-DEMO-02');
    await page.evaluate(() => renderStage('batch-checker'));
    await page.locator('[data-batchchecker-search-btn]').click();
    assert.equal(await page.evaluate(() => getBatchCheckerRows().find(row => row.partNo === 'ESLUMEYE30').ecma), 'ECMA-DEMO-02', 'Packing List selection updates the existing Batch Checker line');
    await page.evaluate(() => {
      packingListSearch = 'C13719'; packingListSelectedPo = 'C13719'; packingListMode = 'view'; renderStage('packing-list');
    });
    await ecma.selectOption('');
    await page.evaluate(() => renderStage('batch-checker'));
    await page.locator('[data-batchchecker-search-btn]').click();
    assert.equal(await page.evaluate(() => getBatchCheckerRows().some(row => row.partNo === 'ESLUMEYE30')), false, 'Clearing the source ECMA withdraws the line');
    await page.locator('#batchchecker-po-search').fill('');
    await page.locator('[data-batchchecker-filter="supplier"]').fill('Abimed');
    await page.locator('[data-batchchecker-filter="mfgLot"]').fill('PX8416');
    await page.locator('[data-batchchecker-filter="invoice"]').fill('2904');
    await page.locator('[data-batchchecker-filter="mfgLot"]').press('Enter');
    assert.equal(await page.locator('[data-batchchecker-row-index]').count(), 1, 'Search by supplier, invoice and Batch No without PO');
    assert.equal(await page.evaluate(() => getBatchCheckerRows()[0].orderNo), 'C13777');
    await page.locator('[data-batchchecker-filter="invoice"]').fill('NO-MATCH');
    await page.locator('[data-batchchecker-search-btn]').click();
    assert.equal(await page.locator('[data-batchchecker-row-index]').count(), 0, 'Invoice filter searches invoice values');
    await captureScreenshot(page, 'batch-checker-search-test.png');
    assert.deepEqual(errors, [], 'No runtime errors');
    console.log('PASS: blank PO search, issue/correction history, saved PCL checks, password-gated handoff, locked completion, reprint, and ECMA selection.');
    if (captureDirectory) console.log(`Screenshots: ${captureDirectory}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
