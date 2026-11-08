const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/flow.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context, { filename: 'flow.js' });
const flow = context.window.NEXUSModules.flow;
const block = (type, fields = {}, inputs = {}) => ({ type, fields, inputs });

test('legacy numeric variables migrate to Number records', () => {
  const v = flow.normalizeVariables({ score: 7, total: 12.5 });
  assert.equal(v.score.type, 'number'); assert.equal(v.score.value, 7);
  assert.equal(v.total.type, 'number'); assert.equal(v.total.value, 12.5);
});
test('Text and Boolean variables normalize and keep a numeric score default', () => {
  const v = flow.normalizeVariables({ title: { type: 'text', value: 'NEXUS' }, enabled: { type: 'boolean', value: true } });
  assert.equal(v.title.value, 'NEXUS'); assert.equal(v.enabled.value, true); assert.equal(v.score.type, 'number');
});
test('variable reporter returns Number, Text and Boolean values without coercion', () => {
  const v = { score: { type: 'number', value: 9 }, title: { type: 'text', value: 'Flow Studio' }, enabled: { type: 'boolean', value: false } };
  assert.equal(flow.evaluateReporter(block('getVar', { variable: 'score' }), v), 9);
  assert.equal(flow.evaluateReporter(block('getVar', { variable: 'title' }), v), 'Flow Studio');
  assert.equal(flow.evaluateReporter(block('getVar', { variable: 'enabled' }), v), false);
});
test('numeric expressions reject Text and Boolean variables', () => {
  assert.equal(flow.evaluateExpression('$score * 2', { score: { type: 'number', value: 4 } }), 8);
  assert.throws(() => flow.evaluateExpression('$title + 1', { title: { type: 'text', value: 'four' } }), /text, not numeric/);
  assert.throws(() => flow.evaluateExpression('$enabled + 1', { enabled: { type: 'boolean', value: true } }), /boolean, not numeric/);
});
test('assignment preserves declared types and rejects mismatches', () => {
  const v = Object.assign(Object.create(null), { score: { type: 'number', value: 1 }, title: { type: 'text', value: 'old' }, enabled: { type: 'boolean', value: false } });
  flow.assignVariable(v, 'score', 2); flow.assignVariable(v, 'title', 'new'); flow.assignVariable(v, 'enabled', true);
  assert.equal(v.score.value, 2); assert.equal(v.title.value, 'new'); assert.equal(v.enabled.value, true);
  assert.throws(() => flow.assignVariable(v, 'score', 'two'), /expected number, received text/);
  assert.throws(() => flow.assignVariable(v, 'title', false), /expected text, received boolean/);
});
test('logical reporters require Boolean operands', () => {
  assert.equal(flow.evaluateReporter(block('and', {}, { left: block('boolean', { value: 'true' }), right: block('boolean', { value: 'false' }) })), false);
  assert.throws(() => flow.evaluateReporter(block('not', {}, { value: block('number', { value: '1' }) })), /Boolean value/);
});
test('comparison reporter supports same-type Boolean and Text values', () => {
  assert.equal(flow.evaluateReporter(block('compare', { operator: '=' }, { a: block('boolean', { value: 'true' }), b: block('boolean', { value: 'true' }) })), true);
  assert.equal(flow.evaluateReporter(block('compare', { operator: '!=' }, { a: block('text', { value: 'NEXUS' }), b: block('text', { value: 'Flow' }) })), true);
});
