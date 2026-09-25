import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const read = (relativePath) =>
  readFile(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf8');
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

test('Awesome Midnight submission entry stays identical across reviewer documents', async () => {
  const [readme, checklist, submission] = await Promise.all([
    read('README.md'),
    read('docs/AWESOME_DAPPS_CHECKLIST.md'),
    read('docs/AWESOME_DAPPS_SUBMISSION.md'),
  ]);
  const entry =
    '- [Silent Pass](https://github.com/Haamseongho/midnight_contest) - One-time access-pass DApp that proves knowledge of a private secret while publishing only its commitment and claimed status on Midnight Network. - [Demo](https://haamseongho.github.io/midnight_contest/)';

  assert.match(readme, new RegExp(`^${escapeRegExp(entry)}$`, 'm'));
  assert.match(checklist, new RegExp(`^${escapeRegExp(entry)}$`, 'm'));
  assert.match(submission, new RegExp(`^${escapeRegExp(entry)}$`, 'm'));
});

test('documentation does not claim unverified public-network deployment', async () => {
  const readme = await read('README.md');

  assert.match(readme, /Preview\/Preprod deployment and transaction submission are not yet verified/);
  assert.match(readme, /Preview DApp Connector 4\.x handshake were verified/);
  assert.doesNotMatch(readme, /Contract deployed on (Preview|Preprod)/i);
});

test('browser deployment flow defaults to the Preview evidence network', async () => {
  const [html, networkSource] = await Promise.all([
    read('index.html'),
    read('src/network/midnight.ts'),
  ]);

  assert.match(html, /<option value="preview" selected>Preview<\/option>/);
  assert.doesNotMatch(html, /<option value="preprod" selected>/);
  assert.match(html, /Preview 공개 거래는 아직 검증 중입니다/);
  assert.match(html, /같은 거래를 바로 다시 보내지 마세요/);
  assert.match(networkSource, /balanceUnsealedTransaction/);
  assert.match(networkSource, /3분 안에 거래 밸런싱·증명을 완료하지 못했습니다/);
  assert.match(networkSource, /결과가 불확실하므로 Activity와 공개 상태를 확인하기 전에는 같은 거래를 다시 전송하지 마세요/);
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
