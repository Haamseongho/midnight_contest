import test from 'node:test';import assert from 'node:assert/strict';
import {validateRelease} from '../scripts/verify-submission-release.mjs';
const sha='a'.repeat(40);
const job=name=>({name,status:'completed',conclusion:'success'});
const run=(id,path)=>({id,path,head_sha:sha,head_branch:'main',status:'completed',conclusion:'success'});
const snapshot=()=>({before:sha,after:sha,release:{sourceCommit:sha,sourceRef:'refs/heads/main',workflowRun:'100'},pages:run(100,'.github/workflows/pages.yml'),ci:run(101,'.github/workflows/ci.yml'),ciJobs:['verify','local-e2e'].map(job),pagesJobs:['build','deploy'].map(job),demoHTTP:200,reviewerHTTP:200});
test('matching public evidence passes only release provenance, not submission',()=>{const r=validateRelease(snapshot());assert.equal(r.status,'RELEASE_PROVENANCE_VERIFIED');assert.match(r.limitations.join(' '),/not browser/);});
for(const [name,change] of [
 ['concurrent HEAD',s=>s.after='b'.repeat(40)],['old deployment',s=>s.release.sourceCommit='b'.repeat(40)],['dev ref',s=>s.release.sourceRef='refs/heads/dev_haams'],['run tamper',s=>s.release.workflowRun='../bad'],['wrong Pages SHA',s=>s.pages.head_sha='b'.repeat(40)],['failed CI',s=>s.ci.conclusion='failure'],['missing local E2E',s=>s.ciJobs.pop()],['failed deploy',s=>s.pagesJobs[1].conclusion='failure'],['reviewer404',s=>s.reviewerHTTP=404],['wrong workflow',s=>s.ci.path='other.yml'],
])test('release guard rejects '+name,()=>{const s=snapshot();change(s);assert.equal(validateRelease(s).status,'BLOCKED');});
