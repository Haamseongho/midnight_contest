/** Read-only release gate. Never pushes, deploys, submits, or authenticates a wallet. */
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const API='https://api.github.com/repos/Haamseongho/midnight_contest';
const DEMO='https://haamseongho.github.io/midnight_contest/';
const shaPattern=/^[a-f0-9]{40}$/;
export function validateRelease(s) {
  const fail=[];
  if (!shaPattern.test(s?.before??'')) fail.push('INVALID_MAIN_SHA');
  if (s.before!==s.after) fail.push('CONCURRENT_MAIN_CHANGE');
  if (s.release?.sourceCommit!==s.before || s.release?.sourceRef!=='refs/heads/main') fail.push('RELEASE_MAIN_MISMATCH');
  if (!/^\d+$/.test(String(s.release?.workflowRun??''))) fail.push('INVALID_PAGES_RUN_ID');
  const exact=(run)=>run?.head_sha===s.before&&run?.head_branch==='main'&&run?.status==='completed'&&run?.conclusion==='success';
  if (!exact(s.pages)||String(s.pages?.id)!==String(s.release?.workflowRun)||s.pages?.path!=='.github/workflows/pages.yml') fail.push('PAGES_NOT_VERIFIED');
  if (!exact(s.ci)||s.ci?.path!=='.github/workflows/ci.yml') fail.push('CI_NOT_VERIFIED');
  for (const name of ['verify','local-e2e']) if (!s.ciJobs?.some(j=>j.name===name&&j.conclusion==='success'&&j.status==='completed')) fail.push('CI_JOB_'+name+'_NOT_VERIFIED');
  for (const name of ['build','deploy']) if (!s.pagesJobs?.some(j=>j.name===name&&j.conclusion==='success'&&j.status==='completed')) fail.push('PAGES_JOB_'+name+'_NOT_VERIFIED');
  if (s.demoHTTP!==200||s.reviewerHTTP!==200) fail.push('DEMO_HTTP_NOT_VERIFIED');
  return {schema:'silent-pass-release-gate-v1',status:fail.length?'BLOCKED':'RELEASE_PROVENANCE_VERIFIED',failures:fail,
    sourceCommit:s.before,ciRun:s.ci?.id??null,pagesRun:s.pages?.id??null,
    verifiedAt:new Date().toISOString(),
    limitations:['Metadata plus GitHub API comparison, not cryptographic attestation.','HTTP 200 is not browser functionality, live Preview success, human validation, registration or submission.']};
}
async function readJSON(url) {
  const r=await fetch(url,{headers:{Accept:'application/vnd.github+json'},cache:'no-store',signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw Error('PUBLIC_READ_HTTP_'+r.status);
  const text=await r.text();if(text.length>4*1024*1024)throw Error('PUBLIC_RESPONSE_TOO_LARGE');return JSON.parse(text);
}
async function httpStatus(url) {
 const r=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(20000)});const status=r.status;await r.body?.cancel();return status;
}
export async function collectRelease() {
 const before=(await readJSON(API+'/git/ref/heads/main')).object.sha;
 const release=await readJSON(DEMO+'release.json');
 if(!/^\d+$/.test(String(release.workflowRun??'')))throw Error('INVALID_PAGES_RUN_ID');
 const pages=await readJSON(API+'/actions/runs/'+release.workflowRun);
 const runs=await readJSON(API+'/actions/runs?branch=main&per_page=20');
 const ci=runs.workflow_runs.find(r=>r.head_sha===before&&r.path==='.github/workflows/ci.yml');
 if(!ci)throw Error('MATCHING_CI_NOT_FOUND_IN_LAST_20_RUNS');
 const ciJobs=(await readJSON(API+'/actions/runs/'+ci.id+'/jobs?per_page=100')).jobs;
 const pagesJobs=(await readJSON(API+'/actions/runs/'+pages.id+'/jobs?per_page=100')).jobs;
 const demoHTTP=await httpStatus(DEMO),reviewerHTTP=await httpStatus(DEMO+'review.html');
 const after=(await readJSON(API+'/git/ref/heads/main')).object.sha;
 return validateRelease({before,after,release,pages,ci,ciJobs,pagesJobs,demoHTTP,reviewerHTTP});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
 try {
  const args=process.argv.slice(2);if(args.length&&!((args.length===2)&&args[0]==='--out'))throw Error('USAGE: node scripts/verify-submission-release.mjs [--out report.json]');
  const report=await collectRelease();if(args.length)await writeFile(args[1],JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));if(report.status!=='RELEASE_PROVENANCE_VERIFIED')process.exitCode=1;
 }catch(e){console.error(JSON.stringify({status:'BLOCKED',reason:e instanceof Error?e.message:'READ_FAILED'}));process.exitCode=1;}
}
