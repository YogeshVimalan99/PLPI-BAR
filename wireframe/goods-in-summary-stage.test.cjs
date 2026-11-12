const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(`${__dirname}/app.js`, 'utf8');
const start = source.indexOf('function getGoodsInSummaryRecord(poKey) {');
const end = source.indexOf('function getGoodsInSummaryRecords() {', start);
assert.ok(start >= 0 && end > start);

const workflow = {
  poNo: 'C10001',
  supplier: 'Test Supplier',
  rpDocumentsQueueCreatedAt: '01 Nov 2026, 09:00',
  rpDocumentsQueueCreatedBy: 'goods.in'
};
const context = {
  rpPackWorkflows: { C10001: workflow },
  rpApprovalSignoffs: {},
  checklistDecisionQueue: [],
  batchCheckerDb: [],
  batchCheckerVerificationHistory: {},
  batchCheckerPclGeneratedRows: {},
  batchCheckerCompletedRows: {},
  getBatchCheckerRowKey: () => '',
  getPackingListAuditEvents: () => [],
  getRpMergePrimaryPo: (poNo) => poNo,
  getRpMergePoNos: (poNo) => [poNo],
  getGoodsReceivingChecklistPoNumbers: (item) => [item.poNo]
};
vm.runInNewContext(source.slice(start, end), context);
const summary = () => context.getGoodsInSummaryRecord('C10001');
const actions = () => Array.from(summary().timeline, (entry) => entry.action);

assert.equal(summary().currentStage, 'RPi Pack Creation');
assert.equal(actions().length, 1);

context.checklistDecisionQueue.push({
  poNo: 'C10001', status: 'Waiting for QA decision',
  raisedBy: 'goods.in', raisedAt: '02 Nov 2026, 10:00'
});
assert.equal(summary().currentStage, 'Waiting for QA decision');
assert.match(actions().at(-1), /referred to QA/);

context.checklistDecisionQueue[0].status = 'Approved for unpacking';
context.checklistDecisionQueue[0].qaDecision = {
  outcome: 'Approved for unpacking', user: 'qa.user', dateTime: '03 Nov 2026, 11:00'
};
assert.equal(summary().currentStage, 'Checklist acceptance');
assert.equal(actions().length, 3);

workflow.signoff = { user: 'goods.in', dateTime: '04 Nov 2026, 12:00' };
assert.equal(summary().currentStage, 'RPi review');
assert.match(actions().at(-1), /Submitted/);

context.rpApprovalSignoffs.C10001 = { user: 'rp.user', dateTime: '05 Nov 2026, 13:00' };
assert.equal(summary().currentStage, 'RPi Approved');
assert.match(actions().at(-1), /Completed RPi approval/);
assert.equal(summary().timeline.length, 5);

delete context.rpApprovalSignoffs.C10001;
delete workflow.signoff;
workflow.stockControlEmailSentBy = 'goods.in';
workflow.stockControlEmailSentAt = '04 Nov 2026, 12:00';
assert.equal(summary().currentStage, 'Sent to Stock Control India');
assert.match(actions().at(-1), /Stock Control India/);

delete workflow.stockControlEmailSentAt;
workflow.rpFinalRejection = { user: 'rp.user', dateTime: '05 Nov 2026, 13:00', comment: 'Rejected batch' };
assert.equal(summary().currentStage, 'Rejected by RPi');
assert.match(summary().timeline.at(-1).action, /Rejected batch/);

delete workflow.rpFinalRejection;
workflow.signoff = { user: 'goods.in', dateTime: '04 Nov 2026, 12:00' };
context.rpApprovalSignoffs.C10001 = { user: 'rp.user', dateTime: '05 Nov 2026, 13:00' };
context.getPackingListAuditEvents = () => [
  { stage: 'Packing List', action: 'Verified line 1 and printed 2 packing labels.', user: 'goods.in', dateTime: '01 Nov 2026, 09:10' },
  { stage: 'Packing List', action: 'Generated Packing List for C10001.', user: 'goods.in', dateTime: '01 Nov 2026, 09:20' }
];
workflow.documentsCompletedBy = 'goods.in';
workflow.documentsCompletedAt = '01 Nov 2026, 09:30';
workflow.documentSetValidatedBy = 'goods.in';
workflow.documentSetValidatedAt = '01 Nov 2026, 09:40';
workflow.rpiReviewStartedBy = 'rp.user';
workflow.rpiReviewStartedAt = '04 Nov 2026, 12:10';
workflow.rpiDocumentsReviewedBy = 'rp.user';
workflow.rpiDocumentsReviewedAt = '04 Nov 2026, 12:20';
assert.equal(summary().currentStage, 'RPi Approved');
assert.equal(actions().length, 11);
assert.ok(actions().some((action) => /printed 2 packing labels/.test(action)));
assert.ok(actions().some((action) => /completed the PO document set/.test(action)));
assert.ok(actions().some((action) => /started RPi review/.test(action)));
console.log('Goods-in Summary stage checks passed.');
