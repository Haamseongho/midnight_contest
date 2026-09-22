import type {
  ContractAddress,
  SigningKey,
} from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
import type { PrivateStateProvider } from "@midnight-ntwrk/midnight-js-types";

// Silent Pass has no contract private state. Midnight.js still needs a provider
// for its contract-maintenance signing key, which is intentionally session-only.
export const sessionPrivateStateProvider = (): PrivateStateProvider<string, unknown> => {
  const signingKeys = new Map<ContractAddress, SigningKey>();
  let address: ContractAddress | undefined;

  return {
    setContractAddress(value) {
      address = value;
    },
    async set() {},
    async get() {
      return null;
    },
    async remove() {},
    async clear() {},
    async setSigningKey(contractAddress, signingKey) {
      signingKeys.set(contractAddress, signingKey);
    },
    async getSigningKey(contractAddress) {
      return signingKeys.get(contractAddress) ?? null;
    },
    async removeSigningKey(contractAddress) {
      signingKeys.delete(contractAddress);
    },
    async clearSigningKeys() {
      signingKeys.clear();
    },
    async exportPrivateStates() {
      throw new Error("Silent Pass does not store contract private state.");
    },
    async importPrivateStates() {
      throw new Error("Silent Pass does not import contract private state.");
    },
    async exportSigningKeys() {
      throw new Error("Session-only signing keys cannot be exported here.");
    },
    async importSigningKeys() {
      throw new Error("Session-only signing keys cannot be imported here.");
    },
  };
};
