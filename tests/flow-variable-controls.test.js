const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/flow.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context, { filename: 'flow.js' });
const flow = context.window.NEXUSModules.flow;

test('variable type selectors distinguish numeric targets from typed values', () => {
  assert.equal(flow.variableFieldMode('change'), 'number');
  assert.equal(flow.variableFieldMode('add'), 'number');
  assert.equal(flow.variableFieldMode('ifElse'), 'number');
  assert.equal(flow.variableFieldMode('set'), 'any');
  assert.equal(flow.variableFieldMode('print'), 'any');
  assert.equal(flow.variableFieldMode('getVar'), 'any');
  assert.equal(flow.variableFieldMode('setScore'), 'any');
});

test('text numeric values convert to finite Number values', () => {
  const variables = flow.normalizeVariables({ amount: { type: 'text', value: '42.5' } });
  const changed = flow.changeVariableType(variables, 'amount', 'number');
  assert.equal(changed.type, 'number');
  assert.equal(changed.value, 42.5);
});

test('Boolean conversion is strict and deterministic', () => {
  assert.equal(flow.convertVariableValue(true, 'boolean', 'number'), 1);
  assert.equal(flow.convertVariableValue(false, 'boolean', 'number'), 0);
  assert.equal(flow.convertVariableValue(1, 'number', 'boolean'), true);
  assert.equal(flow.convertVariableValue(0, 'number', 'boolean'), false);
  assert.equal(flow.convertVariableValue('TRUE', 'text', 'boolean'), true);
  assert.equal(flow.convertVariableValue('false', 'text', 'boolean'), false);
  assert.throws(() => flow.convertVariableValue(2, 'number', 'boolean'), /only 0 or 1/);
  assert.throws(() => flow.convertVariableValue('yes', 'text', 'boolean'), /only 0 or 1/);
});

test('Number and Boolean values can be represented as Text', () => {
  assert.equal(flow.convertVariableValue(12, 'number', 'text'), '12');
  assert.equal(flow.convertVariableValue(false, 'boolean', 'text'), 'false');
});

test('failed type changes leave the original variable untouched', () => {
  const variables = flow.normalizeVariables({ title: { type: 'text', value: 'not-a-number' } });
  assert.throws(() => flow.changeVariableType(variables, 'title', 'number'), /finite number/);
  assert.equal(variables.title.type, 'text');
  assert.equal(variables.title.value, 'not-a-number');
});

test('type changes reject unknown variables and invalid identifiers', () => {
  const variables = flow.normalizeVariables({});
  assert.throws(() => flow.changeVariableType(variables, 'missing', 'text'), /does not exist/);
  assert.throws(() => flow.changeVariableType(variables, 'bad-name', 'text'), /Invalid variable name/);
  assert.throws(() => flow.changeVariableType(variables, 'score', 'object'), /Unknown variable type/);
});
