import { TRUSTED_CONTEXT } from "../context/trusted-context";
import type { Observation } from "../network/public-reader";

export type ReviewerState = "IDLE" | "READING" | "UNUSED" | "USED" | "MISMATCH" | "UNKNOWN";
export const reviewerLabels: Record<ReviewerState, string> = {
  IDLE: "아직 조회하지 않음", READING: "현재 조회 중", UNUSED: "미사용",
  USED: "사용 기록 있음", MISMATCH: "맥락 불일치", UNKNOWN: "조회 실패 · UNKNOWN",
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
