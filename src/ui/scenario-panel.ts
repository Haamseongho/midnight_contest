import { runScenarios } from "../demo/scenarios";

export function mountScenarios(onComplete: (passed: boolean) => void): void {
  const results = document.getElementById("scenario-results")!;
  document.getElementById("scenario-run")!.addEventListener("click", () => {
    results.replaceChildren(); onComplete(false);
    try {
      const run = runScenarios();
      for (const result of run) {
        const item = document.createElement("li");
        item.textContent = `${result.passed ? "PASS" : "FAIL"} · ${result.name}`;
        item.dataset.passed = String(result.passed); results.append(item);
      }
      document.getElementById("scenario-observation")!.textContent = `이번 독립 회로 실행 · ${new Date().toISOString()} · 체인 거래/증명 생성 아님`;
      onComplete(run.length === 3 && run.every(result => result.passed));
    } catch {
      results.textContent = "FAIL · 회로 시연을 완료하지 못했습니다.";
      document.getElementById("scenario-observation")!.textContent = "이번 회로 실행 실패 · 이전 성공은 현재 결과가 아닙니다.";
    }
  });
}
