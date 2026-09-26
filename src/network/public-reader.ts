import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { ledger } from "../../contract/managed/silent-pass/contract/index.js";
import { TRUSTED_CONTEXT } from "../context/trusted-context";

export type Observation = {
  network: string; address: string; commitment: string; claimed: boolean;
  requestId: string; observedAt: string; contextVersion: string;
};

// No wallet, secret, proof, signature or transaction provider is constructed here.
// Only the deployment-owned endpoint and address can be queried.
export async function readTrustedPublicState(requestId: string): Promise<Observation> {
  const policy = TRUSTED_CONTEXT;
  const provider = indexerPublicDataProvider(policy.indexer, policy.indexerWs, WebSocket);
  const state = await provider.queryContractState(policy.address);
  if (!state) throw new Error("지정된 계약을 찾지 못했습니다.");
  const decoded = ledger(state.data);
  return {
    network: policy.network, address: policy.address,
    commitment: Array.from(decoded.commitment, b => b.toString(16).padStart(2, "0")).join(""),
    claimed: decoded.claimed, requestId, observedAt: new Date().toISOString(),
    contextVersion: policy.version,
  };
}
