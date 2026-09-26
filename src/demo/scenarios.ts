import { Contract, ledger, pureCircuits } from "../../contract/managed/silent-pass/contract/index.js";
import { createCircuitContext, createConstructorContext, dummyContractAddress } from "@midnight-ntwrk/compact-runtime";

// Each invocation owns a disposable session; it cannot consume the holder's pass.
export function runScenarios(): { name: string; passed: boolean }[] {
  const secret = crypto.getRandomValues(new Uint8Array(32));
  const wrong = secret.slice(); wrong[0] ^= 1;
  try {
    const contract = new Contract<Record<string, never>>({});
    const initial = contract.initialState(createConstructorContext({}, { bytes: new Uint8Array(32) }), pureCircuits.makeCommitment(secret));
    let context = createCircuitContext(dummyContractAddress(), initial.currentZswapLocalState, initial.currentContractState, {});
    let wrongRejected = false;
    try { contract.circuits.claim(context, wrong); } catch (e) {
      wrongRejected = e instanceof Error && e.message.includes("Secret does not match");
    }
    const unchanged = !ledger(context.currentQueryContext.state).claimed;
    context = contract.circuits.claim(context, secret).context;
    const consumed = ledger(context.currentQueryContext.state).claimed;
    let replayRejected = false;
    try { contract.circuits.claim(context, secret); } catch (e) {
      replayRejected = e instanceof Error && e.message.includes("already claimed");
    }
    return [
      { name: "잘못된 비밀값 거절 · 상태 유지", passed: wrongRejected && unchanged },
      { name: "올바른 비밀값 1회 소비", passed: consumed },
      { name: "동일 비밀값 재사용 거절", passed: replayRejected },
    ];
  } finally { secret.fill(0); wrong.fill(0); }
}
