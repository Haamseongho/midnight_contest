import { TRUSTED_CONTEXT } from "../context/trusted-context";
import { readTrustedPublicState } from "../network/public-reader";
import { classifyObservation, deadline, reviewerLabels } from "./reviewer-state";
import { PREVIEW_EXAMPLE } from "../evidence/preview-example";
import { runScenarios } from "../demo/scenarios";

export function mountReviewer(): void {
  const el = (id: string) => document.getElementById(id)!;
  el("reviewer-context").textContent = `${TRUSTED_CONTEXT.eventLabel} · ${TRUSTED_CONTEXT.network} · ${TRUSTED_CONTEXT.version}`;
  el("reviewer-address").textContent = TRUSTED_CONTEXT.address;
  el("reviewer-commitment").textContent = TRUSTED_CONTEXT.commitment;
  (el("reviewer-source") as HTMLAnchorElement).href = TRUSTED_CONTEXT.source;
  const example = PREVIEW_EXAMPLE;
  el("recorded-meta").textContent = `${example.verifiedAt} · network ${example.network} · code ${example.commit} · documentation ${example.documentationCommit}`;
  el("recorded-address").textContent = example.address;
  el("recorded-deploy").textContent = example.deployId;
  el("recorded-claim").textContent = example.claimId;
  (el("recorded-source") as HTMLAnchorElement).href = example.source;
  (el("recorded-ci") as HTMLAnchorElement).href = example.ci;
  let sequence = 0;
  el("reviewer-read").addEventListener("click", async () => {
    const seq = ++sequence;
    const requestId = crypto.randomUUID();
    const startedAt = Date.now();
    el("reviewer-status").textContent = reviewerLabels.READING;
    el("reviewer-status").dataset.state = "READING";
    el("reviewer-observation").textContent = `요청 ${requestId} · ${new Date(startedAt).toISOString()} · 응답 대기`;
    try {
      const observation = await deadline(readTrustedPublicState(requestId), 15_000);
      if (seq !== sequence) return;
      const state = classifyObservation(observation, requestId, startedAt);
      el("reviewer-status").textContent = reviewerLabels[state];
      el("reviewer-status").dataset.state = state;
      el("reviewer-observation").textContent = `요청 ${requestId} · 관찰 ${observation?.observedAt ?? "미확인"}`;
    } catch {
      if (seq !== sequence) return;
      el("reviewer-status").textContent = reviewerLabels.UNKNOWN;
      el("reviewer-status").dataset.state = "UNKNOWN";
      el("reviewer-observation").textContent = `요청 ${requestId} · ${new Date().toISOString()} · 성공 관찰 없음. 아래 Recorded example은 과거 기록입니다.`;
    }
  });
  el("scenario-run").addEventListener("click", () => {
    el("scenario-results").replaceChildren();
    try {
      for (const result of runScenarios()) {
        const item = document.createElement("li");
        item.textContent = `${result.passed ? "PASS" : "FAIL"} · ${result.name}`;
        item.dataset.passed = String(result.passed);
        el("scenario-results").append(item);
      }
    } catch { el("scenario-results").textContent = "FAIL · 회로 시연을 완료하지 못했습니다."; }
  });
}
