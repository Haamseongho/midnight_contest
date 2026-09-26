import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PREVIEW_EXAMPLE } from '../src/evidence/preview-example.ts';

test('recorded verification time matches the original documented minute, not a new observation', async () => {
  const runbook = await readFile(new URL('../docs/PREVIEW_DEPLOYMENT.md', import.meta.url), 'utf8');
  assert.match(runbook, /Verified at \(UTC\) \| 2026-09-25 10:46 UTC/);
  assert.match(PREVIEW_EXAMPLE.verifiedAt, /2026-09-25 10:46 UTC \/ 19:46 KST/);
  assert.match(PREVIEW_EXAMPLE.verifiedAt, /원본 문서.*분 단위.*블록 시각 아님/);
  assert.match(PREVIEW_EXAMPLE.source, /\/blob\/f87aee390bb20ccd8e033dcfa7dbec42de522b68\/docs\/PREVIEW_DEPLOYMENT.md$/);
  assert.equal(PREVIEW_EXAMPLE.commit, '76d6610');
});
