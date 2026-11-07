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

test('text reporters can join nested text and numeric values', () => {
  const expression = block('join', {}, {
    left: block('text', { value: 'Score: ' }),
    right: block('join', {}, {
      left: block('number', { value: '12' }),
      right: block('text', { value: ' pts' })
    })
  });
  assert.equal(flow.evaluateReporter(expression), 'Score: 12 pts');
});

test('length reporter counts Unicode code points', () => {
  assert.equal(flow.evaluateReporter(block('length', {}, {
    value: block('text', { value: 'NEXUS 🚀' })
  })), 7);
});

test('contains reporter performs case-insensitive text search', () => {
  assert.equal(flow.evaluateReporter(block('contains', {}, {
    text: block('text', { value: 'NEXUS Digital Laboratory' }),
    search: block('text', { value: 'digital' })
  })), true);
  assert.equal(flow.evaluateReporter(block('contains', {}, {
    text: block('text', { value: 'NEXUS' }),
    search: block('text', { value: 'Studio' })
  })), false);
});

test('comparison reporter supports text equality and ordering', () => {
  assert.equal(flow.evaluateReporter(block('compare', { operator: '=' }, {
    a: block('text', { value: 'Flow' }),
    b: block('text', { value: 'flow' })
  })), true);
  assert.equal(flow.evaluateReporter(block('compare', { operator: '>' }, {
    a: block('text', { value: 'beta' }),
    b: block('text', { value: 'alpha' })
  })), true);
});

test('comparison rejects mixed value types and boolean ordering', () => {
  assert.throws(() => flow.evaluateReporter(block('compare', { operator: '=' }, {
    a: block('number', { value: '1' }),
    b: block('text', { value: '1' })
  })), /different value types/);
  assert.throws(() => flow.evaluateReporter(block('compare', { operator: '>' }, {
    a: block('boolean', { value: 'true' }),
    b: block('boolean', { value: 'false' })
  })), /requires two numbers or two text values/);
});

test('arithmetic reporters reject overflow instead of returning Infinity', () => {
  assert.throws(() => flow.evaluateReporter(block('mathMultiply', {}, {
    a: block('number', { value: '1e308' }),
    b: block('number', { value: '1e308' })
  })), /non-finite number/);
});

test('inherited object properties are not treated as project variables', () => {
  assert.equal(flow.evaluateExpression('$toString', {}), 0);
  assert.equal(flow.evaluateExpression('$score', Object.create({ score: 99 })), 0);
  assert.equal(flow.evaluateReporter(block('getVar', { variable: 'constructor' })), 0);
});
