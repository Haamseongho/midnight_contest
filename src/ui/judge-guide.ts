import type { ReviewerState } from "./reviewer-state";

export function mountJudgeGuide() {
  const el = (id: string) => document.getElementById(id)!;
  const next = el("guide-next") as HTMLButtonElement;
  let step = 0;
  let live: ReviewerState = "IDLE";
  let circuitPassed = false;
  let recordedAcknowledged = false;
  let visitedEvidence = false;
  const instructions = [
    "1/4 · 문제와 역할: 초대 비밀값을 공개하지 않고 소비 기록을 함께 확인합니다. 소지자는 자기 환경에서 claim, 확인자는 공개 조회만 합니다.",
    "2/4 · 공개 기록 새로 조회를 누르세요. 실제 현재 결과를 기다립니다. 실패했다면 Recorded example을 열고 과거 예제로 진행한다고 명시하세요.",
    "3/4 · 실제 회로 시연 버튼을 누르세요. 독립 세션에서 잘못된 비밀값 거절 → 1회 소비 → 재사용 거절이 모두 확인되어야 합니다.",
    "4/4 · Recorded example의 원래 커밋·날짜·거래·CI를 열어 보세요. 로컬 회로는 체인 거래가 아니며, 공개 사용 기록은 현재 방문자의 입장 승인이 아닙니다.",
  ];
  const render = () => {
    el("guide-instruction").textContent = instructions[step];
    el("guide-instruction").dataset.step = String(step);
    const liveOK = live === "USED" || live === "UNUSED";
    next.disabled = step === 1 ? !(liveOK || recordedAcknowledged) : step === 2 ? !circuitPassed : step === 3;
    (el("guide-recorded") as HTMLButtonElement).disabled = step !== 1 || (live !== "UNKNOWN" && live !== "MISMATCH");
    el("guide-evidence-mode").textContent = recordedAcknowledged ? "Recorded example 경로 · live 성공 아님" : liveOK ? "현재 공개 조회 경로 · 방문자 인증 아님" : "현재 조회 성공 미확인";
    el("guide-complete").textContent = step === 3 && visitedEvidence && circuitPassed && (liveOK || recordedAcknowledged) ? "가이드 경로 확인 완료 · 제출/독립 검수/발표 완료를 뜻하지 않음" : "가이드 진행 중";
  };
  next.addEventListener("click", () => {
    if (!next.disabled && step < 3) {
      step++;
      if (step === 3) (el("recorded-example") as HTMLDetailsElement).open = false;
      render();
    }
  });
  el("guide-reset").addEventListener("click", () => { step = 0; live = "IDLE"; circuitPassed = false; recordedAcknowledged = false; visitedEvidence = false; render(); });
  el("guide-recorded").addEventListener("click", () => {
    if (step === 1 && (live === "UNKNOWN" || live === "MISMATCH")) {
      recordedAcknowledged = true;
      (el("recorded-example") as HTMLDetailsElement).open = true;
      render();
    }
  });
  el("recorded-example").addEventListener("toggle", () => {
    if (step === 3 && (el("recorded-example") as HTMLDetailsElement).open) { visitedEvidence = true; render(); }
  });
  render();
  return {
    readChanged(state: ReviewerState) { live = state; if (state === "READING") { recordedAcknowledged = false; visitedEvidence = false; } render(); },
    circuitChanged(passed: boolean) { circuitPassed = passed; render(); },
  };
}

export function mountRehearsalTimer(): void {
  const output = document.getElementById("rehearsal-status")!;
  let start: number | null = null;
  let target = 30;
  let timer: ReturnType<typeof setInterval> | undefined;
  const stop = document.getElementById("rehearsal-stop") as HTMLButtonElement;
  const render = () => { if (start !== null) output.textContent = `목표 ${target}초 · 경과 ${((performance.now() - start) / 1000).toFixed(1)}초 · 실제 낭독 여부는 자동 판정하지 않습니다.`; };
  for (const seconds of [30, 180]) document.getElementById(`rehearsal-${seconds}`)!.addEventListener("click", () => {
    clearInterval(timer); start = performance.now(); target = seconds; stop.disabled = false;
    render(); timer = setInterval(render, 100);
  });
  stop.addEventListener("click", () => {
    if (start === null) return;
    render(); clearInterval(timer); start = null; stop.disabled = true;
    output.textContent += " 종료. 발표자는 실제 낭독 시간·누락 내용을 별도 검수표에 기록하세요.";
  });
}
