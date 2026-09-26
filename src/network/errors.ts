type DustBalance = {
  balance: bigint;
  cap: bigint;
};

export const assertSpendableDust = ({ balance, cap }: DustBalance): void => {
  if (balance > 0n) return;

  if (cap > 0n) {
    throw new Error(
      "Lace의 tDUST 잔액이 0입니다. Preview에서 Generate tDUST를 완료한 뒤 다시 시도해 주세요. 거래는 전송되지 않았습니다.",
    );
  }

  throw new Error(
    "Lace의 tDUST 잔액과 생성 한도가 모두 0입니다. Preview tNIGHT가 DUST 생성에 등록됐는지 확인하고 Generate tDUST를 완료한 뒤 다시 시도해 주세요. 거래는 전송되지 않았습니다.",
  );
};

// Treat provider failures as untrusted data: never stringify arbitrary objects,
// trigger their custom toString(), or reflect raw messages into the page.
const safeField = (value: unknown, field: string): string => {
  try {
    if (!value || (typeof value !== "object" && typeof value !== "function")) return "";
    const candidate = Object.getOwnPropertyDescriptor(value, field)?.value;
    return typeof candidate === "string" ? candidate.slice(0, 4096) : "";
  } catch { return ""; }
};
const detailsFor = (error: unknown): string =>
  [safeField(error, "message"), safeField(error, "code"), safeField(error, "reason")].join(" ");

export const localErrorMessage = (error: unknown): string => {
  const message = safeField(error, "message");
  if (message.includes("already claimed")) return "이미 사용된 패스입니다.";
  if (message.includes("does not match")) return "비밀값이 일치하지 않습니다. 공개 상태는 변경되지 않았습니다.";
  if (message === "64자리 16진수 비밀값을 입력해 주세요.") return message;
  return "로컬 확인에 실패했습니다. 입력값이나 오류 원문은 표시하지 않습니다.";
};

export const requiresWalletReconnect = (error: unknown): boolean => {
  const details = detailsFor(error).toLowerCase();
  return [
    "could not load midnight wallet for account",
    "disconnected",
    "normal closure",
    "지갑 연결이 끊어졌습니다",
    "지갑 계정 동기화",
  ].some((marker) => details.includes(marker));
};

export const networkErrorMessage = (error: unknown): string => {
  const details = detailsFor(error);
  const normalized = details.toLowerCase();
  if (safeField(error, "message") === "Secret does not match commitment") return "Secret does not match commitment";

  if (normalized.includes("could not load midnight wallet for account")) {
    return "Lace가 연결된 Midnight 계정의 지갑 인스턴스를 불러오지 못했습니다. Lace의 Preview 동기화 상태를 확인하고 이 페이지에서 지갑을 다시 연결하세요. Activity와 잔액을 확인하기 전에는 같은 거래를 다시 전송하지 마세요.";
  }
  if (normalized.includes("disconnected") || normalized.includes("normal closure")) {
    return "Lace와 Preview 네트워크의 연결이 끊어졌습니다. Lace의 Preview 동기화 상태를 확인한 뒤 지갑을 다시 연결하세요.";
  }
  if (normalized.includes("rejected") || normalized.includes("cancelled")) {
    return "지갑에서 요청이 취소되거나 거절됐습니다. 원하지 않는 거래였다면 다시 시도하지 않아도 됩니다.";
  }
  // Preserve actionable guidance without copying untrusted error contents.
  if (normalized.includes("tdust 잔액과 생성 한도가 모두 0")) {
    return "Lace의 tDUST 잔액과 생성 한도가 모두 0입니다. Preview tNIGHT 등록과 Generate tDUST 상태를 확인하세요. 거래 상태는 별도로 확인하세요.";
  }
  if (normalized.includes("tdust 잔액이 0")) {
    return "Lace의 tDUST 잔액이 0입니다. Preview에서 Generate tDUST 상태를 확인하세요. 거래 상태는 별도로 확인하세요.";
  }
  if (normalized.includes("dapp connector 4.x 지갑이 활성화되지 않았습니다")) {
    return "Midnight DApp Connector 4.x 지갑이 활성화되지 않았습니다. Lace 잠금과 연결 설정을 확인하세요.";
  }
  if (normalized.includes("blocked")) {
    return "BLOCKED · 복구 기록을 확인하지 못해 거래가 잠겼습니다. 원기록을 삭제하거나 새 탭으로 우회하지 마세요.";
  }
  if (normalized.includes("64자리 16진수")) return "64자리 16진수 비밀값을 입력해 주세요.";
  if (normalized.includes("먼저 지갑을 연결")) return "먼저 지갑을 연결해 주세요.";
  if (normalized.includes("계약 주소를 입력")) return "계약 주소를 입력해 주세요.";
  if (normalized.includes("해당 주소의 계약을 찾을 수 없습니다")) return "해당 주소의 계약을 찾지 못했습니다. 미검출은 이전 거래 실패의 증거가 아닙니다.";
  if (normalized.includes("거래 식별자") || normalized.includes("미확정")) {
    return "원래 거래 ID와 네트워크를 확인하세요. 최종 결과가 불명확한 동안에는 재전송하지 마세요.";
  }
  if (normalized.includes("초과") || normalized.includes("timeout") || normalized.includes("응답하지 않았습니다")) {
    return "응답을 제시간에 확인하지 못했습니다. 시간 초과는 취소가 아니며 원래 거래의 최종 결과를 확인해야 합니다.";
  }
  return "네트워크 작업을 확인하지 못했습니다. 오류 원문은 표시하지 않습니다. 미확정 거래가 있다면 원래 거래 ID의 최종 결과를 먼저 확인하세요.";
};
