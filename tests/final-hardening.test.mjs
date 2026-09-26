import test from 'node:test';
import assert from 'node:assert/strict';
import { networkErrorMessage, localErrorMessage, requiresWalletReconnect, assertSpendableDust } from '../src/network/errors.ts';
import { OperationTracker } from '../src/network/operations.ts';
const sentinel='SYNTHETIC_DO_NOT_DISPLAY_47';
test('actual contract-not-found exception gives bounded guidance',()=>{
 assert.match(networkErrorMessage(Error('해당 주소의 계약을 찾을 수 없습니다.')),/미검출은 이전 거래 실패의 증거가 아닙니다/);
});
for (const error of [new Error(sentinel), new Error('private='+ 'a'.repeat(64)), Object.assign(Error('unknown'),{reason:sentinel}), sentinel, null, {message:sentinel}]) {
 test('unknown provider errors cannot echo raw data: '+typeof error,()=>{
  const out=networkErrorMessage(error); assert.equal(out.includes(sentinel),false);assert.equal(out.includes('a'.repeat(64)),false);assert.ok(out.length<500);
 });
}
test('error accessors and toString are not evaluated',()=>{
 let calls=0;const e={get message(){calls++;throw Error(sentinel)},get code(){calls++;throw Error(sentinel)},toString(){calls++;throw Error(sentinel)}};
 assert.doesNotThrow(()=>networkErrorMessage(e));assert.equal(requiresWalletReconnect(e),false);assert.equal(calls,0);
});
test('revoked proxy safely falls back',()=>{
 const {proxy,revoke}=Proxy.revocable({},{});revoke();assert.doesNotThrow(()=>networkErrorMessage(proxy));assert.equal(requiresWalletReconnect(proxy),false);
});
test('known mismatch uses a fixed literal, not arbitrary raw passthrough',()=>{
 assert.equal(networkErrorMessage(Error('Secret does not match commitment')),'Secret does not match commitment');
 assert.ok(!networkErrorMessage(Error('Secret does not match commitment '+sentinel)).includes(sentinel));
});
test('local circuit errors hide unknown data and preserve valid format advice',()=>{
 assert.ok(!localErrorMessage(Error(sentinel)).includes(sentinel));assert.match(localErrorMessage(Error('already claimed')),/이미 사용/);assert.match(localErrorMessage(Error('Secret does not match commitment')),/일치하지/);assert.match(localErrorMessage(Error('64자리 16진수 비밀값을 입력해 주세요.')),/64자리/);
});
test('dust fail-before-send guidance remains in the actual local exception',()=>{
 assert.throws(()=>assertSpendableDust({balance:0n,cap:1n}),/거래는 전송되지/);assert.throws(()=>assertSpendableDust({balance:0n,cap:0n}),/생성 한도/);assert.doesNotThrow(()=>assertSpendableDust({balance:1n,cap:1n}));
});
test('known reconnect markers remain actionable',()=>{
 assert.equal(requiresWalletReconnect(Error('Could not load midnight wallet for account '+sentinel)),true);
 assert.match(networkErrorMessage(Error('socket disconnected')),/연결이 끊어졌습니다/);
});
const tx='00'+'a'.repeat(64);
function storage(raw=null){return {getItem:()=>raw,setItem:(_,v)=>{raw=v},raw:()=>raw,set:(v)=>{raw=v}}}
for(const raw of ['{broken','{}','null','[]',JSON.stringify({id:'x',network:'mainnet'})]){
 test('F1 unchanged: malformed record stays blocked and preserved '+raw.slice(0,20),()=>{
  const s=storage(raw),t=new OperationTracker(s);assert.equal(t.blocked,true);t.retryStorage();assert.equal(s.raw(),raw);assert.equal(t.blocked,true);s.set(null);t.retryStorage();assert.equal(t.blocked,true);
 });
}
for(const failAt of [1,2,3])test('F1 unchanged: write failure prohibits broadcast, phase '+failAt,async()=>{
 let raw=null,writes=0,fail=true,broadcasts=0;const t=new OperationTracker({getItem:()=>raw,setItem:(_,v)=>{if(++writes===failAt&&fail)throw Error('quota');raw=v}});
 const run=t.run('deploy','preview',undefined,async h=>{h.balancing();h.submitting(tx);broadcasts++;return{txId:tx}},()=>{});
 if(failAt===1)await assert.rejects(run,/BLOCKED/);else await run;assert.equal(broadcasts,0);assert.equal(t.blocked,true);fail=false;t.retryStorage();assert.equal(t.blocked,false);assert.equal(t.current.status,'UNKNOWN');assert.equal(t.current.txId,undefined);t.cancelBeforeSubmission();assert.equal(t.current.status,'CANCELLED');
});
test('UNKNOWN survives reload and exact final status alone releases the guard',async()=>{
 const s=storage(),t=new OperationTracker(s);await t.run('claim','preview','A',async h=>{h.submitting(tx);throw Error('response lost')},()=>{});
 const restored=new OperationTracker(s);assert.equal(restored.current.status,'UNKNOWN');await assert.rejects(restored.run('claim','preview','A',async()=>({}),()=>{}),/미확정/);
 await restored.reconcile('preview',async id=>({txId:id,status:'not-found'}));assert.equal(restored.current.status,'UNKNOWN');
 await assert.rejects(restored.reconcile('preprod',async()=>({txId:tx,status:'SucceedEntirely'})),/네트워크/);
 await restored.reconcile('preview',async id=>({txId:id,status:'SucceedEntirely'}));assert.equal(restored.current.status,'CONFIRMED');
});
test('cancel persistence fault stays fail closed; cannot silently start another operation',async()=>{
 let fail=false,raw=null,finish;const t=new OperationTracker({getItem:()=>raw,setItem:(_,v)=>{if(fail)throw Error('quota');raw=v}});
 const pending=t.run('deploy','preview',undefined,async h=>{h.balancing();await new Promise(r=>finish=r);h.submitting(tx);return{txId:tx}},()=>{},10);
 await new Promise(r=>setTimeout(r,0));fail=true;assert.throws(()=>t.cancelBeforeSubmission(),/BLOCKED/);assert.equal(t.blocked,true);await assert.rejects(t.run('deploy','preview',undefined,async()=>({}),()=>{}),/BLOCKED/);finish();await pending;
});
