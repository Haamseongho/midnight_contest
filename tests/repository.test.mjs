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

  assert.match(readme, /Preview\/Preprod deployment and transaction submission are not yet verified/);
  assert.match(readme, /Preview DApp Connector 4\.x handshake were verified/);
  assert.doesNotMatch(readme, /Contract deployed on (Preview|Preprod)/i);
});

test('browser deployment flow defaults to the Preview evidence network', async () => {
  const html = await read('index.html');

  assert.match(html, /<option value="preview" selected>Preview<\/option>/);
  assert.doesNotMatch(html, /<option value="preprod" selected>/);
});

test('development versions stay aligned with the pinned official reference stack', async () => {
  const [manifestText, compose, readme] = await Promise.all([
    read('package.json'),
    read('devnet/compose.yml'),
    read('README.md'),
  ]);
  const manifest = JSON.parse(manifestText);

  assert.equal(manifest.engines.node, '>=24.11.1');
  assert.equal(manifest.dependencies['@midnight-ntwrk/compact-runtime'], '0.16.0');
  assert.equal(manifest.dependencies['@midnight-ntwrk/dapp-connector-api'], '4.0.1');
  assert.equal(manifest.dependencies['@midnight-ntwrk/midnight-js-contracts'], '4.1.1');
  assert.match(compose, /midnightntwrk\/midnight-node:0\.22\.3/);
  assert.match(compose, /midnightntwrk\/indexer-standalone:4\.0\.1/);
  assert.match(compose, /midnightntwrk\/proof-server:8\.0\.3/);
  assert.match(readme, /example-bboard\/tree\/38bfac8c574abb0c5a96c9e076779716c3e88231/);
});

test('public CI exercises real local-network transactions', async () => {
  const [workflow, manifestText] = await Promise.all([
    read('.github/workflows/ci.yml'),
    read('package.json'),
  ]);
  const manifest = JSON.parse(manifestText);

  assert.match(workflow, /^  local-e2e:$/m);
  assert.match(workflow, /docker compose -f devnet\/compose\.yml up -d --wait/);
  assert.match(workflow, /run: npm run test:local/);
  assert.match(workflow, /docker compose -f devnet\/compose\.yml down -v/);
  assert.equal(manifest.scripts['audit:prod'], 'npm audit --omit=dev --audit-level=high');
  assert.match(manifest.scripts.verify, /^npm run audit:prod && /);
  assert.match(workflow, /run: npm run verify/);
});
