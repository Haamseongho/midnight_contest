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
