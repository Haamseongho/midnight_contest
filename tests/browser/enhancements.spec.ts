import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// Boundary observations test the real DOM/report policy, not network proof.
async function observations(page: Page, mode = 'success') {
  await page.route('**/src/network/public-reader.ts', r => r.fulfill({contentType:'application/javascript',body:`
    import {TRUSTED_CONTEXT as c} from '/src/context/trusted-context.ts'; let calls=0;
    export async function readTrustedPublicState(requestId) {
      calls++; ${mode === 'failure' ? 'throw Error("injected offline");' : ''}
      if(calls>1) { await new Promise(r=>setTimeout(r,300)); throw Error('injected second failure'); }
      return {network:c.network,address:c.address,commitment:c.commitment,claimed:true,requestId,
        observedAt:new Date().toISOString(),contextVersion:c.version,
        secret:'DO_NOT_EXPORT',wallet:'DO_NOT_EXPORT',${mode === 'mismatch' ? "network:'attacker'," : ''}
        ${mode === 'malformed' ? "claimed:'true'," : ''}};
    }`}));
}
async function report(page: Page) {
  const pending = page.waitForEvent('download');
  await page.locator('#reviewer-export').click();
  return JSON.parse(await readFile((await (await pending).path())!, 'utf8'));
}

test('A roles and public export never forward holder secrets; refresh invalidates old evidence', async ({page}) => {
  await observations(page);
  await page.goto('/');
  await page.locator('#generate-button').click();
  const secret = await page.locator('#secret-output').inputValue();
  await page.locator('#role-holder').click();
  await expect(page.locator('#role-instruction')).toContainText('자기 환경');
  await expect(page.locator('#role-next')).toHaveAttribute('href','#network-address');
  await page.locator('#role-organizer').click();
  await expect(page.locator('#role-instruction')).toContainText('자동 등록되지 않습니다');
  await expect(page.locator('#role-reviewer')).toHaveAttribute('href','./review.html');
  await expect(page.locator('#reviewer-export')).toBeDisabled();
  await page.locator('#reviewer-read').click();
  await expect(page.locator('#reviewer-status')).toHaveAttribute('data-state','USED');
  const first = await report(page);
  expect(first.status).toBe('USED');
  expect(Object.values(first.checks)).toEqual([true,true,true,true]);
  expect(first.kind).toBe('unsigned-recorded-observation');
  expect(JSON.stringify(first)).not.toContain(secret);
  expect(JSON.stringify(first)).not.toContain('DO_NOT_EXPORT');
  await page.locator('#reviewer-read').click();
  await expect(page.locator('#reviewer-export')).toBeDisabled();
  await expect(page.locator('#reviewer-checks')).not.toContainText('지정 맥락과 일치');
  await expect(page.locator('#reviewer-status')).toHaveAttribute('data-state','UNKNOWN');
  const second = await report(page);
  expect(second.requestId).not.toBe(first.requestId);
  expect(second.claimed).toBeNull(); expect(second.observedAt).toBeNull();
  expect(Object.values(second.checks)).toEqual([null,null,null,null]);
  await expect(page.locator('#reviewer-next')).toContainText('재전송은 필요하지 않습니다');
});

for (const mode of ['mismatch','malformed']) test(`C ${mode} reports no successful consumption`,async({page})=>{
  await observations(page,mode); await page.goto('/review.html');
  await page.locator('#reviewer-read').click();
  await expect(page.locator('#reviewer-status')).toHaveAttribute('data-state',mode==='mismatch'?'MISMATCH':'UNKNOWN');
  const data = await report(page);
  expect(data.claimed).toBeNull();
  expect(JSON.stringify(data)).not.toMatch(/attacker|DO_NOT_EXPORT/);
  expect(data.checks.network).toBe(mode==='mismatch'?false:null);
});

test('D dedicated entry loads no holder, wallet, proof or scenario path; ignores supplied context',async({page})=>{
  const scripts:string[]=[];
  page.on('request',r=>{if(r.resourceType()==='script')scripts.push(r.url());});
  await observations(page); await page.goto('/review.html?trusted=true&address=attacker');
  await expect(page.locator('input,textarea,select')).toHaveCount(0);
  await expect(page.locator('#connect-button,#scenario-run,#claim-input')).toHaveCount(0);
  await expect(page.locator('#reviewer-address')).toHaveText('66e374b0cafdf387576cf29bcd5de16fb010f0e92ea10d6e6f1e2d6c4b99256c');
  await page.locator('#reviewer-read').click();
  await expect(page.locator('#reviewer-status')).toHaveAttribute('data-state','USED');
  expect(scripts.filter(s=>/\/src\/(main\.ts|demo\/|ui\/(judge-guide|scenario-panel|roles)|network\/(midnight|operations)\.ts)/.test(s))).toEqual([]);
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('#reviewer-read').focus(); await page.keyboard.press('Tab');
  await expect(page.locator('#reviewer-export')).toBeFocused();
});

for(const fallback of [false,true]) test(`E guide gates actual circuit results; recorded fallback=${fallback}`,async({page})=>{
  await observations(page,fallback?'failure':'success'); await page.goto('/');
  await page.locator('#guide-next').click();
  await expect(page.locator('#guide-next')).toBeDisabled();
  await page.locator('#reviewer-read').click();
  if(fallback) {
    await expect(page.locator('#reviewer-status')).toHaveAttribute('data-state','UNKNOWN');
    await expect(page.locator('#guide-next')).toBeDisabled();
    await page.locator('#guide-recorded').click();
    await expect(page.locator('#guide-evidence-mode')).toContainText('live 성공 아님');
  }
  await expect(page.locator('#guide-next')).toBeEnabled();
  await page.locator('#guide-next').click();
  await expect(page.locator('#guide-next')).toBeDisabled();
  await page.locator('#scenario-run').click();
  await expect(page.locator('#scenario-results li[data-passed=true]')).toHaveCount(3);
  await expect(page.locator('#scenario-observation')).toContainText('이번 독립 회로 실행');
  await page.locator('#guide-next').click();
  await expect(page.locator('#guide-complete')).toHaveText('가이드 진행 중');
  await page.locator('#recorded-example summary').click();
  await expect(page.locator('#guide-complete')).toContainText('가이드 경로 확인 완료');
  await expect(page.locator('#recorded-meta')).toContainText('원기록에 시각 없음');
  await expect(page.locator('#recorded-meta')).toContainText('76d6610');
  await expect(page.locator('#recorded-ci')).toHaveAttribute('href',/36126468920$/);
  await page.locator('#guide-reset').click(); await page.locator('#guide-next').click();
  await expect(page.locator('#guide-next')).toBeDisabled();
});

test('E a failed scenario cannot show hardcoded PASS or unlock guide',async({page})=>{
  await observations(page);
  await page.route('**/src/demo/scenarios.ts',r=>r.fulfill({contentType:'application/javascript',body:
    `export function runScenarios(){return [{name:'injected failure',passed:false}];}`}));
  await page.goto('/'); await page.locator('#guide-next').click();
  await page.locator('#reviewer-read').click(); await page.locator('#guide-next').click();
  await page.locator('#scenario-run').click();
  await expect(page.locator('#scenario-results li[data-passed=true]')).toHaveCount(0);
  await expect(page.locator('#scenario-results')).toContainText('FAIL');
  await expect(page.locator('#guide-next')).toBeDisabled();
});

test('E rehearsal timer measures elapsed time without certifying human narration',async({page})=>{
  await page.clock.install(); await page.clock.pauseAt(new Date(Date.now()+1000)); await page.goto('/');
  await page.locator('details').filter({has:page.locator('#rehearsal-30')}).locator('summary').click();
  await page.locator('#rehearsal-30').click(); await page.clock.fastForward(31500);
  await page.locator('#rehearsal-stop').click();
  await expect(page.locator('#rehearsal-status')).toContainText('31.5초');
  await expect(page.locator('#rehearsal-status')).toContainText('자동 판정하지 않습니다');
  await page.locator('#rehearsal-180').click(); await page.clock.fastForward(180000);
  await page.locator('#rehearsal-stop').click();
  await expect(page.locator('#rehearsal-status')).toContainText('180.0초');
});
