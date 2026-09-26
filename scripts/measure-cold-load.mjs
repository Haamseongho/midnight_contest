/** Read-only browser timing. No wallet/transaction/form actions. */
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const BASE=process.env.DEMO_URL || 'https://haamseongho.github.io/midnight_contest/';
const args=process.argv.slice(2);
if(args.length && (args.length!==2 || args[0]!=='--out')) throw Error('USAGE: [DEMO_URL=url] node scripts/measure-cold-load.mjs [--out report.json]');
const baseURL=new URL(BASE);
if(!['http:','https:'].includes(baseURL.protocol) || baseURL.username || baseURL.password || baseURL.search || baseURL.hash || !baseURL.pathname.endsWith('/')) throw Error('Expected an HTTP(S) base URL ending in /, without credentials, query or fragment');
const browser=await chromium.launch();const rows=[];
try {
 for(const path of ['', 'review.html'])for(let trial=1;trial<=3;trial++){
  const context=await browser.newContext({serviceWorkers:'block'});const page=await context.newPage();
  const session=await context.newCDPSession(page);await session.send('Network.enable');await session.send('Network.clearBrowserCache');await session.send('Network.setCacheDisabled',{cacheDisabled:true});
  const row={url:BASE+path,trial,state:'NOT_VERIFIED'};const t=performance.now();
  try {
   const response=await page.goto(BASE+path,{waitUntil:'domcontentloaded',timeout:60000});row.httpStatus=response?.status();
   await page.locator('#app-startup[data-boot-state=READY]').waitFor({state:'visible',timeout:60000});
   await page.locator('#reviewer-read').waitFor({state:'visible',timeout:60000});
   row.reviewerVisibleWallMs=performance.now()-t;
   Object.assign(row,await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {
    ttfbMs:n?n.responseStart-n.requestStart:null,domContentLoadedMs:n?n.domContentLoadedEventEnd:null,
    firstContentfulPaintMs:performance.getEntriesByName('first-contentful-paint')[0]?.startTime??null,
    resources:performance.getEntriesByType('resource').filter(r=>/\.wasm|\.js/.test(r.name)).map(r=>({url:r.name,durationMs:r.duration,transferBytes:r.transferSize,decodedBytes:r.decodedBodySize}))};}));
   row.state='PAGE_READY_OBSERVED';
  }catch(e){row.state='NOT_VERIFIED';row.reason=e instanceof Error?e.message.slice(0,500):'BROWSER_ERROR';}
  rows.push(row);await context.close();
 }
}finally{await browser.close();}
const report={baseURL:BASE,scope:'Three fresh/cache-disabled browser contexts per entry. SDK READY plus visible button, not query success. No actual Preview read or wallet operation. Loopback results are not public Internet latency.',observedAt:new Date().toISOString(),rows};
await writeFile(args[1] || 'cold-load-observations.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));if(rows.some(r=>r.state!=='PAGE_READY_OBSERVED'))process.exitCode=1;
