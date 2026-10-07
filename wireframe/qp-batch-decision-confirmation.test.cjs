const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const source = fs.readFileSync(__dirname + '/app.js', 'utf8');

function functionSource(name, next) {
  const start = source.indexOf('function ' + name + '(');
  assert(start >= 0);
  return source.slice(start, source.indexOf('function ' + next + '(', start));
}

function setup() {
  let modal = null, focused = '', persists = 0, renders = 0;
  const trigger = { isConnected: true, focus() { focused = 'trigger'; } };
  function eventNode() {
    const listeners = {};
    return {
      addEventListener(type, handler, options) { listeners[type] = { handler, options }; },
      dispatch(type, event = {}) {
        const listener = listeners[type];
        if (!listener) return;
        if (listener.options?.once) delete listeners[type];
        listener.handler(event);
      }
    };
  }
  const context = {
    qpSelectedProduct: { batch: 'CONFIRM-1' }, qpChecklistOpen: false,
    qpReleaseRecords: { 'CONFIRM-1': { qpReady: true, releaseLog: { comments: 'Saved log comment' } } },
    qpCertifiedBatchNumbers: [], currentLogin: { user: 'qp.test' },
    htmlSafe: value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;'),
    statusMessage: { textContent: '' },
    getQpReleaseLogDefaults(product) { return { relId: 'REL-1', ...context.qpReleaseRecords[product.batch]?.releaseLog }; },
    getAssemblyAuditTimestamp: () => '2026-10-03 10:00',
    persistQpReleaseRecords() { persists++; },
    renderStage(stage) { assert.equal(stage, 'qp-release'); renders++; },
    document: {
      activeElement: trigger,
      querySelector(selector) { assert.equal(selector, '#qp-batch-decision-confirm'); return modal; },
      createElement(tag) {
        assert.equal(tag, 'dialog');
        const cancel = eventNode(), confirm = eventNode(), dialog = eventNode();
        cancel.focus = () => { focused = 'cancel'; };
        Object.assign(dialog, {
          attributes: {}, open: false, cancel, confirm,
          setAttribute(name, value) { this.attributes[name] = value; },
          querySelector(selector) {
            if (selector === '[data-qp-decision-cancel]') return cancel;
            assert.equal(selector, '[data-qp-decision-confirm]');
            return confirm;
          },
          showModal() { this.open = true; },
          close() { this.open = false; },
          remove() { modal = null; }
        });
        return dialog;
      },
      body: { appendChild(dialog) { assert.equal(modal, null); modal = dialog; } }
    }
  };
  vm.createContext(context);
  vm.runInContext(functionSource('requestQpBatchDecisionConfirmation', 'setQpBatchDecision'), context);
  vm.runInContext(functionSource('setQpBatchDecision', 'getQpReleaseProducts'), context);
  return { context, get modal() { return modal; }, get focused() { return focused; }, get persists() { return persists; }, get renders() { return renders; } };
}

for (const [hook, decision, question] of [
  ['hold', 'Hold', 'Put batch CONFIRM-1 on hold?'],
  ['banding', 'Banding', 'Send batch CONFIRM-1 for banding?'],
  ['reject', 'Rejected', 'Reject batch CONFIRM-1?']
]) {
  // Run the real delegated click branch so each UI action must open the dialog.
  const branch = source.match(new RegExp('if \\(event.target.closest\\("\\[data-qp-' + hook + '-batch\\]"\\)\\) \\{[\\s\\S]*?\\n  \\}'));
  assert(branch, hook + ' click handler');
  const test = setup();
  vm.runInContext('function clickDecision(event) { ' + branch[0] + ' }', test.context);
  const click = () => test.context.clickDecision({ target: { closest: selector => selector === '[data-qp-' + hook + '-batch]' } });
  const before = JSON.stringify(test.context.qpReleaseRecords);
  click();
  assert(test.modal.open);
  assert(test.modal.innerHTML.includes(question));
  assert.equal(test.modal.className, 'qp-log-sign-confirm');
  assert.equal(test.modal.attributes['aria-describedby'], 'qp-batch-decision-message');
  assert.equal(test.focused, 'cancel');
  assert.equal(JSON.stringify(test.context.qpReleaseRecords), before);
  assert.equal(test.persists, 0);
  const firstDialog = test.modal;
  click();
  assert.equal(test.modal, firstDialog, 'Repeated clicks must not stack confirmations');
  firstDialog.cancel.dispatch('click');
  assert.equal(test.modal, null);
  assert.equal(test.focused, 'trigger');
  firstDialog.confirm.dispatch('click');
  assert.equal(JSON.stringify(test.context.qpReleaseRecords), before, 'A dismissed dialog must not commit');

  click();
  let prevented = false;
  test.modal.dispatch('cancel', { preventDefault() { prevented = true; } });
  assert(prevented);
  assert.equal(test.modal, null);
  assert.equal(JSON.stringify(test.context.qpReleaseRecords), before);
  assert.equal(test.persists, 0);

  click();
  const confirmedDialog = test.modal;
  confirmedDialog.confirm.dispatch('click');
  const record = test.context.qpReleaseRecords['CONFIRM-1'];
  assert.equal(record.decision, decision);
  assert.equal(record.decisionBy, 'qp.test');
  assert.equal(record.decisionDateTime, '2026-10-03 10:00');
  assert.equal(record.qpDecisionCompleted, true);
  assert.equal(record.releaseLog.batchDecision, decision);
  assert.equal(record.releaseLog.approved, 'No');
  assert.equal(record.releaseLog.batchCompleted, true);
  assert.equal(record.releaseLog.comments, 'Saved log comment');
  assert.equal(test.modal, null);
  assert.equal(test.context.qpSelectedProduct, null);
  assert.equal(test.persists, 1);
  assert.equal(test.renders, 1);
  confirmedDialog.confirm.dispatch('click');
  assert.equal(test.persists, 1);
}
console.log('PASS: Hold, Banding and Reject require confirmation; Cancel/Escape preserve records; confirmation records the decision, QP identity and time in the Release Log exactly once.');

const changed = setup();
changed.context.requestQpBatchDecisionConfirmation('Hold');
changed.context.qpSelectedProduct = { batch: 'ANOTHER-BATCH' };
changed.modal.confirm.dispatch('click');
assert.equal(changed.persists, 0);
assert.equal(changed.context.qpReleaseRecords['ANOTHER-BATCH'], undefined);
assert.equal(changed.modal, null);
changed.context.qpSelectedProduct = null;
changed.context.requestQpBatchDecisionConfirmation('Hold');
assert.equal(changed.modal, null);
changed.context.qpSelectedProduct = { batch: 'CONFIRM-1' };
changed.context.requestQpBatchDecisionConfirmation('Approve');
assert.equal(changed.modal, null);
console.log('PASS: stale batch selections and unsupported actions cannot commit a decision.');
