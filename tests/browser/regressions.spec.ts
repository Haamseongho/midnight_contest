import { test, expect } from "@playwright/test";

// Boundary doubles only for request ordering/error injection. The actual app
// entry, DOM event handlers, rendering and compiled local circuit run unchanged.
const networkDouble = `
export class MidnightSession {
  networkId = 'preview';
  static async connect(n) { const s = new MidnightSession(); s.networkId = n; return s; }
  async read(a) {
    await new Promise(r => setTimeout(r, a === 'slow-A' ? 400 : 20));
    if(a === 'failure') throw Error('Injected read failure');
    return {commitment: a, claimed: a === 'B'};
  }
  async deploy(secret,hooks) { hooks?.balancing(); hooks?.submitting(('00' + 'a'.repeat(64))); return {address:'A',state:{commitment:'A',claimed:false},txId:('00' + 'a'.repeat(64))}; }
  async claim(address,secret,hooks) { hooks?.balancing(); hooks?.submitting(('00' + 'b'.repeat(64))); return {commitment:address,claimed:true,txId:('00' + 'b'.repeat(64))}; }
}
`;
async function connected(page: import("@playwright/test").Page) {
  await page.route('**/src/network/midnight.ts', r => r.fulfill({ contentType: 'application/javascript', body: networkDouble }));
  await page.goto('/');
  await page.locator('#connect-button').click();
  await expect(page.locator('#network-status')).toContainText('연결됨');
}

test('U1 DOM: A → B removes old tx; success → failure displays UNKNOWN', async ({ page }) => {
  await connected(page);
  await page.locator('#network-generate-button').click();
  await page.locator('#deploy-button').click();
  await expect(page.locator('#network-deploy-tx-value')).toHaveText(('00' + 'a'.repeat(64)));
  await page.locator('#network-address').fill('B');
  await expect(page.locator('#network-feedback')).toContainText('UNKNOWN');
  await page.locator('#network-read-button').click();
  await expect(page.locator('#network-commitment-value')).toHaveText('B');
  await expect(page.locator('#network-deploy-tx-value')).toHaveText('—');
  await expect(page.locator('#network-claim-tx-value')).toHaveText('—');
  await page.locator('#network-address').fill('failure');
  await page.locator('#network-read-button').click();
  await expect(page.locator('#network-feedback')).toContainText('UNKNOWN');
  await expect(page.locator('#network-commitment-value')).toHaveText('—');
  await expect(page.locator('#network-claimed-value')).toHaveText('UNKNOWN');
});
test('U1 DOM: slow A cannot overwrite fast B or a changed network', async ({ page }) => {
  await connected(page);
  await page.locator('#network-address').fill('slow-A');
  await page.locator('#network-read-button').click();
  await page.locator('#network-address').fill('B');
  await page.locator('#network-read-button').click();
  await expect(page.locator('#network-commitment-value')).toHaveText('B');
  await page.waitForTimeout(500);
  await expect(page.locator('#network-commitment-value')).toHaveText('B');
  await page.locator('#network-address').fill('slow-A');
  await page.locator('#network-read-button').click();
  await page.locator('#network-id').selectOption('undeployed');
  await page.waitForTimeout(500);
  await expect(page.locator('#network-claimed-value')).toHaveText('UNKNOWN');
});
test('U1 DOM: both local/network clear erase generated AND claim-only inputs', async ({ page }) => {
  await page.goto('/');
  for(const [generate, input, clear, output] of [
    ['#generate-button','#claim-input','#clear-button','#secret-output'],
    ['#network-generate-button','#network-claim-secret','#network-clear-button','#network-secret-output'],
  ]) {
    await page.locator(generate).click();
    await page.locator(input).fill('c'.repeat(64));
    await page.locator(clear).click();
    await expect(page.locator(input)).toHaveValue('');
    await expect(page.locator(output)).toHaveValue('');
    await page.locator(input).fill('d'.repeat(64));
    await expect(page.locator(clear)).toBeEnabled();
    await page.locator(clear).click();
    await expect(page.locator(input)).toHaveValue('');
  }
});
test('U3 DOM: disposable actual compiled circuit rejects wrong secret and replay without consuming holder session', async ({ page }) => {
  await page.goto('/');
  await page.locator('#generate-button').click();
  const commitment = await page.locator('#commitment-value').textContent();
  await page.locator('#scenario-run').click();
  await expect(page.locator('#scenario-results li[data-passed=true]')).toHaveCount(3);
  await expect(page.locator('#claimed-value')).toHaveText('미사용');
  await expect(page.locator('#commitment-value')).toHaveText(commitment!);
  await expect(page.locator('#reviewer-status')).toHaveAttribute('data-state','IDLE');
  await page.getByText('Recorded example · 과거 검증 기록',{exact:true}).click();
  await expect(page.locator('#recorded-claim')).toHaveText('0032856554b96a452286646176f4a0e689808d22615069eb9a498973493cee35dc');
});

test('presentation flow stays usable on a narrow screen without horizontal overflow', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.locator('#scenario-run').click();
  await expect(page.locator('#scenario-results li[data-passed=true]')).toHaveCount(3);
  await page.getByText('Recorded example · 과거 검증 기록',{exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const fault of ['network','address','commitment','malformed','timeout','failure','stale']) {
  test(`U2 DOM: ${fault} cannot display success`, async ({ page }) => {
    await page.route('**/src/network/public-reader.ts', r => r.fulfill({contentType:'application/javascript', body: `
      import {TRUSTED_CONTEXT as c} from '/src/context/trusted-context.ts';
      export async function readTrustedPublicState(id) {
        ${fault === 'timeout' ? 'return new Promise(()=>{});' : ''}
        ${fault === 'failure' ? 'throw Error("Injected");' : ''}
        const o = {network:c.network,address:c.address,commitment:c.commitment,claimed:true,requestId:id,observedAt:new Date().toISOString(),contextVersion:c.version};
        ${['network','address','commitment'].includes(fault) ? `o.${fault} = ${fault === 'commitment' ? "'0'.repeat(64)" : "'wrong'"};` : ''}
        ${fault === 'malformed' ? "o.claimed = 'true';" : ''}
        ${fault === 'stale' ? "o.observedAt = '2000-01-01T00:00:00Z';" : ''}
        return o;
      }` }));
    await page.goto('/');
    await page.locator('#reviewer-read').click();
    await expect(page.locator('#reviewer-status')).toHaveAttribute('data-state', /UNKNOWN|MISMATCH/, {timeout:20_000});
    await expect(page.locator('#reviewer-status')).not.toHaveAttribute('data-state', /USED|UNUSED/);
  });
}
test('U2 DOM: slow observation is discarded after newer success', async ({page}) => {
  await page.route('**/src/network/public-reader.ts', r => r.fulfill({contentType:'application/javascript',body:`
    import {TRUSTED_CONTEXT as c} from '/src/context/trusted-context.ts'; let i=0;
    export async function readTrustedPublicState(requestId) { const n=++i; await new Promise(r=>setTimeout(r,n===1?400:10)); return {network:c.network,address:c.address,commitment:c.commitment,claimed:n===2,requestId,observedAt:new Date().toISOString(),contextVersion:c.version}; }`}));
  await page.goto('/');
  await page.locator('#reviewer-read').click();
  await page.locator('#reviewer-read').click();
  await expect(page.locator('#reviewer-status')).toHaveAttribute('data-state','USED');
  await page.waitForTimeout(500);
  await expect(page.locator('#reviewer-status')).toHaveAttribute('data-state','USED');
});

test('U2 actual Preview read: fresh browser, zero wallet/private input/transaction requests', async ({page}, info) => {
  test.skip(!process.env.LIVE_PREVIEW, 'Explicit network evidence run: npm run test:preview');
  let walletCalls=0; let transactionRequests=0;
  const requests: string[]=[];
  await page.exposeFunction('walletTouched',()=>{walletCalls++;});
  await page.addInitScript(()=>Object.defineProperty(window,'midnight',{get(){(window as any).walletTouched();throw Error('Wallet forbidden');}}));
  page.on('request',r=>{ if(r.url().includes('indexer.preview')) requests.push(r.postData() ?? ''); if(/submitTransaction|balanceUnsealedTransaction/.test(r.postData() ?? '')) transactionRequests++; });
  await page.goto('/?trusted=true&network=mainnet&address=attacker');
  await page.locator('#reviewer-read').click();
  await expect(page.locator('#reviewer-status')).toHaveAttribute('data-state','USED',{timeout:25_000});
  expect(walletCalls).toBe(0); expect(transactionRequests).toBe(0);
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every(r=>r.includes('66e374b0cafdf387576cf29bcd5de16fb010f0e92ea10d6e6f1e2d6c4b99256c') && !r.includes('mutation'))).toBe(true);
  await expect(page.locator('#claim-input')).toHaveValue('');
  await expect(page.locator('#network-claim-secret')).toHaveValue('');
  await expect(page.locator('#reviewer-status')).toHaveText('사용 기록 있음');
  await info.attach('preview-read-evidence',{body:JSON.stringify({observed:await page.locator('#reviewer-observation').textContent(),walletCalls,transactionRequests,privateInputs:0,requests},null,2),contentType:'application/json'});
  await page.screenshot({path:info.outputPath('preview-reviewer.png'),fullPage:true});
});

for (const mode of ['reject','late','disconnect']) {
  test(`U4 DOM: ${mode}, guard and recovery`, async ({page}) => {
    await page.route('**/src/network/midnight.ts',r=>r.fulfill({contentType:'application/javascript',body:`
      export class MidnightSession {
        networkId='preview'; static async connect(){return new MidnightSession();}
        async deploy(secret,hooks){
          hooks.balancing();
          ${mode==='reject' ? "throw Object.assign(Error('Declined'),{code:'Rejected'});" : ''}
          ${mode==='late' ? 'await new Promise(r=>setTimeout(r,200000));' : ''}
          hooks.submitting(('00' + 'a'.repeat(64)));
          ${mode==='disconnect' ? "throw Error('Disconnected');" : ''}
          return {address:'A',state:{commitment:'A',claimed:false},txId:('00' + 'a'.repeat(64))};
        }
        async transactionStatus(txId){return {txId,status:'SucceedEntirely'};}
      }`}));
    await page.clock.install();
    await page.goto('/');
    await page.locator('#connect-button').click();
    await expect(page.locator('#network-status')).toContainText('연결됨');
    await page.locator('#network-generate-button').click();
    await page.locator('#deploy-button').click();
    if (mode==='reject') {
      await expect(page.locator('#operation-status')).toHaveAttribute('data-state','REJECTED');
      await expect(page.locator('#deploy-button')).toBeEnabled();
    } else if(mode==='late') {
      await expect(page.locator('#operation-status')).toHaveAttribute('data-state','PENDING');
      await page.clock.fastForward(180001);
      await expect(page.locator('#operation-status')).toHaveAttribute('data-state','UNKNOWN');
      await expect(page.locator('#deploy-button')).toBeDisabled();
      await expect(page.locator('#network-claim-button')).toBeDisabled();
      await page.clock.fastForward(20000);
      await expect(page.locator('#operation-status')).toHaveAttribute('data-state','CONFIRMED');
      await expect(page.locator('#network-deploy-tx-value')).toHaveText(('00' + 'a'.repeat(64)));
    } else {
      await expect(page.locator('#operation-status')).toHaveAttribute('data-state','UNKNOWN');
      await page.reload();
      await page.locator('#connect-button').click();
      await expect(page.locator('#operation-status')).toHaveAttribute('data-state','UNKNOWN');
      await expect(page.locator('#network-claim-button')).toBeDisabled();
      await expect(page.locator('#operation-cancel')).toBeDisabled();
      await page.locator('#operation-recover').click();
      await expect(page.locator('#operation-status')).toHaveAttribute('data-state','CONFIRMED');
    }
  });
}
