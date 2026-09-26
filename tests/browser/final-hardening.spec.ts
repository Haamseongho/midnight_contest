import { test, expect } from '@playwright/test';

// Boundary faults exercise the real source-entry DOM, not a real wallet/chain.
test('unknown provider error cannot echo raw private-looking data',async({page})=>{
 await page.route('**/src/network/midnight.ts',r=>r.fulfill({contentType:'application/javascript',body:`export class MidnightSession {static async connect(){throw Error('SYNTHETIC_DO_NOT_DISPLAY_47 <img src=x onerror=alert(1)>');}}`}));
 await page.goto('/');await page.locator('#connect-button').click();
 await expect(page.locator('#network-feedback')).toContainText('오류 원문은 표시하지');
 await expect(page.locator('#network-feedback')).not.toContainText('SYNTHETIC_DO_NOT_DISPLAY_47');
 await expect(page.locator('#network-feedback img')).toHaveCount(0);
});
test('unknown local generation error is bounded',async({page})=>{
 await page.goto('/');await expect(page.locator('#app-startup')).toHaveAttribute('data-boot-state','READY');
 await page.evaluate(()=>{crypto.getRandomValues=(()=>{throw Error('SYNTHETIC_DO_NOT_DISPLAY_47')}) as typeof crypto.getRandomValues;});
 await page.locator('#generate-button').click();await expect(page.locator('#claim-feedback')).toContainText('오류 원문은 표시하지');
 await expect(page.locator('#claim-feedback')).not.toContainText('SYNTHETIC_DO_NOT_DISPLAY_47');
});
test('reviewer bootstrap failure is explicit, without invented live success',async({page})=>{
 await page.route('**/src/review.ts',r=>r.abort('failed'));
 await page.goto('/review.html');await expect(page.locator('#app-startup')).toHaveAttribute('data-boot-state','FAILED');
 await expect(page.locator('#app-startup-status')).toContainText('live 성공이 아닙니다');await expect(page.locator('#reviewer-read')).toHaveCount(0);
 await expect(page.locator('#app-startup a')).toHaveAttribute('href',/\/f87aee390.*\/docs\/PREVIEW_DEPLOYMENT.md$/);
});
test('startup ready never means live read or admission',async({page})=>{
 await page.goto('/review.html');await expect(page.locator('#app-startup')).toHaveAttribute('data-boot-state','READY');
 await expect(page.locator('#reviewer-status')).toHaveAttribute('data-state','IDLE');await expect(page.locator('#app-startup-status')).toContainText('공개 조회 결과가 아닙니다');
 await expect(page.locator('input,textarea,select')).toHaveCount(0);
});
test('retry help and referrer policy are explicit on both entries',async({page})=>{
 await page.goto('/');await expect(page.locator('body')).toContainText('원래 거래 ID의 최종 결과를 확인하기 전에는 재전송하지');await expect(page.locator('body')).not.toContainText('공개 상태를 조회한 후에만 재시도');
 for(const path of ['/','/review.html']){await page.goto(path);await expect(page.locator('meta[name=referrer]')).toHaveAttribute('content','no-referrer');}
});
test('patched startup at 390px does not overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/review.html');await expect(page.locator('#app-startup')).toHaveAttribute('data-boot-state','READY');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('cancel write failure is caught by the real handler and never broadcasts a late response',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const storage=window.sessionStorage;
  Object.defineProperty(window,'sessionStorage',{value:{getItem:(k:string)=>storage.getItem(k),setItem:(k:string,v:string)=>{if((window as any).failWrite)throw Error('SYNTHETIC_DO_NOT_DISPLAY_47');storage.setItem(k,v);}}});
  (window as any).broadcasts=0;
 });
 await page.route('**/src/network/midnight.ts',r=>r.fulfill({contentType:'application/javascript',body:`
  export class MidnightSession {networkId='preview';static async connect(){return new MidnightSession()}
   async deploy(secret,h){h.balancing();await new Promise(r=>window.finishTestWallet=r);h.submitting('00'+'a'.repeat(64));window.broadcasts++;return {txId:'00'+'a'.repeat(64)};}}
 `}));
 await page.goto('/');await expect(page.locator('#app-startup')).toHaveAttribute('data-boot-state','READY');
 await page.locator('#connect-button').click();await expect(page.locator('#network-status')).toContainText('연결됨');
 await page.locator('#network-generate-button').click();await page.locator('#deploy-button').click();
 await expect(page.locator('#operation-cancel')).toBeEnabled();
 const original=await page.evaluate(()=>sessionStorage.getItem('silent-pass.operation.v1'));
 await page.evaluate(()=>{(window as any).failWrite=true;});await page.locator('#operation-cancel').click();
 await expect(page.locator('#operation-status')).toHaveAttribute('data-state','BLOCKED');
 await expect(page.locator('#network-feedback')).toContainText('BLOCKED');
 await expect(page.locator('body')).not.toContainText('SYNTHETIC_DO_NOT_DISPLAY_47');
 expect(await page.evaluate(()=>sessionStorage.getItem('silent-pass.operation.v1'))).toBe(original);
 await page.evaluate(()=>{(window as any).finishTestWallet();});
 await expect(page.locator('#operation-storage-retry')).toBeEnabled();
 expect(await page.evaluate(()=>(window as any).broadcasts)).toBe(0);expect(errors).toEqual([]);
 await expect(page.locator('#deploy-button')).toBeDisabled();
});
