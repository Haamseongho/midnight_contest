import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const read = (relativePath) =>
  readFile(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf8');

test('repository carries the required Midnight attribution and license', async () => {
  const [readme, license, manifest] = await Promise.all([
    read('README.md'),
    read('LICENSE'),
    read('package.json'),
  ]);

  assert.match(readme, /^This project is built on the Midnight Network\.$/m);
  assert.match(readme, /\.\/SECURITY\.md/);
  assert.match(readme, /midnightntwrk\/midnight-awesome-dapps/);
  assert.match(license, /Apache License\s+Version 2\.0, January 2004/);
  assert.equal(JSON.parse(manifest).license, 'Apache-2.0');
});

test('documentation does not claim unverified public-network deployment', async () => {
  const readme = await read('README.md');

  assert.match(readme, /Preview\/Preprod deployment are not yet verified/);
  assert.doesNotMatch(readme, /Contract deployed on (Preview|Preprod)/i);
});
