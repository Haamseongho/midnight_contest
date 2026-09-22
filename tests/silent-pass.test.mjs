import assert from 'node:assert/strict';
import test from 'node:test';
import {
  Contract,
  ledger,
  pureCircuits,
} from '../contract/managed/silent-pass/contract/index.js';
import {
  createCircuitContext,
  createConstructorContext,
  dummyContractAddress,
} from '@midnight-ntwrk/compact-runtime';

const createPass = () => {
  const secret = new Uint8Array(32).fill(7);
  const commitment = pureCircuits.makeCommitment(secret);
  const contract = new Contract({});
  const initial = contract.initialState(
    createConstructorContext({}, { bytes: new Uint8Array(32) }),
    commitment,
  );
  const context = createCircuitContext(
    dummyContractAddress(),
    initial.currentZswapLocalState,
    initial.currentContractState,
    {},
  );
  return { secret, commitment, contract, context, initial };
};

test('public state contains a commitment and starts unclaimed', () => {
  const { secret, commitment, initial } = createPass();
  const state = ledger(initial.currentContractState.data);
  assert.deepEqual(state.commitment, commitment);
  assert.notDeepEqual(state.commitment, secret);
  assert.equal(state.claimed, false);
  assert.deepEqual(Object.keys(state).sort(), ['claimed', 'commitment']);
});

test('a wrong secret cannot change the public state', () => {
  const { contract, context } = createPass();
  assert.throws(
    () => contract.circuits.claim(context, new Uint8Array(32).fill(8)),
    /Secret does not match/,
  );
  assert.equal(ledger(context.currentQueryContext.state).claimed, false);
});

test('the correct secret claims once, then replay is rejected', () => {
  const { secret, commitment, contract, context } = createPass();
  const result = contract.circuits.claim(context, secret);
  const state = ledger(result.context.currentQueryContext.state);
  assert.equal(state.claimed, true);
  assert.deepEqual(state.commitment, commitment);
  assert.throws(
    () => contract.circuits.claim(result.context, secret),
    /already claimed/,
  );
});
