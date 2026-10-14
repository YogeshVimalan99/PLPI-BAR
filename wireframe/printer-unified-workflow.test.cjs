const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1636, height: 982 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
    await page.locator('#login-password').fill('printer-test');
    await page.locator('#login-submit').click();
    await page.locator('[data-login-stage="label-printing"]').first().click();
    assert(await page.locator('.printer-list-search').isVisible(), 'Printer opens directly to its work queue');
    assert.equal((await page.locator('.label-printing-layout .sub-window-title').textContent()).trim(), 'Printing Stage');
    const queueBounds = await page.evaluate(() => {
      const windowBox = document.querySelector('.label-printing-layout .bns-window').getBoundingClientRect();
      const searchBox = document.querySelector('.label-printing-layout .printer-list-search').getBoundingClientRect();
      return { windowLeft: windowBox.left, windowRight: windowBox.right, searchLeft: searchBox.left, searchRight: searchBox.right };
    });
    assert(queueBounds.searchLeft >= queueBounds.windowLeft + 8, 'Search is inset from the left edge');
    assert(queueBounds.searchRight <= queueBounds.windowRight - 8, 'Search remains inside the right edge');
    assert.equal(await page.locator('.printer-option').count(), 0, 'No module cards on entry');

    const batches = await page.evaluate(() => {
      const reboxing = bnsProducts.find(product => product.routeType === 'Reboxing');
      const relabelling = bnsProducts.find(product => product.routeType === 'Relabelling' && product.brailleRequired);
      if (!reboxing || !relabelling) throw new Error('Both printer routes need sample batches');
      generatedBatchNumbers = [reboxing.batch, relabelling.batch];
      printerSection = 'label-list';
      renderStage('label-printing');
      return { reboxing: reboxing.batch, relabelling: relabelling.batch };
    });

    assert.equal(await page.locator('.printer-option').count(), 0, 'Four module cards are removed');
    assert.equal(await page.locator('[data-printer-search]').count(), 2, 'Original queue search fields are retained');
    assert.equal(await page.locator('[data-open-label-print]').count(), 2, 'One queue holds both routes');
    if (process.argv.includes('--screenshot')) {
      const queueScreenshot = path.join(os.tmpdir(), 'plpi-printer-work-queue-qa.png');
      await page.screenshot({ path: queueScreenshot, fullPage: true });
      console.log(queueScreenshot);
    }

    await page.evaluate(batch => {
      const product = bnsProducts.find(item => item.batch === batch);
      const labels = getLabelRequirements(product).map(item => item.label);
      labelPrintRecords[batch] = {
        finalized: true,
        itemPrintTotals: { 'Carton Label': 1 },
        itemsPrinted: labels,
        itemCompletions: Object.fromEntries(labels.map(label => [label, { user: 'printer.user', dateTime: '24 Jun 2026, 10:30:00', status: 'Printed' }]))
      };
      persistLabelPrintRecords();
    }, batches.reboxing);
    await page.locator(`[data-open-label-print="${batches.reboxing}"]`).click();
    assert(await page.locator('#reboxing-form-modal .reboxing-form-card').isVisible(), 'Editable reboxing form opens as the popup');
    assert.equal(await page.evaluate(batch => getUnifiedPrinterProgress(bnsProducts.find(product => product.batch === batch)).labelsDone, batches.reboxing), false, 'Inferred legacy label completion is removed');
    const reboxingField = page.locator('#reboxing-form-modal [data-ps-section="receivedAs"][data-ps-field="ecma"]');
    assert(await reboxingField.isEnabled(), 'Incomplete form stays editable despite earlier print records');
    await reboxingField.fill('TEST-ECMA');
    assert.equal(await page.evaluate(batch => changeOfPackSizeData[batch].receivedAs.ecma, batches.reboxing), 'TEST-ECMA', 'Entered form data is saved');
    assert.equal(await page.locator('#stage-work-content .reboxing-form-card').count(), 0, 'Form is no longer inline');
    if (process.argv.includes('--screenshot')) {
      const promptScreenshot = path.join(os.tmpdir(), 'plpi-reboxing-form-prompt-qa.png');
      await page.screenshot({ path: promptScreenshot });
      console.log(promptScreenshot);
    }
    assert.equal(await page.locator('.label-sidebar-documents [data-view-reboxing-form]').count(), 1, 'Reboxing form is in Batch Documents');
    assert(await page.locator('[data-print-generated-bar]').isDisabled());
    assert(await page.locator('[data-print-continuation-page]').first().isDisabled());
    assert.equal(await page.locator('.unified-printing-table').count(), 1, 'All work stays in one table');
    assert.equal(await page.locator('.label-table-section .label-workflow-section-title').count(), 0, 'Removed table heading and helper text');
    assert.equal(await page.locator('.unified-printing-footer > span').count(), 0, 'Removed footer instruction');
    assert.equal(await page.locator('.unified-printing-footer [data-label-batch-print-done]').count(), 1, 'Print Done remains in the footer');
    assert.equal(await page.locator('.printer-stage-divider').count(), 0, 'No stage partitions interrupt the table');
    assert(await page.locator('[data-label-batch-print-done]').isDisabled());
    assert(await page.locator('[data-preview-type="leaflet"][data-unified-print]').isDisabled());
    assert.equal(await page.evaluate(() => getPreAssemblyProducts().length), 0, 'No premature Pre Assembly handoff');
    assert(await page.locator('[data-reboxing-popup-continue]').isDisabled());
    await page.locator('#reboxing-form-modal [data-ps-sign="receivedAs"]').click();
    assert(await page.locator('[data-unified-print][data-preview-type="label"]').first().isDisabled());
    await page.locator('#reboxing-form-modal [data-ps-sign="assembledAs"]').click();
    assert(await page.locator('[data-reboxing-popup-continue]').isEnabled());
    await page.locator('#reboxing-form-modal [data-ps-clear-sig="assembledAs"]').click();
    assert(await page.locator('[data-reboxing-popup-continue]').isDisabled(), 'Clearing a signature restores the gate');
    await page.locator('#reboxing-form-modal [data-ps-sign="assembledAs"]').click();
    await page.locator('[data-reboxing-popup-continue]').click();
    assert.equal(await page.locator('#reboxing-form-modal').count(), 0);
    assert.equal(await page.evaluate(batch => getUnifiedPrinterProgress(bnsProducts.find(product => product.batch === batch)).labelsDone, batches.reboxing), false, 'Continue Printing does not complete label lines');
    await page.evaluate(batch => {
      labelPrintedBatchNumbers.push(batch);
      labelPrintRecords[batch].itemsPrinted = { 'Carton Label': true };
      persistLabelPrintRecords();
      renderStage('label-printing');
    }, batches.reboxing);
    assert.equal(await page.evaluate(batch => getUnifiedPrinterProgress(bnsProducts.find(product => product.batch === batch)).labelsDone, batches.reboxing), false, 'A batch-level legacy flag cannot complete label lines');
    assert(Array.isArray(await page.evaluate(batch => labelPrintRecords[batch].itemsPrinted, batches.reboxing)), 'Legacy record is normalised for later printing');
    await page.locator('[data-label-back-queue]').click();
    await page.locator(`[data-open-label-print="${batches.reboxing}"]`).click();
    assert.equal(await page.locator('#reboxing-form-modal').count(), 0, 'Completed form does not reopen automatically');
    assert(await page.locator('[data-unified-print][data-preview-type="label"]').first().isEnabled());
    assert(await page.locator('[data-preview-type="leaflet"][data-unified-print]').isEnabled(), 'Leaflets do not wait for labels');
    assert(await page.locator('[data-print-cartons]').isEnabled(), 'Carton issue does not wait for leaflets');
    assert(await page.locator('[data-leaflet-folding-done]').isEnabled(), 'Folding does not wait for printing');
    assert(await page.locator('[data-print-continuation-page]').first().isEnabled());
    await page.locator('[data-view-reboxing-form]').click();
    assert(await page.locator('#reboxing-form-modal .reboxing-form-card').isVisible(), 'Batch Documents opens the same form popup');
    await page.locator('[data-reboxing-popup-close]').click();
    if (process.argv.includes('--screenshot')) {
      const detailScreenshot = path.join(os.tmpdir(), 'plpi-printer-batch-detail-qa.png');
      const tableScreenshot = path.join(os.tmpdir(), 'plpi-printer-unified-table-qa.png');
      await page.screenshot({ path: detailScreenshot, fullPage: true });
      await page.locator('.unified-printing-table').screenshot({ path: tableScreenshot });
      console.log(detailScreenshot);
      console.log(tableScreenshot);
    }

    await page.locator('[data-print-cartons]').click();
    await page.locator('[data-leaflet-folding-done]').click();
    assert(await page.locator('#app-confirm-modal').isVisible(), 'Folding uses the standard confirmation');
    assert.match(await page.locator('#app-confirm-header').textContent(), /Mark leaflet folding as done/);
    assert.equal(await page.locator('#app-confirm-modal .app-confirm-icon').count(), 1, 'Standard confirmation layout is retained');
    assert.equal(await page.evaluate(batch => Boolean(leafletFoldingRecords[batch]), batches.reboxing), false, 'Opening confirmation does not complete folding');
    await page.locator('#app-confirm-modal .confirm-actions [data-app-confirm-no]').click();
    assert(await page.locator('#app-confirm-modal').isHidden(), 'Folding confirmation can be cancelled');
    assert(await page.locator('[data-leaflet-folding-done]').isEnabled(), 'Cancelled folding remains pending');
    await page.locator('[data-leaflet-folding-done]').click();
    await page.locator('#app-confirm-yes').click();
    assert(await page.locator('[data-label-batch-print-done]').isDisabled(), 'Early carton and folding completion cannot release batch');
    assert.equal(await page.locator('.unified-printing-table [data-print-cartons]').count(), 0);
    const completedColour = await page.locator('.unified-printing-table .label-print-row-complete').first().locator('td').first().evaluate(cell => getComputedStyle(cell).backgroundColor);
    assert.equal(completedColour, 'rgb(201, 234, 214)', 'Completed lines are green');

    await page.evaluate(batch => {
      const product = bnsProducts.find(item => item.batch === batch);
      const labels = getLabelRequirements(product).map(item => item.label);
      labelPrintRecords[batch] = { itemsPrinted: labels, itemCompletions: Object.fromEntries(labels.map(label => [label, { user: 'test', dateTime: 'now' }])) };
      persistLabelPrintRecords();
      renderStage('label-printing');
    }, batches.reboxing);
    assert(await page.locator('[data-preview-type="leaflet"][data-unified-print]').isEnabled());
    assert(await page.locator('[data-label-batch-print-done]').isDisabled());

    await page.evaluate(batch => {
      const product = bnsProducts.find(item => item.batch === batch);
      const leaflets = getLeafletRequirements(product).map(item => item.label);
      leafletPrintRecords[batch] = { itemsPrinted: leaflets, itemCompletions: Object.fromEntries(leaflets.map(label => [label, { user: 'test', dateTime: 'now' }])) };
      persistLeafletPrintRecords();
      renderStage('label-printing');
    }, batches.reboxing);
    assert(await page.locator('[data-label-batch-print-done]').isEnabled());
    assert.equal(await page.evaluate(() => getPreAssemblyProducts().length), 0, 'Completing all lines still needs final Print Done');
    await page.locator('[data-label-batch-print-done]').click();
    assert.deepEqual(await page.evaluate(() => getPreAssemblyProducts().map(product => product.batch)), [batches.reboxing]);
    assert.equal(await page.locator(`[data-open-label-print="${batches.reboxing}"]`).count(), 0, 'Completed batch leaves Printer work queue');
    assert.equal(await page.evaluate(batch => labelPrintRecords[batch].printingStatus, batches.reboxing), 'Completed');
    await page.reload();
    assert.deepEqual(await page.evaluate(() => getPreAssemblyProducts().map(product => product.batch)), [batches.reboxing], 'Completed route survives refresh');
    assert(await page.evaluate(batch => getUnifiedPrinterProgress(bnsProducts.find(product => product.batch === batch)).allDone, batches.reboxing), 'Every completed row survives refresh');
    await page.locator('#login-password').fill('printer-test');
    await page.locator('#login-submit').click();
    await page.evaluate(batch => {
      generatedBatchNumbers = [batch];
      printerSection = 'label-list';
      renderStage('label-printing');
    }, batches.relabelling);

    await page.locator(`[data-open-label-print="${batches.relabelling}"]`).click();
    assert.equal(await page.locator('.printer-stage-divider').count(), 0);
    assert.equal(await page.locator('[data-print-cartons]').count(), 0, 'Carton issue is reboxing-only');
    assert(await page.locator('[data-label-batch-print-done]').isDisabled());
    assert(await page.locator('[data-preview-type="braille"][data-unified-print]').first().isEnabled(), 'Braille does not wait for leaflet printing');
    assert(await page.locator('[data-leaflet-folding-done]').isEnabled());
    await page.locator('[data-leaflet-folding-done]').click();
    assert(await page.locator('#app-confirm-modal').isVisible());
    await page.locator('#app-confirm-yes').click();
    assert(await page.locator('[data-label-batch-print-done]').isDisabled());
    await page.evaluate(batch => {
      const product = bnsProducts.find(item => item.batch === batch);
      const labels = getLabelRequirements(product).map(item => item.label);
      const leaflets = getLeafletRequirements(product).map(item => item.label);
      const braille = getBrailleRequirements(product).map(item => item.label);
      labelPrintRecords[batch] = { itemsPrinted: labels, itemCompletions: Object.fromEntries(labels.map(label => [label, { user: 'test', dateTime: 'now' }])) };
      leafletPrintRecords[batch] = { itemsPrinted: leaflets, itemCompletions: Object.fromEntries(leaflets.map(label => [label, { user: 'test', dateTime: 'now' }])) };
      savePrintRecord('braille', batch, { itemsPrinted: braille, itemCompletions: Object.fromEntries(braille.map(label => [label, { user: 'test', dateTime: 'now' }])) });
      persistLabelPrintRecords();
      persistLeafletPrintRecords();
      renderStage('label-printing');
    }, batches.relabelling);
    assert(await page.locator('[data-label-batch-print-done]').isEnabled());
    await page.locator('[data-label-batch-print-done]').click();
    assert.deepEqual(await page.evaluate(() => getPreAssemblyProducts().map(product => product.batch).sort()), [batches.reboxing, batches.relabelling].sort());
    assert.equal(await page.locator(`[data-open-label-print="${batches.relabelling}"]`).count(), 0, 'Relabelling batch also leaves Printer queue');
    assert.deepEqual(errors, [], 'No browser errors');
    console.log('Printer unified workflow test passed');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
