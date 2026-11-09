const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/flow.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context, { filename: 'flow.js' });
const flow = context.window.NEXUSModules.flow;

test('keyboard aliases normalize to stable key names', () => {
  assert.equal(flow.normalizeKey(' '), 'space');
  assert.equal(flow.normalizeKey('Spacebar'), 'space');
  assert.equal(flow.normalizeKey('ArrowUp'), 'up');
  assert.equal(flow.normalizeKey('ArrowDown'), 'down');
  assert.equal(flow.normalizeKey('ArrowLeft'), 'left');
  assert.equal(flow.normalizeKey('ArrowRight'), 'right');
  assert.equal(flow.normalizeKey('Return'), 'enter');
  assert.equal(flow.normalizeKey('Esc'), 'escape');
});

test('configured keys match without case sensitivity', () => {
  assert.equal(flow.keyMatches('A', 'a'), true);
  assert.equal(flow.keyMatches('f5', 'F5'), true);
  assert.equal(flow.keyMatches('space', ' '), true);
});

test('any-key and wildcard handlers match every key', () => {
  assert.equal(flow.keyMatches('any', 'q'), true);
  assert.equal(flow.keyMatches('any key', 'ArrowDown'), true);
  assert.equal(flow.keyMatches('*', 'Escape'), true);
});

test('different configured keys do not match', () => {
  assert.equal(flow.keyMatches('space', 'Enter'), false);
  assert.equal(flow.keyMatches('left', 'right'), false);
});
