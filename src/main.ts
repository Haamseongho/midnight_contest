import {
  Contract,
  ledger,
  pureCircuits,
} from "../contract/managed/silent-pass/contract/index.js";
import {
  createCircuitContext,
  createConstructorContext,
  dummyContractAddress,
  type CircuitContext,
} from "@midnight-ntwrk/compact-runtime";
import type { MidnightSession, PublicPass } from "./network/midnight";
import "./style.css";

type Session = {
  contract: Contract<Record<string, never>>;
  context: CircuitContext<Record<string, never>>;
  secretHex: string;
};

const element = <T extends HTMLElement>(id: string): T => {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing UI element: ${id}`);
  return found as T;
};

const generateButton = element<HTMLButtonElement>("generate-button");
const copyButton = element<HTMLButtonElement>("copy-button");
const claimButton = element<HTMLButtonElement>("claim-button");
const claimForm = element<HTMLFormElement>("claim-form");
const secretOutput = element<HTMLTextAreaElement>("secret-output");
const claimInput = element<HTMLInputElement>("claim-input");
const feedback = element<HTMLParagraphElement>("claim-feedback");
const commitmentValue = element<HTMLElement>("commitment-value");
const claimedValue = element<HTMLElement>("claimed-value");
const passStatus = element<HTMLElement>("pass-status");

let session: Session | null = null;

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const fromHex = (value: string): Uint8Array => {
  if (!/^[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error("64자리 16진수 비밀값을 입력해 주세요.");
  }
  return Uint8Array.from(value.match(/.{2}/g)!, (pair) =>
    Number.parseInt(pair, 16),
  );
};

const setFeedback = (
  message: string,
  kind: "info" | "success" | "error" = "info",
): void => {
  feedback.textContent = message;
  feedback.dataset.kind = kind;
};

generateButton.addEventListener("click", () => {
  let secret: Uint8Array | undefined;
  try {
    secret = crypto.getRandomValues(new Uint8Array(32));
    const commitment = pureCircuits.makeCommitment(secret);
    const contract = new Contract<Record<string, never>>({});
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

    session = { contract, context, secretHex: toHex(secret) };
    secretOutput.value = session.secretHex;
    claimInput.value = "";
    commitmentValue.textContent = toHex(
      ledger(initial.currentContractState.data).commitment,
    );
    claimedValue.textContent = "미사용";
    passStatus.textContent = "사용 가능";
    passStatus.className = "pill pill-ready";
    claimButton.disabled = false;
    copyButton.disabled = false;
    setFeedback(
      "패스가 생성됐습니다. 비밀값을 복사한 뒤 02단계에 입력해 보세요.",
    );
  } catch (error) {
    setFeedback(
      error instanceof Error ? error.message : "패스를 만들지 못했습니다.",
      "error",
    );
  } finally {
    secret?.fill(0);
  }
});

copyButton.addEventListener("click", async () => {
  if (!session) return;
  try {
    await navigator.clipboard.writeText(session.secretHex);
    setFeedback("비밀값을 복사했습니다. 사용 후 클립보드 기록에 주의하세요.");
  } catch {
    secretOutput.select();
    setFeedback(
      "자동 복사가 막혔습니다. 선택된 비밀값을 직접 복사해 주세요.",
      "error",
    );
  }
});

claimForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!session) return;

  let secret: Uint8Array | undefined;
  try {
    secret = fromHex(claimInput.value.trim());
    const result = session.contract.circuits.claim(session.context, secret);
    session.context = result.context;
    const state = ledger(result.context.currentQueryContext.state);
    claimedValue.textContent = state.claimed ? "사용 완료" : "미사용";
    passStatus.textContent = "사용 완료";
    passStatus.className = "pill pill-used";
    claimButton.disabled = true;
    copyButton.disabled = true;
    secretOutput.value = "";
    session.secretHex = "";
    setFeedback(
      "성공: 비밀값이 일치하고 패스가 사용됐습니다. 공개 상태에는 비밀값이 남지 않습니다.",
      "success",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    setFeedback(
      message.includes("already claimed")
        ? "이미 사용된 패스입니다."
        : message.includes("does not match")
          ? "비밀값이 일치하지 않습니다. 공개 상태는 변경되지 않았습니다."
          : message || "확인에 실패했습니다.",
      "error",
    );
  } finally {
    claimInput.value = "";
    secret?.fill(0);
  }
});

const networkId = element<HTMLSelectElement>("network-id");
const networkStatus = element<HTMLElement>("network-status");
const networkFeedback = element<HTMLParagraphElement>("network-feedback");
const connectButton = element<HTMLButtonElement>("connect-button");
const networkGenerateButton = element<HTMLButtonElement>("network-generate-button");
const networkCopyButton = element<HTMLButtonElement>("network-copy-button");
const networkSecretOutput = element<HTMLTextAreaElement>("network-secret-output");
const deployButton = element<HTMLButtonElement>("deploy-button");
const networkAddress = element<HTMLInputElement>("network-address");
const networkReadButton = element<HTMLButtonElement>("network-read-button");
const networkClaimSecret = element<HTMLInputElement>("network-claim-secret");
const networkClaimButton = element<HTMLButtonElement>("network-claim-button");
const networkAddressValue = element<HTMLElement>("network-address-value");
const networkCommitmentValue = element<HTMLElement>("network-commitment-value");
const networkClaimedValue = element<HTMLElement>("network-claimed-value");
const networkDeployTxValue = element<HTMLElement>("network-deploy-tx-value");
const networkClaimTxValue = element<HTMLElement>("network-claim-tx-value");

let network: MidnightSession | null = null;
let networkSecretHex = "";
let networkBusy = false;

const networkMessage = (
  message: string,
  kind: "info" | "success" | "error" = "info",
): void => {
  networkFeedback.textContent = message;
  networkFeedback.dataset.kind = kind;
};

const updateNetworkButtons = (): void => {
  connectButton.disabled = networkBusy || network !== null;
  networkId.disabled = networkBusy || network !== null;
  networkGenerateButton.disabled = networkBusy;
  networkCopyButton.disabled = networkBusy || !networkSecretHex;
  deployButton.disabled = networkBusy || !network || !networkSecretHex;
  networkReadButton.disabled = networkBusy || !network;
  networkClaimButton.disabled = networkBusy || !network;
};

const runNetworkAction = async (action: () => Promise<void>): Promise<void> => {
  networkBusy = true;
  updateNetworkButtons();
  try {
    await action();
  } catch (error) {
    networkMessage(
      error instanceof Error ? error.message : "네트워크 작업에 실패했습니다.",
      "error",
    );
  } finally {
    networkBusy = false;
    updateNetworkButtons();
  }
};

const showPublicState = (address: string, state: PublicPass): void => {
  networkAddress.value = address;
  networkAddressValue.textContent = address;
  networkCommitmentValue.textContent = state.commitment;
  networkClaimedValue.textContent = state.claimed ? "사용 완료" : "미사용";
};

connectButton.addEventListener("click", () => {
  void runNetworkAction(async () => {
    networkMessage("지갑에 연결을 요청하고 있습니다…");
    const { MidnightSession } = await import("./network/midnight");
    network = await MidnightSession.connect(networkId.value);
    networkStatus.textContent = `${network.networkId} 연결됨`;
    networkStatus.className = "pill pill-ready";
    networkMessage("지갑이 연결됐습니다. 비밀값을 생성하거나 기존 계약을 조회하세요.", "success");
  });
});

networkGenerateButton.addEventListener("click", () => {
  const secret = crypto.getRandomValues(new Uint8Array(32));
  try {
    networkSecretHex = toHex(secret);
    networkSecretOutput.value = networkSecretHex;
    networkMessage("비밀값을 생성했습니다. 배포 전 안전한 곳에 복사해 두세요.");
    updateNetworkButtons();
  } finally {
    secret.fill(0);
  }
});

networkCopyButton.addEventListener("click", () => {
  void runNetworkAction(async () => {
    try {
      await navigator.clipboard.writeText(networkSecretHex);
      networkMessage("비밀값을 복사했습니다. 클립보드 기록에 주의하세요.");
    } catch {
      networkSecretOutput.select();
      networkMessage("자동 복사가 막혔습니다. 선택된 값을 직접 복사해 주세요.", "error");
    }
  });
});

deployButton.addEventListener("click", () => {
  void runNetworkAction(async () => {
    if (!network) throw new Error("먼저 지갑을 연결해 주세요.");
    networkMessage("지갑 승인·증명 생성·배포를 기다리고 있습니다…");
    const secret = fromHex(networkSecretHex);
    try {
      const result = await network.deploy(secret);
      showPublicState(result.address, result.state);
      networkDeployTxValue.textContent = result.txId;
      networkMessage("계약이 배포되고 공개 상태가 조회됐습니다. 주소와 비밀값을 보관하세요.", "success");
    } finally {
      secret.fill(0);
    }
  });
});

networkReadButton.addEventListener("click", () => {
  void runNetworkAction(async () => {
    if (!network) throw new Error("먼저 지갑을 연결해 주세요.");
    const address = networkAddress.value.trim();
    if (!address) throw new Error("계약 주소를 입력해 주세요.");
    networkMessage("인덱서에서 공개 상태를 조회하고 있습니다…");
    showPublicState(address, await network.read(address));
    networkMessage("공개 상태를 조회했습니다.", "success");
  });
});

networkClaimButton.addEventListener("click", () => {
  void runNetworkAction(async () => {
    if (!network) throw new Error("먼저 지갑을 연결해 주세요.");
    const address = networkAddress.value.trim();
    if (!address) throw new Error("계약 주소를 입력해 주세요.");
    const enteredSecretHex = networkClaimSecret.value.trim();
    const secret = fromHex(enteredSecretHex);
    try {
      networkMessage("지갑 승인·증명 생성·사용 트랜잭션을 기다리고 있습니다…");
      const result = await network.claim(address, secret);
      showPublicState(address, result);
      networkClaimTxValue.textContent = result.txId ?? "—";
      if (networkSecretHex.toLowerCase() === enteredSecretHex.toLowerCase()) {
        networkSecretHex = "";
        networkSecretOutput.value = "";
      }
      networkMessage("패스 사용 트랜잭션이 완료되고 공개 상태가 갱신됐습니다.", "success");
    } finally {
      networkClaimSecret.value = "";
      secret.fill(0);
    }
  });
});

updateNetworkButtons();
