type ConnectorLikeError = Error & {
  code?: unknown;
  reason?: unknown;
  type?: unknown;
};

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

const detailsFor = (error: unknown): string => {
  if (!(error instanceof Error)) return String(error ?? "");
  const connector = error as ConnectorLikeError;
  return [
    error.message,
    typeof connector.code === "string" ? connector.code : "",
    typeof connector.reason === "string" ? connector.reason : "",
  ]
    .filter(Boolean)
    .join(" ");
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

  if (normalized.includes("could not load midnight wallet for account")) {
    return "Lace가 연결된 Midnight 계정의 지갑 인스턴스를 불러오지 못했습니다. Lace의 Preview 동기화 상태를 확인하고 이 페이지에서 지갑을 다시 연결하세요. Activity와 잔액을 확인하기 전에는 같은 거래를 다시 전송하지 마세요.";
  }
  if (normalized.includes("disconnected") || normalized.includes("normal closure")) {
    return "Lace와 Preview 네트워크의 연결이 끊어졌습니다. Lace의 Preview 동기화 상태를 확인한 뒤 지갑을 다시 연결하세요.";
  }
  if (normalized.includes("rejected") || normalized.includes("cancelled")) {
    return "지갑에서 요청이 취소되거나 거절됐습니다. 원하지 않는 거래였다면 다시 시도하지 않아도 됩니다.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "네트워크 작업에 실패했습니다.";
};
