const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/flow.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context, { filename: 'flow.js' });
const flow = context.window.NEXUSModules.flow;

test('numeric expression parser respects precedence and parentheses', () => {
  assert.equal(flow.evaluateExpression('2 + 3 * 4'), 14);
  assert.equal(flow.evaluateExpression('-(2 + 3) * 4'), -20);
});

test('numeric expressions can read project variables', () => {
  assert.equal(flow.evaluateExpression('($score + 3) * 2', { score: 4 }), 14);
});

test('nested arithmetic reporters evaluate recursively', () => {
  const expression = {
    type: 'mathMultiply',
    fields: {},
    inputs: {
      a: {
        type: 'mathAdd',
        fields: {},
        inputs: {
          a: { type: 'number', fields: { value: '2' } },
          b: { type: 'number', fields: { value: '3' } }
        }
      },
      b: { type: 'getVar', fields: { variable: 'score' } }
    }
  };
  assert.equal(flow.evaluateReporter(expression, { score: 4 }), 20);
});

test('comparison and boolean reporters return booleans', () => {
  const comparison = {
    type: 'compare',
    fields: { operator: '>' },
    inputs: {
      a: { type: 'number', fields: { value: '9' } },
      b: { type: 'number', fields: { value: '4' } }
    }
  };
  const expression = {
    type: 'and',
    fields: {},
    inputs: {
      left: comparison,
      right: {
        type: 'not',
        fields: {},
        inputs: { value: { type: 'boolean', fields: { value: 'false' } } }
      }
    }
  };
  assert.equal(flow.evaluateReporter(expression, {}), true);
});

test('invalid expressions and division by zero are rejected', () => {
  assert.throws(() => flow.evaluateExpression('5 / 0'), /Division by zero/);
  assert.throws(() => flow.evaluateExpression('2 + alert(1)'), /Unexpected token/);
  assert.throws(() => flow.evaluateExpression('(2 + 3'), /Missing closing parenthesis/);
});

test('reporter nesting has a depth limit', () => {
  let expression = { type: 'number', fields: { value: '1' } };
  for (let i = 0; i < 42; i++) {
    expression = { type: 'not', fields: {}, inputs: { value: expression } };
  }
  assert.throws(() => flow.evaluateReporter(expression, {}), /depth limit/);
});
