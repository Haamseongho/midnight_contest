import test from 'node:test';
import assert from 'node:assert/strict';
import { OperationTracker } from '../src/network/operations.ts';

const txId = ('00' + 'a'.repeat(64));
const storage = () => { let data=null; return {getItem:()=>data,setItem:(_,v)=>{data=v;}}; };
const delay = ms => new Promise(r=>setTimeout(r,ms));

test('U4 approval succeeds; definitive rejection releases the guard', async()=>{
  const tracker = new OperationTracker();
  await tracker.run('claim','preview','contract',async hooks=>{
    hooks.balancing(); hooks.submitting(txId); return {txId};
  },()=>{});
  assert.equal(tracker.current.status,'CONFIRMED');
  await tracker.run('claim','preview','contract',async hooks=>{
    hooks.balancing(); throw Object.assign(new Error('User refused'),{code:'Rejected'});
  },()=>{});
  assert.equal(tracker.current.status,'REJECTED');
});
test('U4 timeout blocks duplicate send; late success resolves the SAME operation', async()=>{
  const tracker = new OperationTracker();
  let complete;
  let renders=0;
  await tracker.run('claim','preview','contract',hooks=>{
    hooks.submitting(txId); return new Promise(r=>complete=r);
  },()=>{renders++;},5);
  const id = tracker.current.id;
  assert.equal(tracker.current.status,'UNKNOWN');
  await assert.rejects(tracker.run('claim','preview','contract',async()=>({txId}),()=>{}),/미확정/);
  complete({txId}); await delay(0);
  assert.equal(tracker.current.id,id);
  assert.equal(tracker.current.status,'CONFIRMED');
  assert.equal(renders,1);
});
test('U4 disconnect after sending stays UNKNOWN across reload; exact final tx resolves it',async()=>{
  const store=storage(); const tracker=new OperationTracker(store);
  await tracker.run('claim','preview','contract',async hooks=>{
    hooks.submitting(txId); throw Error('Disconnected');
  },()=>{});
  assert.equal(tracker.current.status,'UNKNOWN');
  const restored=new OperationTracker(store);
  assert.equal(restored.current.id,tracker.current.id);
  await assert.rejects(restored.reconcile('preprod',async()=>({txId,status:'SucceedEntirely'})),/같은 네트워크/);
  await assert.rejects(restored.reconcile('preview',async()=>({txId:('00' + 'b'.repeat(64)),status:'SucceedEntirely'})),/불일치/);
  await restored.reconcile('preview',async()=>({txId,status:'FailFallible'}));
  assert.equal(restored.current.status,'UNKNOWN');
  await restored.reconcile('preview',async()=>({txId,status:'SucceedEntirely'}));
  assert.equal(restored.current.status,'CONFIRMED');
});
test('U4 timeout/absent transaction cannot be inferred from unclaimed; retry is possible only after exact failure',async()=>{
  const tracker=new OperationTracker();
  await tracker.run('claim','preview','contract',async hooks=>{hooks.submitting(txId);throw Error('lost');},()=>{});
  await assert.rejects(tracker.reconcile('preview',async()=>{throw Error('not observed');}));
  assert.equal(tracker.current.status,'UNKNOWN');
  await tracker.reconcile('preview',async()=>({txId,status:'FailEntirely'}));
  assert.equal(tracker.current.status,'FAILED');
  await tracker.run('claim','preview','contract',async()=>({txId}),()=>{});
  assert.equal(tracker.current.status,'CONFIRMED');
});
test('U4 pre-submit cancellation prevents late wallet response from submitting even after a new operation',async()=>{
  const tracker=new OperationTracker(); let proceed; let submissions=0;
  await tracker.run('deploy','preview',undefined,async hooks=>{
    hooks.balancing(); await new Promise(r=>proceed=r); hooks.submitting(txId); submissions++; return {txId};
  },()=>{},5);
  tracker.cancelBeforeSubmission();
  assert.equal(tracker.current.status,'CANCELLED');
  await tracker.run('deploy','preview',undefined,async()=>({txId:('00' + 'b'.repeat(64))}),()=>{});
  proceed(); await delay(0);
  assert.equal(submissions,0);
  assert.equal(tracker.current.txId,('00' + 'b'.repeat(64)));
});
test('U4 after submission cancellation cannot erase the guard',async()=>{
  const tracker=new OperationTracker();
  await tracker.run('claim','preview','contract',async hooks=>{hooks.submitting(txId);throw Error('lost');},()=>{});
  assert.throws(()=>tracker.cancelBeforeSubmission(),/이미 전송/);
  assert.equal(tracker.current.status,'UNKNOWN');
});

const record = () => ({id:'saved-operation',kind:'claim',network:'preview',address:'A',
  status:'PENDING',phase:'submitting',txId,startedAt:new Date().toISOString(),updatedAt:new Date().toISOString()});

test('F1 corrupt/invalid records fail closed without throwing, overwriting or exposing raw data',async()=>{
  for(const raw of ['{PRIVATE_INPUT', '', 'null', '[]', 'false', '{}',
    JSON.stringify({...record(),phase:'invalid'}), JSON.stringify({...record(),startedAt:'invalid'}),
    JSON.stringify({...record(),txId:null}), JSON.stringify({...record(),txId:undefined})]){
    let writes=0, actions=0;
    const store={getItem:()=>raw,setItem:()=>{writes++;}};
    const tracker=new OperationTracker(store);
    assert.equal(tracker.blocked,true);
    assert.doesNotMatch(tracker.blockedMessage,/PRIVATE_INPUT/);
    await assert.rejects(tracker.run('deploy','preview',undefined,async()=>{actions++;return {txId};},()=>{}),/BLOCKED/);
    assert.throws(()=>tracker.cancelBeforeSubmission(),/BLOCKED/);
    await assert.rejects(tracker.reconcile('preview',async()=>({txId,status:'SucceedEntirely'})),/BLOCKED/);
    tracker.retryStorage();
    assert.equal(tracker.blocked,true);assert.equal(writes,0);assert.equal(actions,0);
    assert.equal(store.getItem(),raw);
  }
});
test('F1 inaccessible Storage getter/read can recover only with a valid record, never by clearing it',async()=>{
  for(const fault of ['getter','read']){
    let available=false,raw=JSON.stringify(record());let writes=0;
    const store={getItem:()=>{if(!available&&fault==='read')throw Error('Denied');return raw;},setItem:()=>{writes++;}};
    const tracker=new OperationTracker(()=>{if(!available&&fault==='getter')throw Error('Denied');return store;});
    assert.equal(tracker.blocked,true);
    tracker.retryStorage();assert.equal(tracker.blocked,true);
    available=true;raw=null;tracker.retryStorage();assert.equal(tracker.blocked,true);
    raw=JSON.stringify({...record(),secret:'NEVER_RETAIN'});tracker.retryStorage();
    assert.equal(tracker.blocked,false);assert.equal(tracker.current.status,'UNKNOWN');
    assert.equal(tracker.current.id,'saved-operation');assert.equal(tracker.current.secret,undefined);
    assert.equal(writes,0);
    await assert.rejects(tracker.run('deploy','preview',undefined,async()=>({txId}),()=>{}),/미확정/);
    await tracker.reconcile('preview',async()=>({txId,status:'SucceedEntirely'}));
    assert.equal(tracker.current.status,'CONFIRMED');
  }
});
test('F1 write failures before action/balancing/submission prohibit broadcast and retain recovery metadata',async()=>{
  for(const failAt of [1,2,3]){
    let raw=null,writes=0,submissions=0,fail=true;
    const tracker=new OperationTracker({getItem:()=>raw,setItem:(_,v)=>{if(++writes===failAt&&fail)throw Error('Quota');raw=v;}});
    const run=tracker.run('deploy','preview',undefined,async hooks=>{
      hooks.balancing();hooks.submitting(txId);submissions++;return {txId};
    },()=>{});
    if(failAt===1)await assert.rejects(run,/BLOCKED/);else await run;
    assert.equal(tracker.blocked,true);assert.equal(submissions,0);
    const id=tracker.current.id;fail=false;tracker.retryStorage();
    assert.equal(tracker.blocked,false);assert.equal(tracker.current.id,id);assert.equal(tracker.current.status,'UNKNOWN');
    assert.equal(JSON.parse(raw).id,id);
    assert.equal(JSON.parse(raw).txId,undefined); // hook failed before broadcast
    tracker.cancelBeforeSubmission();assert.equal(tracker.current.status,'CANCELLED');
  }
});
test('F1 timeout and late-success write failures stay BLOCKED without unhandled rejection or false success',async()=>{
  let raw=null,fail=false,complete,renders=0;
  const tracker=new OperationTracker({getItem:()=>raw,setItem:(_,v)=>{if(fail)throw Error('Quota');raw=v;}});
  await tracker.run('claim','preview','A',hooks=>{hooks.submitting(txId);fail=true;return new Promise(r=>complete=r);},()=>{renders++;},5);
  assert.equal(tracker.blocked,true);assert.equal(tracker.current.status,'UNKNOWN');
  const id=tracker.current.id;
  complete({txId});await delay(0);
  assert.equal(tracker.blocked,true);assert.equal(renders,0);
  fail=false;tracker.retryStorage();assert.equal(tracker.blocked,false);
  assert.equal(tracker.current.id,id);assert.equal(tracker.current.status,'CONFIRMED');
  assert.equal(JSON.parse(raw).txId,txId);
});
