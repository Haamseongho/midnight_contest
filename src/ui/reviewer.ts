import { TRUSTED_CONTEXT } from "../context/trusted-context";
import { readTrustedPublicState } from "../network/public-reader";
import { deadline, reviewerLabels, reviewerNext, type ReviewerState } from "./reviewer-state";
import { PREVIEW_EXAMPLE } from "../evidence/preview-example";
import { publicReport, downloadPublicReport, type PublicReport } from "../evidence/public-observation";
import { renderReviewerPanel } from "./reviewer-panel";

export function mountReviewer(onChange?: (state: ReviewerState) => void): void {
  renderReviewerPanel();
  const el = (id: string) => document.getElementById(id)!;
  const exportButton = el("reviewer-export") as HTMLButtonElement;
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
  let report: PublicReport | null = null;
  const render = (state: ReviewerState) => {
    el("reviewer-status").textContent = reviewerLabels[state];
    el("reviewer-status").dataset.state = state;
    el("reviewer-next").textContent = reviewerNext[state];
    const checks = el("reviewer-checks"); checks.replaceChildren();
    for (const [key, label] of [["network", "네트워크"], ["contract", "계약"], ["commitment", "커밋먼트"], ["policy", "정책 버전"]] as const) {
      const result = report?.checks[key];
      const item = document.createElement("li");
      item.textContent = `${label}: ${result === true ? "지정 맥락과 일치" : result === false ? "불일치 — 신뢰하지 마세요" : "이번 조회에서 미확인"}`;
      checks.append(item);
    }
    exportButton.disabled = !report;
    onChange?.(state);
  };
  render("IDLE");
  exportButton.addEventListener("click", () => { if (report) downloadPublicReport(report); });
  el("reviewer-read").addEventListener("click", async () => {
    const seq = ++sequence;
    const requestId = crypto.randomUUID();
    const startedAt = Date.now();
    report = null; render("READING");
    el("reviewer-observation").textContent = `요청 ${requestId} · ${new Date(startedAt).toISOString()} · 응답 대기`;
    try {
      const observation = await deadline(readTrustedPublicState(requestId), 15_000);
      if (seq !== sequence) return;
      report = publicReport(observation, requestId, startedAt);
    } catch {
      if (seq !== sequence) return;
      report = publicReport(null, requestId, startedAt);
    }
    render(report.status);
    el("reviewer-observation").textContent = `요청 ${requestId} · 관찰 ${report.observedAt ?? "미확인 — 성공 관찰 없음"}`;
  });
}
