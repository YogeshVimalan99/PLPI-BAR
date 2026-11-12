const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(__dirname + '/app.js', 'utf8');
function functionSource(name, next) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf(`function ${next}(`, start);
  assert(start >= 0 && end > start, `Missing function ${name}`);
  return source.slice(start, end);
}

const workflows = {
  C101: { poNo: 'C101', mergeGroupId: 'G1', status: 'Signed Off', signoff: {}, rpDocumentsQueueCreated: true,
    documents: [{ name: 'Supplier Invoice', uploaded: true, fileName: 'C101_invoice.pdf' }] },
  C102: { poNo: 'C102', mergeGroupId: 'G1', status: 'Signed Off', signoff: {}, rpDocumentsQueueCreated: true,
    documents: [{ name: 'Supplier Invoice', uploaded: true, fileName: 'C102_invoice.pdf' }] },
  C103: { poNo: 'C103', status: 'Signed Off', signoff: {}, rpDocumentsQueueCreated: true, documents: [] }
};
const context = {
  rpPackWorkflows: workflows,
  rpApprovalComments: {},
  rpApprovalAnswers: { C101: { 'stock-suitable': 'N' } },
  rpApprovalSearch: '',
  rpApprovalSignoffs: {},
  currentLogin: { user: 'rp.test' },
  statusMessage: { textContent: '' },
  ensureRpExampleWorkflows() {},
  getRpMergePoNos(poNo) { return poNo === 'C101' || poNo === 'C102' ? ['C101', 'C102'] : [poNo]; },
  getRpMergePrimaryPo(poNo) { return poNo === 'C102' ? 'C101' : poNo; },
  isRpApprovalBypassed() { return false; },
  getPackingListRows() { return []; },
  renderGeneratedPackingListSheet() { return '<div>Generated list</div>'; },
  htmlSafe(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); },
  getAssemblyAuditTimestamp() { return '11 Nov 2026, 10:00'; },
  renderStage(stage) { assert.equal(stage, 'rp-pack'); }
};
vm.createContext(context);
for (const [name, next] of [
  ['completeRpFinalRejection', 'openCreateBarDialog'],
  ['getRpTaskFilteredPoKeys', 'getRpFinalRejectedPoKeys'],
  ['getRpFinalRejectedPoKeys', 'getPackingDocCounts'],
  ['renderRpApprovalExactPdfModal', 'buildRpRejectedDocumentPackPreview'],
  ['buildRpRejectedDocumentPackPreview', 'getLivePackingListRows']
]) vm.runInContext(functionSource(name, next), context);

assert.deepEqual(Array.from(context.getRpTaskFilteredPoKeys()), ['C101', 'C103']);
assert.deepEqual(Array.from(context.getRpFinalRejectedPoKeys()), []);
const rejection = context.completeRpFinalRejection('C101', 'Damaged packaging');
assert.deepEqual(Array.from(rejection.poNos), ['C101', 'C102']);
assert.equal(rejection.comment, 'Damaged packaging');
assert.equal(rejection.user, 'rp.test');
assert(rejection.includedFiles.includes('C101_invoice.pdf'));
assert(rejection.includedFiles.includes('C102_invoice.pdf'));
assert(rejection.includedFiles.includes(rejection.formFileName));
assert.equal(rejection.includedFiles[0], rejection.formFileName);
assert.equal(rejection.includedDocuments.length, 4);
assert.equal(rejection.formAnswers['stock-suitable'], 'N');
const packPreview = context.buildRpRejectedDocumentPackPreview(rejection);
assert.equal((packPreview.pagesHtml.match(/rp-combined-pack-page/g) || []).length, 4);
assert(packPreview.pagesHtml.includes('C101_invoice.pdf'));
assert(packPreview.pagesHtml.includes('C102_invoice.pdf'));
const combinedView = context.renderRpApprovalExactPdfModal('C101', rejection.formAnswers,
  { user: rejection.user, dateTime: rejection.dateTime, decision: 'Rejected' }, 'Rejected', packPreview);
assert(combinedView.includes('Rejected document pack - ' + rejection.attachmentName));
assert(combinedView.includes('Digitally Signed') === false);
assert(combinedView.includes('Rejected</strong>') || combinedView.includes('Rejected by'));
assert(combinedView.includes('C101_invoice.pdf'));
assert(!combinedView.includes('id="rp-pdf-sign-btn"'));
context.Blob = Blob;
context.URL = { createObjectURL() { return 'blob:test-invoice'; } };
const uploadedPreview = context.buildRpRejectedDocumentPackPreview({
  attachmentName: 'test-pack.pdf',
  includedDocuments: [{ poNo: 'C101', id: 'supplier-invoice', name: 'Supplier Invoice', fileName: 'invoice.pdf', fileBlob: new Blob(['pdf'], { type: 'application/pdf' }) }]
});
assert(uploadedPreview.pagesHtml.includes('src="blob:test-invoice"'));
assert.deepEqual(Array.from(uploadedPreview.objectUrls), ['blob:test-invoice']);
assert.equal(workflows.C101.rpFinalRejection, workflows.C102.rpFinalRejection);
assert.deepEqual(Array.from(context.getRpTaskFilteredPoKeys()), ['C103']);
assert.deepEqual(Array.from(context.getRpFinalRejectedPoKeys()), ['C101']);
assert(source.includes('data-rp-rejected-pack'));
assert(!source.includes('data-rp-rejected-form'));
assert(source.includes('data-rp-task-queue-tab="rejected"'));
assert(source.includes('buildRpRejectedDocumentPackPreview(rejection)'));
assert(source.includes('renderRpApprovalExactPdfModal(poNo, rejection.formAnswers'));
console.log('RPi rejected history: merged rejection, active queue exclusion, and one combined-pack preview passed.');
