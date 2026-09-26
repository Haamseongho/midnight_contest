/** Load the SDK without leaving a silently inert first screen.
 * This status is readiness only, never a live-read or security verdict.
 * No automatic reload/retry: a partially started transaction may be unresolved.
 */
export async function startApp(load: () => Promise<unknown>): Promise<void> {
  const status = document.getElementById("app-startup-status");
  const host = document.getElementById("app-startup");
  // Guards are present in static HTML, before this bootstrap or its SDK loads.
  // Release inert guards without changing main's per-control disabled states.
  const guards = document.querySelectorAll<HTMLElement>("[data-startup-guard]");
  if (host) host.dataset.bootState = "LOADING";
  try {
    await load();
    guards.forEach((guard) => { guard.inert = false; });
    if (host) host.dataset.bootState = "READY";
    if (status) status.textContent = "화면 준비 완료 · 이 표시는 공개 조회 결과가 아닙니다.";
  } catch {
    if (host) host.dataset.bootState = "FAILED";
    if (status) status.textContent = "SDK를 불러오지 못했습니다. 아래 원래 검증 기록은 과거 자료이며 live 성공이 아닙니다. 미확정 거래가 있다면 기록을 삭제하거나 새 탭으로 재전송하지 마세요.";
  }
}
