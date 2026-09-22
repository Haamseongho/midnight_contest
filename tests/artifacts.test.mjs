import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));

test('browser proof assets match the freshly compiled contract', async () => {
  for (const [folder, name] of [
    ['keys', 'claim.prover'],
    ['keys', 'claim.verifier'],
    ['zkir', 'claim.bzkir'],
  ]) {
    const compiled = await readFile(join(root, 'contract/managed/silent-pass', folder, name));
    const publicAsset = await readFile(join(root, 'public', folder, name));
    assert.ok(compiled.length > 0, `${name} must not be empty`);
    assert.deepEqual(publicAsset, compiled, `${name} must match the compiler output`);
  }
});
