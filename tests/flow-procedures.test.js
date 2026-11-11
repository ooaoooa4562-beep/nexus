const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/flow.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context, { filename: 'flow.js' });
const flow = context.window.NEXUSModules.flow;

test('custom block names are trimmed and validated', () => {
  assert.equal(flow.validateProcedureName('  drawSquare  '), 'drawSquare');
  assert.equal(flow.validateProcedureName('_internal'), '_internal');
  assert.equal(flow.validateProcedureName('move2'), 'move2');
});

test('invalid custom block names are rejected', () => {
  for (const name of ['', 'has space', 'bad-name', '2fast', 'x'.repeat(33)]) {
    assert.throws(() => flow.validateProcedureName(name), /Invalid custom block name/);
  }
});

test('procedure metadata removes duplicate IDs and case-insensitive names', () => {
  const procedures = flow.normalizeProcedures([
    { id: 'p123456', name: 'drawSquare' },
    { id: 'p123456', name: 'duplicateId' },
    { id: 'p234567', name: 'DRAWSQUARE' },
    { id: 'p345678', name: ' move ' },
    { id: 'invalid', name: 'invalidId' },
    null
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(procedures)), [
    { id: 'p123456', name: 'drawSquare' },
    { id: 'p345678', name: 'move' }
  ]);
});

test('a project can store at most 50 custom block definitions', () => {
  const input = Array.from({ length: 60 }, (_, index) => ({
    id: 'p' + String(index).padStart(6, '0'),
    name: 'block' + index
  }));
  assert.equal(flow.normalizeProcedures(input).length, 50);
});

test('malformed or non-array procedure metadata safely normalizes to an empty list', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(flow.normalizeProcedures(null))), []);
  assert.deepEqual(JSON.parse(JSON.stringify(flow.normalizeProcedures({ name: 'not-an-array' }))), []);
});
