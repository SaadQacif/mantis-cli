import assert from 'node:assert/strict';
import test from 'node:test';

import { parseSpaceIdFromInput } from '../lib/utils/space-id.js';

const UUID = '4c9beaf7-85db-4648-b5f6-bb2acdea48dd';
const LINK = `https://mantis.csail.mit.edu/space/${UUID}`;

test('reads an id from a raw UUID, a link, or a mantis URI', () => {
  assert.equal(parseSpaceIdFromInput(UUID), UUID);
  assert.equal(parseSpaceIdFromInput(LINK), UUID);
  assert.equal(parseSpaceIdFromInput(`mantis://map/${UUID}`), UUID);
  assert.equal(parseSpaceIdFromInput(`mantis://map/${UUID}/point/9`), UUID);
  assert.equal(parseSpaceIdFromInput(`space/${UUID}`), UUID);
});

test('accepts formatting differences and normalizes the result', () => {
  assert.equal(parseSpaceIdFromInput(`  ${UUID}  `), UUID);
  assert.equal(parseSpaceIdFromInput(UUID.toUpperCase()), UUID);
  assert.equal(parseSpaceIdFromInput(`${LINK}/`), UUID);
  assert.equal(parseSpaceIdFromInput(`${LINK}?tab=maps`), UUID);
  assert.equal(parseSpaceIdFromInput(`${LINK}#notes`), UUID);
  assert.equal(parseSpaceIdFromInput(LINK.toUpperCase()), UUID);
});

test('rejects an identifier that is not a canonical UUID', () => {
  const base = 'https://mantis.csail.mit.edu/space/';
  for (const input of [
    '-'.repeat(36),
    `${base}${'-'.repeat(36)}`,
    `${base}4c9beaf-785db-4648-b5f6-bb2acdea48dd`, // 36 chars, hyphens misplaced
    `${base}4c9beaf785db4648b5f6bb2acdea48dd`, // no hyphens
    `${base}4c9beaf7-85db-4648-bb2acdea48dd`, // a group short
    `${base}4c9beaf7-85db-4648-b5f6-bb2acdea48d`, // a character short
    `${base}not-a-valid-uuid`,
    base,
  ]) {
    assert.equal(parseSpaceIdFromInput(input), null, `should reject ${input}`);
  }
});

// A longer run of hexadecimal characters used to match on its first 36, so a
// mistyped link resolved to a different, plausible-looking id.
test('rejects a longer run instead of truncating it to 36 characters', () => {
  assert.equal(parseSpaceIdFromInput(`${UUID}ff`), null);
  assert.equal(parseSpaceIdFromInput(`ff${UUID}`), null);
  assert.equal(parseSpaceIdFromInput(`${LINK}ff`), null);
  assert.equal(parseSpaceIdFromInput(`${UUID}-${UUID}`), null);
});

test('reads an id that is surrounded by other text', () => {
  assert.equal(parseSpaceIdFromInput(`see ${LINK} for details`), UUID);
  assert.equal(parseSpaceIdFromInput(`space is ${UUID}.`), UUID);
});

test('returns null for empty and non-string input', () => {
  for (const input of ['', '   ', null, undefined, 0, false]) {
    assert.equal(parseSpaceIdFromInput(input), null);
  }
});
