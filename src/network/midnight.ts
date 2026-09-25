import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";
import {
  Transaction,
  type Binding,
  type Proof,
  type SignatureEnabled,
} from "@midnight-ntwrk/midnight-js-protocol/ledger";
import {
  type ConnectedAPI,
  type InitialAPI,
} from "@midnight-ntwrk/dapp-connector-api";
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
import { assertSpendableDust } from "./errors";

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

const waitForCompatibleWallet = async (timeoutMs = 1_500): Promise<InitialAPI> => {
  const deadline = Date.now() + timeoutMs;
  do {
    const wallet = compatibleWallet();
    if (wallet) return wallet;
    await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 100));
  } while (Date.now() < deadline);

  throw new Error(
    "Midnight DApp Connector 4.x 지갑이 활성화되지 않았습니다. Lace를 열어 잠금을 해제한 뒤 다시 연결해 주세요.",
  );
};

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = globalThis.setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        globalThis.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        globalThis.clearTimeout(timer);
        reject(error);
      },
    );
  });

export type PublicPass = {
  commitment: string;
  claimed: boolean;
  txId?: string;
};

export class MidnightSession {
  private constructor(
    readonly networkId: string,
    private readonly providers: SilentProviders,
    private readonly connected: ConnectedAPI,
  ) {}

  static async connect(networkId: string): Promise<MidnightSession> {
    const wallet = await waitForCompatibleWallet();
    const connected = await withTimeout(
      wallet.connect(networkId),
      60_000,
      "Lace가 60초 안에 응답하지 않았습니다. 지갑 잠금과 연결 승인 화면을 확인한 뒤 다시 시도해 주세요.",
    );
    const status = await withTimeout(
      connected.getConnectionStatus(),
      15_000,
      "Lace 연결 상태를 확인하지 못했습니다. 지갑을 다시 연결해 주세요.",
    );
    const config = await withTimeout(
      connected.getConfiguration(),
      15_000,
      "Lace 네트워크 설정을 확인하지 못했습니다. 지갑을 다시 연결해 주세요.",
    );
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
      : createProofProvider(await withTimeout(
          connected.getProvingProvider(keys),
          30_000,
          "Lace 증명 제공자를 불러오지 못했습니다. 지갑 동기화 상태를 확인한 뒤 다시 연결해 주세요.",
        ));
    const addresses = await withTimeout(
      connected.getShieldedAddresses(),
      15_000,
      "Lace 주소를 불러오지 못했습니다. 지갑 동기화 상태를 확인한 뒤 다시 연결해 주세요.",
    );
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
          const response = await withTimeout(
            connected.balanceUnsealedTransaction(toHex(tx.serialize())),
            180_000,
            "Lace가 3분 안에 거래 밸런싱·증명을 완료하지 못했습니다. Activity와 잔액을 확인하기 전에는 같은 거래를 다시 전송하지 마세요.",
          );
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
          await withTimeout(
            connected.submitTransaction(toHex(tx.serialize())),
            90_000,
            "Lace의 제출 응답을 90초 안에 확인하지 못했습니다. 결과가 불확실하므로 Activity와 공개 상태를 확인하기 전에는 같은 거래를 다시 전송하지 마세요.",
          );
          return tx.identifiers()[0];
        },
      },
    };

    return new MidnightSession(networkId, providers, connected);
  }

  private async assertWalletReady(): Promise<void> {
    const status = await withTimeout(
      this.connected.getConnectionStatus(),
      15_000,
      "Lace 연결 상태를 확인하지 못했습니다. 지갑을 다시 연결해 주세요.",
    );
    if (status.status !== "connected" || status.networkId !== this.networkId) {
      throw new Error("Lace 지갑 연결이 끊어졌습니다. Preview 동기화를 확인한 뒤 다시 연결해 주세요.");
    }
    const dust = await withTimeout(
      this.connected.getDustBalance(),
      20_000,
      "Lace 지갑 계정 동기화를 확인하지 못했습니다. Preview 동기화와 tDUST 잔액을 확인한 뒤 다시 연결해 주세요.",
    );
    assertSpendableDust(dust);
  }

  async deploy(secret: Uint8Array): Promise<{ address: string; state: PublicPass; txId: string }> {
    await this.assertWalletReady();
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
    await this.assertWalletReady();
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
