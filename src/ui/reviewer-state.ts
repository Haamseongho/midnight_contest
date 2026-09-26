import { TRUSTED_CONTEXT } from "../context/trusted-context";
import type { Observation } from "../network/public-reader";

export type ReviewerState = "IDLE" | "READING" | "UNUSED" | "USED" | "MISMATCH" | "UNKNOWN";
export const reviewerLabels: Record<ReviewerState, string> = {
  IDLE: "아직 조회하지 않음", READING: "현재 조회 중", UNUSED: "미사용",
  USED: "사용 기록 있음", MISMATCH: "맥락 불일치", UNKNOWN: "조회 실패 · UNKNOWN",
};
export const reviewerNext: Record<ReviewerState, string> = {
  IDLE: "지정된 공개 기록을 새로 조회하세요. 지갑이나 비밀값은 필요하지 않습니다.",
  READING: "현재 응답을 기다립니다. 이전 결과는 이번 조회의 근거가 아닙니다.",
  UNUSED: "아직 소비되지 않은 공개 상태입니다. 현재 방문자의 자격·입장 허가는 별도로 판단하세요.",
  USED: "누군가 한 번 소비한 기록입니다. 현재 방문자를 입장 승인하지 않습니다.",
  MISMATCH: "지정 맥락과 응답이 다릅니다. 맥락 출처를 확인하고 결과를 신뢰하지 마세요. 거래를 재전송하지 마세요.",
  UNKNOWN: "현재 상태를 확인하지 못했습니다. 공개 기록만 다시 조회하거나, Recorded example을 과거 기록으로 확인하세요. 지갑 연결·재전송은 필요하지 않습니다.",
};
export function classifyObservation(value: unknown, requestId: string, startedAt: number): ReviewerState {
  if (!value || typeof value !== "object") return "UNKNOWN";
  const o = value as Partial<Observation>;
  if (typeof o.claimed !== "boolean" || typeof o.commitment !== "string" ||
      !/^[a-f0-9]{64}$/.test(o.commitment) || typeof o.observedAt !== "string" ||
      o.requestId !== requestId || !Number.isFinite(Date.parse(o.observedAt)) ||
      Date.parse(o.observedAt) < startedAt || Date.parse(o.observedAt) > Date.now() + 1000) return "UNKNOWN";
  if (o.network !== TRUSTED_CONTEXT.network || o.address !== TRUSTED_CONTEXT.address ||
      o.commitment !== TRUSTED_CONTEXT.commitment || o.contextVersion !== TRUSTED_CONTEXT.version) return "MISMATCH";
  return o.claimed ? "USED" : "UNUSED";
}

export async function deadline<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([promise, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("조회 응답 시간 초과")), ms);
    })]);
  } finally { clearTimeout(timer); }
}
