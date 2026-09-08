const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const source = fs.readFileSync(__dirname + '/app.js', 'utf8');
function functionSource(name, next) {
  const start = source.indexOf('function ' + name + '(');
  return source.slice(start, source.indexOf('function ' + next + '(', start));
}
const context = {
  htmlSafe: value => String(value ?? ''), batchCheckerMfgList: [], batchCheckerDb: [],
  getMfgLotNo: row => row.mfgLotNo, getBatchCheckerVerificationItems: () => [],
  getBatchCheckerLineChecks: () => [], getBatchCheckerRowKey: row => row.batchNo,
  getPackingLineUserComment: row => row.comments || '', postAssemblyRecords: {},
  getGeneratedBarTotalPages: () => 14, pclBarRecords: {}, batchCheckerVerifiedRows: {},
  batchCheckerPclGeneratedRows: {}, batchCheckerPclRegulatoryComments: {},
  assemblyRecords: {}, generatedPackingListSnapshots: {}, rpPackWorkflows: {},
  qpScenarioFixtures: [],
  document: { createElement: () => ({ innerHTML: '', content: { querySelectorAll: () => [] } }) }
};
vm.createContext(context);
for (const [name, next] of [
  ['renderBatchCheckerPclPages', 'openGeneratePclPopup'],
  ['renderGeneratedPackingListSheet', 'openPackingListPreview'],
  ['renderAssemblyReconciliationRows', 'renderAssemblyRoomWork'],
  ['getQpDocumentPack', 'getQpDocumentReview'],
  ['ensureQpUpstreamDemoRecords', 'renderQpSourceDocument'],
  ['renderQpSourceDocument', 'getQpDummyEvidence'],
  ['getQpDummyEvidence', 'getQpAutomaticResults'],
  ['getQpReferenceComparisons', 'renderQpReferenceComparisons'],
  ['getQpAutomaticResults', 'renderQpSelectedDashboard']
]) vm.runInContext(functionSource(name, next), context);
const product = { batch: 'B1', product: 'Product', pl: 'PL1' };
assert.deepStrictEqual(Array.from(context.getQpDocumentPack(product), doc => doc.id), [
  'po-packing-list', 'supplier-declaration', 'supplier-packing-list', 'supplier-invoice',
  'temperature-record', 'pcl', 'approved-artwork', 'batch-summary', 'release-log',
  'ipc-photos', 'reconciliation', 'completed-bar'
]);
for (const id of ['pcl', 'po-packing-list', 'reconciliation']) {
  assert(!context.renderQpSourceDocument(product, id).includes('No saved'));
}
assert.equal(context.getQpAutomaticResults(product)[4].status, 'Passed');
assert.equal(context.getQpAutomaticResults(product)[7].status, 'Passed');
const row = { batchNo: 'B1', orderNo: 'PO1', coldChain: 'Yes', description: 'Product', qty: '10' };
context.pclBarRecords.B1 = { sourceRow: row, completedBy: 'checker.one', completedAt: 'saved date', comments: 'Check note', checks: [] };
context.generatedPackingListSnapshots.PO1 = [row];
delete context.generatedPackingListSnapshots['QP-B1'];
context.rpPackWorkflows.PO1 = { packingListGeneratedBy: 'packing.one', packingListGeneratedAt: 'original date' };
context.assemblyRecords.B1 = { qtyReceived: '10', usedQty: '10', damagedQty: '0', discrepancyQty: '0', comments: 'Assembly note', signedTabs: { recon: { user: 'assembly.one', dateTime: 'signed date' } }, reconciliationRows: [{ qtyReceived: '20', usedQty: '20', damagedQty: '0', discrepancyQty: '0' }] };
const before = JSON.stringify([context.pclBarRecords, context.generatedPackingListSnapshots, context.assemblyRecords, context.rpPackWorkflows]);
const pcl = context.renderQpSourceDocument(product, 'pcl');
assert(pcl.includes('Check note') && pcl.includes('checker.one') && pcl.includes('CHECKLIST CONTINUATION'));
const packing = context.renderQpSourceDocument(product, 'po-packing-list');
assert(packing.includes('packing.one') && packing.includes('original date'));
assert(!packing.includes('data-sign-po-packing-list'));
const recon = context.renderQpSourceDocument(product, 'reconciliation');
assert(recon.includes('Assembly note') && recon.includes('assembly.one') && recon.includes('<td>20</td>'));
assert(!recon.includes('<input'));
assert.equal(JSON.stringify([context.pclBarRecords, context.generatedPackingListSnapshots, context.assemblyRecords, context.rpPackWorkflows]), before);
assert.equal(context.getQpAutomaticResults(product)[4].status, 'Deviation');
assert.equal(context.getQpAutomaticResults(product)[7].status, 'Passed');
context.assemblyRecords.B1.reconciliationRows[0].usedQty = '19';
assert.equal(context.getQpAutomaticResults(product)[7].status, 'Deviation');
console.log('PASS: queue order, shared templates, saved records, read-only previews, missing/deviation checks.');
context.qpReleaseRecords = {};
context.qpSelectedProduct = product;
context.currentLogin = { user: 'qp.test' };
context.getAssemblyAuditTimestamp = () => '08 Sep 2026, 14:00';
context.persistQpReleaseRecords = () => {};
vm.runInContext(functionSource('getQpCheckOverride', 'updateQpReleaseAvailability'), context);
assert.equal(context.areAllQpDashboardDocumentsVerified(product), false);
context.getQpAutomaticResults(product).forEach((check, index) => {
  if (check.status !== 'Passed') context.acceptQpCheckOverride(index);
});
assert.equal(context.areAllQpDashboardDocumentsVerified(product), true);
const accepted = Object.values(context.qpReleaseRecords.B1.checkOverrides);
assert(accepted.length > 0 && accepted.every(item => item.comment === '' && item.user === 'qp.test'));
assert(context.qpReleaseRecords.B1.auditTrail.every(item => item.originalFinding));
context.pclBarRecords.B1.comments = 'A different finding';
assert.equal(context.areAllQpDashboardDocumentsVerified(product), false);
console.log('PASS: optional-comment overrides, audit records, approval gate, changed-finding invalidation.');
vm.runInContext(source.slice(source.indexOf('var qpScenarioFixtures = ['), source.indexOf('function ensureQpScenarioTestData()')), context);
for (const fixture of context.qpScenarioFixtures) {
  const batch = { batch: fixture.batch, qpScenario: fixture.batch, quantity: '300', product: fixture.name };
  const results = context.getQpAutomaticResults(batch);
  assert(results.every(check => check.status !== 'Pending'), fixture.batch + ' must not model missing upstream files');
  assert(!/missing|unavailable|incomplete document/i.test(fixture.name));
  for (const id of ['pcl', 'po-packing-list', 'reconciliation']) assert(!context.renderQpSourceDocument(batch, id).includes('No saved'));
}
console.log('PASS: all 20 QP scenarios contain upstream documents and only passed/deviation results.');
context.window = {};
const savedStorage = {};
context.localStorage = { getItem: key => savedStorage[key], setItem: (key, value) => { savedStorage[key] = value; } };
context.statusMessage = { textContent: '' };
context.getQpCertifiedDecisionTab = p => context.qpReleaseRecords[p.batch]?.decision === 'Certified' ? 'Approved' : 'Hold';
context.getQpReleaseLogId = () => 'REL1';
context.renderGeneratedBarDocument = () => '<section>Completed BAR</section>';
context.renderQpReleaseLogPaper = () => '<section>QP release log</section>';
vm.runInContext(functionSource('getBatchRecordStore', 'renderBatchDetails'), context);
assert.equal(context.archiveApprovedBatch(product), null);
context.qpReleaseRecords.B1.decision = 'Certified';
context.qpReleaseRecords.B1.user = 'qp.test';
const archived = context.archiveApprovedBatch(product);
assert.equal(archived.documents.length, 13);
assert(archived.documents.some(doc => doc.id === 'completed-bar'));
assert(archived.documents.some(doc => doc.id === 'qp-decision'));
assert(archived.documents.some(doc => doc.id === 'reconciliation'));
assert.equal(archived.approvedBy, 'qp.test');
context.pclBarRecords.B1.comments = 'Changed after approval';
assert.strictEqual(context.archiveApprovedBatch(product), archived);
delete context.window.plpiBatchRecords;
assert.equal(context.getBatchRecordStore().B1.documents.length, 13);
console.log('PASS: approved-only archive, document collection, immutable snapshot, local persistence.');
const referenceProduct = { batch: 'REFTEST', product: 'Reference test', barReferences: { label: 'REF123/V1', blister: 'BL123/V1', leaflet: 'LF123/V1', braille: 'BR123/V1', carton: 'CT123/V1' } };
assert(context.getQpReferenceComparisons(referenceProduct).every(row => row.matches));
for (const key of ['label', 'blister', 'leaflet', 'braille', 'carton']) {
  referenceProduct.ipcPhotoReferences = { [key]: 'REF123/V2' };
  const comparisons = context.getQpReferenceComparisons(referenceProduct);
  assert.equal(comparisons.filter(row => !row.matches).length, 1);
  assert.equal(context.getQpAutomaticResults(referenceProduct)[5].status, 'Deviation');
  const photo = context.getQpDummyEvidence(referenceProduct).photos[key][0];
  assert(decodeURIComponent(photo.data).includes('REF123/V2'));
}
assert(!source.includes('data-qp-run-system-checks>Recheck</button>'));
console.log('PASS: all five component references compare exact versions; photo text agrees; Recheck removed.');
// Exercise the real stage routing expressions, not just the archive renderer.
const stageSource = source.slice(source.indexOf('function renderStage(stageId)'));
const contentStart = stageSource.indexOf('document.querySelector("#stage-work-content").innerHTML =');
const contentEnd = stageSource.indexOf(';', contentStart);
const contentNode = { innerHTML: '' };
const routing = {
  stage: { id: 'batch-record' },
  document: { querySelector: selector => { assert.equal(selector, '#stage-work-content'); return contentNode; } },
  renderBatchRecordModule: () => '<section class="batch-record-module">Approved batch archive</section>',
  renderGenericStageWork: () => { throw new Error('Batch Record must not open the generic checklist'); },
  statusMessage: { textContent: '' }
};
vm.createContext(routing);
vm.runInContext(stageSource.slice(contentStart, contentEnd + 1), routing);
assert(contentNode.innerHTML.includes('batch-record-module'));
const statusStart = stageSource.indexOf('statusMessage.textContent =');
const statusEnd = stageSource.indexOf(';', statusStart);
vm.runInContext(stageSource.slice(statusStart, statusEnd + 1), routing);
assert.equal(routing.statusMessage.textContent, 'Batch Record opened — approved electronic batch records');
console.log('PASS: Batch Record routes into main content, not status text or generic checklist.');
context.bnsProducts = [{batch:'DONE'}, {batch:'WAIT'}, {batch:'ALLDONE'}];
context.preQpCheckedBatchNumbers = ['DONE','WAIT','ALLDONE'];
context.qpReleaseRecords = {DONE:{decision:'Certified'}, WAIT:{qpReady:true}, ALLDONE:{decision:'Certified'}};
context.qpReleasedBatchNumbers = [];
context.qpIdSearch = '';
context.qpBatchSearch = '';
context.qpStatusSearch = 'Approved'; // Removed filter must not affect the queue.
context.getQpReleaseLogId = batch => batch === 'ALLDONE' ? 'FINISHED' : 'MIXED';
vm.runInContext(functionSource('getQpReleaseGroups', 'getQpGroupStatus'), context);
const queue = context.getQpReleaseGroups();
assert.equal(queue.length, 1);
assert.equal(queue[0].relId, 'MIXED');
assert.deepStrictEqual(Array.from(queue[0].products, product => product.batch), ['WAIT']);
const cardsSource = functionSource('renderQpReleaseCardsDashboard', 'renderQpReleaseBatchList');
assert(!cardsSource.includes('data-qp-status-search'));
assert(cardsSource.includes('<span>Batches</span>'));
console.log('PASS: approved batches leave review queue; mixed groups retain remaining batches; status filter removed.');
