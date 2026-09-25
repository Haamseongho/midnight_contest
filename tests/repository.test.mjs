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
  const [readme, runbook, guide, submission] = await Promise.all([
    read('README.md'),
    read('docs/PREVIEW_DEPLOYMENT.md'),
    read('docs/RUN_AND_LACE_GUIDE.md'),
    read('docs/FINAL_SUBMISSION_PACKAGE.md'),
  ]);

  assert.match(readme, /Preview\/Preprod deployment and transaction submission are not yet verified/);
  assert.match(readme, /Preview DApp Connector 4\.x handshake were verified/);
  assert.match(readme, /tNIGHT-to-tDUST registration on 2026-09-25/);
  assert.doesNotMatch(readme, /Contract deployed on (Preview|Preprod)/i);
  assert.match(runbook, /https:\/\/docs\.midnight\.network\/guides\/acquire-tokens/);
  assert.match(runbook, /https:\/\/midnight-tmnight-preview\.nethermind\.dev/);
  assert.match(runbook, /\*\*Generate tDUST\*\*/);
  assert.match(runbook, /Registration completed in Lace on 2026-09-25; positive and refilling/);
  assert.doesNotMatch(`${readme}\n${runbook}\n${guide}`, /Cardano-held NIGHT|enough ADA|dust\.preview\.midnight\.network/);
  assert.match(guide, /npm run verify/);
  assert.match(guide, /npm run test:local/);
  assert.match(guide, /mn_addr_preview/);
  assert.match(submission, /최종 제출 버튼/);
  assert.match(submission, /Preview 공개 거래는 해커톤의 필수 제출 조건이 아니며 Local Devnet도 공식/);
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

test('the product scope distinguishes credentials from asset transfers', async () => {
  const [html, readme, demoScript] = await Promise.all([
    read('index.html'),
    read('README.md'),
    read('docs/DEMO_SCRIPT.md'),
  ]);

  assert.match(html, /Silent Pass는 송금·결제·에스크로 앱이\s*아닙니다/);
  assert.match(html, /사용자 자금을\s*보관하거나 다른 지갑으로 전송하지 않습니다/);
  assert.match(readme, /not a payment, remittance, or escrow application/);
  assert.match(readme, /does not custody funds or transfer assets between wallets/);
  assert.match(demoScript, /does not send, hold, or escrow funds/);
});

test('the browser can clear displayed secrets without changing public state', async () => {
  const [html, source] = await Promise.all([
    read('index.html'),
    read('src/main.ts'),
  ]);

  assert.match(html, /id="clear-button"/);
  assert.match(html, /id="network-clear-button"/);
  assert.equal(html.match(/<dt>사용 여부<\/dt>/g)?.length, 2);
  assert.match(source, /session\.secretHex = ""/);
  assert.match(source, /networkSecretHex = ""/);
  assert.match(source, /계약 상태는 유지됩니다/);
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
  const [workflow, manifestText, localE2e] = await Promise.all([
    read('.github/workflows/ci.yml'),
    read('package.json'),
    read('scripts/local-e2e.mjs'),
  ]);
  const manifest = JSON.parse(manifestText);

  assert.match(workflow, /^  local-e2e:$/m);
  assert.equal(workflow.match(/GITHUB_TOKEN: \$\{\{ github\.token \}\}/g)?.length, 2);
  assert.match(workflow, /docker compose -f devnet\/compose\.yml up -d --wait/);
  assert.match(workflow, /run: npm run test:local/);
  assert.match(workflow, /docker compose -f devnet\/compose\.yml down -v/);
  assert.equal(manifest.scripts['audit:prod'], 'npm audit --omit=dev --audit-level=high');
  assert.match(manifest.scripts.verify, /^npm run audit:prod && /);
  assert.match(workflow, /run: npm run verify/);
  assert.match(localE2e, /dustAccrualBufferMs = 15_000/);
  assert.match(localE2e, /DUST fee buffer ready/);
});
