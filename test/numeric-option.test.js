import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { wholeNumberOption } from '../lib/utils/numeric-option.js';

const CLI = fileURLToPath(new URL('../bin/mantis.js', import.meta.url));

test('accepts a whole number at or above the minimum', () => {
  const limit = wholeNumberOption('--limit', { min: 1 });
  assert.equal(limit('1'), 1);
  assert.equal(limit('20'), 20);
  assert.equal(limit(' 7 '), 7);
  assert.equal(limit('+7'), 7);

  const offset = wholeNumberOption('--offset', { min: 0 });
  assert.equal(offset('0'), 0);
  assert.equal(offset('40'), 40);
});

// `--max-chars 0` preserves the existing zero-character cap; non-empty files
// retain the existing truncation marker, matching the previous behavior.
test('keeps zero as a usable value where the minimum allows it', () => {
  assert.equal(wholeNumberOption('--max-chars', { min: 0 })('0'), 0);
});

test('rejects a value that is not a whole number', () => {
  const limit = wholeNumberOption('--limit', { min: 1 });
  for (const value of ['abc', '', '  ', '1.9', '4x', '1e3', 'NaN', '--4']) {
    assert.throws(() => limit(value), /expects a whole number/, `should reject ${JSON.stringify(value)}`);
  }
});

test('rejects a value below the minimum, naming the minimum', () => {
  assert.throws(() => wholeNumberOption('--limit', { min: 1 })('0'), /--limit must be 1 or more/);
  assert.throws(() => wholeNumberOption('--limit', { min: 1 })('-3'), /--limit must be 1 or more/);
  assert.throws(() => wholeNumberOption('--offset', { min: 0 })('-5'), /--offset must be 0 or more/);
});

test('rejects a number outside the safe integer range', () => {
  const limit = wholeNumberOption('--limit', { min: 1 });
  assert.throws(() => limit('9007199254740993'), /outside the safe integer range/);
  assert.throws(() => limit('-9007199254740993'), /outside the safe integer range/);
});

// The point of the parser is that the command stops before a request is made,
// so an invalid value never reaches the API as a default or as NaN.
test('the CLI refuses an invalid option before doing any work', async () => {
  const { code, output } = await new Promise((resolve) => {
    const child = spawn(process.execPath, [CLI, 'spaces', 'list', '--limit', 'abc']);
    let output = '';
    child.stdout.on('data', (c) => { output += c; });
    child.stderr.on('data', (c) => { output += c; });
    child.on('close', (exit) => resolve({ code: exit, output }));
  });

  assert.notEqual(code, 0);
  assert.match(output, /--limit expects a whole number/);
  assert.doesNotMatch(output, /^\{/m, 'should not print a result page');
});
