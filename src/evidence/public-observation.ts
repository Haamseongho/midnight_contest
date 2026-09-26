import { TRUSTED_CONTEXT } from "../context/trusted-context";
import { classifyObservation, type ReviewerState } from "../ui/reviewer-state";
import type { Observation } from "../network/public-reader";

export type PublicReport = {
  schema: "silent-pass-public-observation-v1";
  kind: "unsigned-recorded-observation";
  event: string; network: string; contract: string; expectedCommitment: string;
  policySource: string; policyVersion: string;
  requestId: string; requestedAt: string; observedAt: string | null;
  status: ReviewerState;
  checks: { network: boolean | null; contract: boolean | null; commitment: boolean | null; policy: boolean | null };
  claimed: boolean | null;
  limitations: string[];
};

// Explicit allowlist. Never spread untrusted observations or DOM/session values.
export function publicReport(value: unknown, requestId: string, startedAt: number): PublicReport {
  const status = classifyObservation(value, requestId, startedAt);
  const comparable = status === "USED" || status === "UNUSED" || status === "MISMATCH";
  const o = comparable ? value as Observation : undefined;
  const c = TRUSTED_CONTEXT;
  return {
    schema: "silent-pass-public-observation-v1", kind: "unsigned-recorded-observation",
    event: c.eventLabel, network: c.network, contract: c.address, expectedCommitment: c.commitment,
    policySource: c.source, policyVersion: c.version, requestId,
    requestedAt: new Date(startedAt).toISOString(), observedAt: o?.observedAt ?? null,
    status,
    checks: { network: o ? o.network === c.network : null, contract: o ? o.address === c.address : null,
      commitment: o ? o.commitment === c.commitment : null, policy: o ? o.contextVersion === c.version : null },
    claimed: status === "USED" ? true : status === "UNUSED" ? false : null,
    limitations: ["Unsigned observation, not a certificate or admission pass.", "Not current after download; query again.",
      "Does not authenticate issuer, presenter or admission rights.", "Trusts app deployment policy and indexer; request ID is not holder/session authentication."],
  };
}

export function downloadPublicReport(report: PublicReport): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url; a.download = `silent-pass-observation-${report.requestId}.json`;
  a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
