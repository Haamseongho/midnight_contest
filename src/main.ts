import "./shims/node-buffer";
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
import {
  networkErrorMessage,
  localErrorMessage,
  requiresWalletReconnect,
} from "./network/errors";
import "./style.css";
import { mountReviewer } from "./ui/reviewer";
import { deadline } from "./ui/reviewer-state";
import { OperationTracker, unresolved } from "./network/operations";
import { mountJudgeGuide, mountRehearsalTimer } from "./ui/judge-guide";
import { mountScenarios } from "./ui/scenario-panel";
import { mountRoles } from "./ui/roles";

let guide: ReturnType<typeof mountJudgeGuide> | undefined;
mountReviewer(state => guide?.readChanged(state));
guide = mountJudgeGuide();
mountScenarios(passed => guide?.circuitChanged(passed));
mountRoles();
mountRehearsalTimer();

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
const clearButton = element<HTMLButtonElement>("clear-button");
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
    clearButton.disabled = false;
    setFeedback(
      "패스가 생성됐습니다. 비밀값을 복사한 뒤 02단계에 입력해 보세요.",
    );
  } catch (error) {
    setFeedback(
      "패스를 만들지 못했습니다. 오류 원문은 표시하지 않습니다.",
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

clearButton.addEventListener("click", () => {
  if (session) session.secretHex = "";
  secretOutput.value = "";
  claimInput.value = "";
  copyButton.disabled = true;
  clearButton.disabled = true;
  setFeedback(
    "비밀값을 이 화면과 앱의 현재 세션 상태에서 제거했습니다. 계약 상태는 유지됩니다.",
    "success",
  );
});
claimInput.addEventListener("input", () => { clearButton.disabled = !session?.secretHex && !claimInput.value; });

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
    clearButton.disabled = true;
    secretOutput.value = "";
    session.secretHex = "";
    setFeedback(
      "성공: 비밀값이 일치하고 패스가 사용됐습니다. 공개 상태에는 비밀값이 남지 않습니다.",
      "success",
    );
  } catch (error) {
    setFeedback(localErrorMessage(error), "error");
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
const networkClearButton = element<HTMLButtonElement>("network-clear-button");
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
let busyAction = 0;
let viewRequest = 0;
// Resolve the Storage getter inside the tracker: browsers can throw even here.
const operations = new OperationTracker(() => sessionStorage);
const operationStatus = element<HTMLElement>("operation-status");
const recoverButton = element<HTMLButtonElement>("operation-recover");
const cancelOperationButton = element<HTMLButtonElement>("operation-cancel");
const retryStorageButton = element<HTMLButtonElement>("operation-storage-retry");

const clearNetworkView = (): number => {
  networkAddressValue.textContent = "—";
  networkCommitmentValue.textContent = "—";
  networkClaimedValue.textContent = "UNKNOWN";
  networkDeployTxValue.textContent = "—";
  networkClaimTxValue.textContent = "—";
  element("network-observation").textContent = "현재 확인된 관찰 없음";
  networkFeedback.textContent = "현재 조회 결과 없음 · UNKNOWN";
  networkFeedback.dataset.kind = "info";
  return ++viewRequest;
};
networkAddress.addEventListener("input", clearNetworkView);
networkId.addEventListener("change", () => {
  network = null; clearNetworkView();
  networkStatus.textContent = "지갑 미연결";
  updateNetworkButtons();
});

const networkMessage = (
  message: string,
  kind: "info" | "success" | "error" = "info",
): void => {
  networkFeedback.textContent = message;
  networkFeedback.dataset.kind = kind;
};

const updateNetworkButtons = (): void => {
  connectButton.disabled = networkBusy;
  connectButton.textContent = network ? "지갑 다시 연결" : "지갑 연결";
  networkId.disabled = networkBusy || unresolved(operations.current);
  networkGenerateButton.disabled = networkBusy;
  networkCopyButton.disabled = networkBusy || !networkSecretHex;
  networkClearButton.disabled = !networkSecretHex && !networkClaimSecret.value;
  deployButton.disabled = operations.blocked || networkBusy || !network || !networkSecretHex || unresolved(operations.current);
  networkReadButton.disabled = networkBusy || !network;
  networkClaimButton.disabled = operations.blocked || networkBusy || !network || unresolved(operations.current);
  recoverButton.disabled = operations.blocked || networkBusy || !network || !unresolved(operations.current) || !operations.current?.txId;
  cancelOperationButton.disabled = operations.blocked || !unresolved(operations.current) || !!operations.current?.txId;
  retryStorageButton.hidden = !operations.blocked;
  retryStorageButton.disabled = networkBusy;
};
networkClaimSecret.addEventListener("input", updateNetworkButtons);
const renderOperation = (): void => {
  const op = operations.current;
  operationStatus.textContent = operations.blocked ? operations.blockedMessage + (op ? ` 원래 작업 ${op.id} · ${op.network} · 거래 ${op.txId ?? "ID 미확보"}` : "") : op ? `${op.status} · ${op.kind} · ${op.network} · 작업 ${op.id} · ${op.updatedAt} · 거래 ${op.txId ?? "전송 전"}` : "거래 작업 없음";
  operationStatus.dataset.state = operations.blocked ? "BLOCKED" : op?.status ?? "IDLE";
  updateNetworkButtons();
};
operations.subscribe(renderOperation);
if (operations.current) {
  const op = operations.current;
  if (unresolved(op)) networkId.value = op.network;
}
renderOperation();
retryStorageButton.addEventListener("click", () => { operations.retryStorage(); });
recoverButton.addEventListener("click", () => {
  void runNetworkAction(async () => {
    const connected = network!;
    await operations.reconcile(connected.networkId, txId => connected.transactionStatus(txId));
    networkMessage("원래 거래 식별자로 결과를 확인했습니다. 공개 상태는 별도로 다시 조회하세요.");
  });
});
cancelOperationButton.addEventListener("click", () => {
  try {
    operations.cancelBeforeSubmission();
  } catch (error) {
    networkMessage(networkErrorMessage(error), "error");
    updateNetworkButtons();
    return;
  }
  clearNetworkView();
  ++busyAction;
  networkBusy = false;
  updateNetworkButtons();
  networkMessage("이 앱의 전송 전 작업을 중단했습니다. 남아 있는 Lace 승인창은 거절하세요. 늦은 응답도 이 앱에서 전송되지 않습니다.");
});

const runNetworkAction = async (
  action: () => Promise<void>,
  resetConnectionOnFailure = false,
): Promise<void> => {
  const actionId = ++busyAction;
  networkBusy = true;
  updateNetworkButtons();
  try {
    await action();
  } catch (error) {
    if (actionId !== busyAction) return;
    if (resetConnectionOnFailure || requiresWalletReconnect(error)) {
      network = null;
      networkStatus.textContent = "재연결 필요";
      networkStatus.className = "pill pill-idle";
    }
    networkMessage(networkErrorMessage(error), "error");
  } finally {
    if (actionId === busyAction) {
      networkBusy = false;
      updateNetworkButtons();
    }
  }
};

const showPublicState = (address: string, state: PublicPass): void => {
  networkAddress.value = address;
  networkAddressValue.textContent = address;
  networkCommitmentValue.textContent = state.commitment;
  networkClaimedValue.textContent = state.claimed ? "사용 완료" : "미사용";
  element("network-observation").textContent = `${network?.networkId} · 요청 ${viewRequest} · ${new Date().toISOString()}`;
};

connectButton.addEventListener("click", () => {
  void runNetworkAction(async () => {
    network = null;
    clearNetworkView();
    networkStatus.textContent = "연결 확인 중";
    networkStatus.className = "pill pill-idle";
    networkMessage("지갑 연결과 Preview 계정 동기화를 확인하고 있습니다…");
    const { MidnightSession } = await import("./network/midnight");
    network = await MidnightSession.connect(networkId.value);
    networkStatus.textContent = `${network.networkId} 연결됨`;
    networkStatus.className = "pill pill-ready";
    networkMessage("지갑이 연결됐습니다. 비밀값을 생성하거나 기존 계약을 조회하세요.", "success");
  }, true);
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

networkClearButton.addEventListener("click", () => {
  networkSecretHex = "";
  networkSecretOutput.value = "";
  networkClaimSecret.value = "";
  networkMessage(
    "비밀값을 이 화면과 앱의 현재 세션 상태에서 제거했습니다. 보관한 사본은 앱이 복구할 수 없습니다.",
    "success",
  );
  updateNetworkButtons();
});

deployButton.addEventListener("click", () => {
  void runNetworkAction(async () => {
    if (!network) throw new Error("먼저 지갑을 연결해 주세요.");
    const connected = network;
    const request = clearNetworkView();
    networkMessage("지갑 승인·증명 생성·배포를 기다리고 있습니다…");
    const secret = fromHex(networkSecretHex);
    await operations.run("deploy", connected.networkId, undefined,
      hooks => connected.deploy(secret, hooks).finally(() => secret.fill(0)),
      result => {
        if (request !== viewRequest || connected !== network) return;
        showPublicState(result.address, result.state);
        networkDeployTxValue.textContent = result.txId;
        networkMessage("계약이 배포되고 공개 상태가 조회됐습니다. 주소와 비밀값을 보관하세요.", "success");
      });
    if (request === viewRequest && connected === network && operations.current?.status !== "CONFIRMED") networkMessage("거래 상태를 확인하세요. UNKNOWN은 취소나 실패가 아니며 같은 거래를 다시 보내지 마세요.");
  });
});

networkReadButton.addEventListener("click", () => {
  void (async () => {
    if (!network) return;
    const connected = network;
    const address = networkAddress.value.trim();
    const request = clearNetworkView();
    networkMessage("인덱서에서 공개 상태를 조회하고 있습니다…");
    try {
      if (!address) throw new Error("계약 주소를 입력해 주세요.");
      const state = await deadline(connected.read(address), 15_000);
      if (request !== viewRequest || connected !== network) return;
      showPublicState(address, state);
      networkMessage("공개 상태를 조회했습니다.", "success");
    } catch (error) {
      if (request !== viewRequest || connected !== network) return;
      networkMessage(`${networkErrorMessage(error)} · UNKNOWN`, "error");
    }
  })();
});

networkClaimButton.addEventListener("click", () => {
  void runNetworkAction(async () => {
    if (!network) throw new Error("먼저 지갑을 연결해 주세요.");
    const connected = network;
    const address = networkAddress.value.trim();
    if (!address) throw new Error("계약 주소를 입력해 주세요.");
    const enteredSecretHex = networkClaimSecret.value.trim();
    const secret = fromHex(enteredSecretHex);
    const request = clearNetworkView();
    networkClaimSecret.value = "";
    await operations.run("claim", connected.networkId, address, hooks => {
      networkMessage("지갑 승인·증명 생성·사용 트랜잭션을 기다리고 있습니다…");
      return connected.claim(address, secret, hooks).finally(() => secret.fill(0));
    }, result => {
      if (request !== viewRequest || connected !== network) return;
      showPublicState(address, result);
      networkClaimTxValue.textContent = result.txId ?? "—";
      if (networkSecretHex.toLowerCase() === enteredSecretHex.toLowerCase()) {
        networkSecretHex = "";
        networkSecretOutput.value = "";
      }
      networkMessage("패스 사용 트랜잭션이 완료되고 공개 상태가 갱신됐습니다.", "success");
    });
    if (request === viewRequest && connected === network && operations.current?.status !== "CONFIRMED") networkMessage("거래 상태를 확인하세요. UNKNOWN은 취소나 실패가 아니며 같은 거래를 다시 보내지 마세요.");
  });
});

updateNetworkButtons();
