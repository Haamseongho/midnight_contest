import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";
import {
  Transaction,
  type Binding,
  type Proof,
  type SignatureEnabled,
} from "@midnight-ntwrk/midnight-js-protocol/ledger";
import { type InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import {
  deployContract,
  findDeployedContract,
  type ContractProviders,
} from "@midnight-ntwrk/midnight-js-contracts";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { createProofProvider, type UnboundTransaction } from "@midnight-ntwrk/midnight-js-types";
import {
  assertIsContractAddress,
  fromHex,
  toHex,
} from "@midnight-ntwrk/midnight-js-utils";
import {
  Contract,
  ledger,
  pureCircuits,
} from "../../contract/managed/silent-pass/contract/index.js";
import { sessionPrivateStateProvider } from "./private-state";

type SilentContract = Contract<undefined>;
type SilentProviders = ContractProviders<SilentContract, "claim", unknown>;

const compiledContract = CompiledContract.make<SilentContract>(
  "SilentPass",
  Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets("."),
);

const compatibleWallet = (): InitialAPI | undefined => {
  const injected = (window as Window & { midnight?: Record<string, unknown> }).midnight;
  if (!injected) return undefined;
  return Object.values(injected).find((value): value is InitialAPI => {
    if (!value || typeof value !== "object") return false;
    const api = value as Partial<InitialAPI>;
    return /^4\./.test(api.apiVersion ?? "") && typeof api.connect === "function";
  });
};

export type PublicPass = {
  commitment: string;
  claimed: boolean;
  txId?: string;
};

export class MidnightSession {
  private constructor(
    readonly networkId: string,
    private readonly providers: SilentProviders,
  ) {}

  static async connect(networkId: string): Promise<MidnightSession> {
    const wallet = compatibleWallet();
    if (!wallet) {
      throw new Error("Midnight DApp Connector 4.x 지갑이 감지되지 않았습니다.");
    }

    const connected = await wallet.connect(networkId);
    const status = await connected.getConnectionStatus();
    const config = await connected.getConfiguration();
    if (status.status !== "connected" || status.networkId !== networkId || config.networkId !== networkId) {
      throw new Error(`지갑 네트워크가 ${networkId}와 일치하지 않습니다.`);
    }

    setNetworkId(networkId);
    const assetBaseUrl = new URL(
      import.meta.env?.BASE_URL ?? "/",
      window.location.href,
    ).href;
    const keys = new FetchZkConfigProvider<"claim">(assetBaseUrl);
    const proofProvider = networkId === "undeployed" && config.proverServerUri
      ? httpClientProofProvider(config.proverServerUri, keys)
      : createProofProvider(await connected.getProvingProvider(keys));
    const addresses = await connected.getShieldedAddresses();
    const providers: SilentProviders = {
      privateStateProvider: sessionPrivateStateProvider(),
      publicDataProvider: indexerPublicDataProvider(
        config.indexerUri,
        config.indexerWsUri,
        window.WebSocket,
      ),
      zkConfigProvider: keys,
      proofProvider,
      walletProvider: {
        getCoinPublicKey: () => addresses.shieldedCoinPublicKey,
        getEncryptionPublicKey: () => addresses.shieldedEncryptionPublicKey,
        balanceTx: async (tx: UnboundTransaction) => {
          const response = await connected.balanceUnsealedTransaction(toHex(tx.serialize()));
          return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
            "signature",
            "proof",
            "binding",
            fromHex(response.tx),
          );
        },
      },
      midnightProvider: {
        submitTx: async (tx) => {
          await connected.submitTransaction(toHex(tx.serialize()));
          return tx.identifiers()[0];
        },
      },
    };

    return new MidnightSession(networkId, providers);
  }

  async deploy(secret: Uint8Array): Promise<{ address: string; state: PublicPass; txId: string }> {
    const commitment = pureCircuits.makeCommitment(secret);
    const deployed = await deployContract(this.providers, {
      compiledContract,
      args: [commitment],
    });
    const address = deployed.deployTxData.public.contractAddress;
    return {
      address,
      state: await this.read(address),
      txId: deployed.deployTxData.public.txId,
    };
  }

  async claim(address: string, secret: Uint8Array): Promise<PublicPass> {
    assertIsContractAddress(address);
    const found = await findDeployedContract(this.providers, {
      compiledContract,
      contractAddress: address,
    });
    const claimed = await found.callTx.claim(secret);
    return { ...(await this.read(address)), txId: claimed.public.txId };
  }

  async read(address: string): Promise<PublicPass> {
    assertIsContractAddress(address);
    const state = await this.providers.publicDataProvider.queryContractState(address);
    if (!state) throw new Error("해당 주소의 계약을 찾을 수 없습니다.");
    const publicState = ledger(state.data);
    return { commitment: toHex(publicState.commitment), claimed: publicState.claimed };
  }
}
