// Static presentation shared by the full laboratory and the read-only entry.
export function renderReviewerPanel(): void {
  const host = document.getElementById("reviewer-panel");
  if (!host) return;
  host.innerHTML = `
    <div class="eyebrow">PUBLIC REVIEWER · LIVE READ</div>
    <h2 id="reviewer-title">지갑 없이 공개 기록 확인</h2>
    <p id="reviewer-context"></p>
    <p>앱 배포자가 고정한 계약만 조회합니다. 소지자가 준 URL·manifest는 신뢰 설정을 바꾸지 않습니다. <a id="reviewer-source" target="_blank" rel="noopener noreferrer">맥락 출처</a></p>
    <div class="information-boundary"><p><strong>필요한 정보</strong> 지정 계약의 공개 상태</p><p><strong>요청하지 않음</strong> 이름·주민번호·초대 비밀값·지갑 연결</p></div>
    <dl class="ledger-card"><div><dt>지정 계약</dt><dd id="reviewer-address"></dd></div><div><dt>예상 커밋먼트</dt><dd id="reviewer-commitment"></dd></div></dl>
    <button id="reviewer-read" type="button" class="button button-primary">공개 기록 새로 조회</button>
    <p id="reviewer-status" class="feedback" role="status" data-state="IDLE">아직 조회하지 않음</p>
    <p id="reviewer-observation" class="observation">현재 확인된 관찰 없음</p>
    <p id="reviewer-next" class="scope-note"></p>
    <section aria-labelledby="reviewer-checks-title" class="evidence-panel"><h3 id="reviewer-checks-title">무엇을 확인했나요?</h3>
      <ul id="reviewer-checks"></ul>
      <p>확인하지 않음: 발급기관의 진위 · 현재 방문자의 신원 · 현장 입장 권한.</p>
      <p>요청 ID는 이번 조회를 구분하는 값이며 소지자 인증이나 암호학적 세션 결합이 아닙니다. 앱 배포자의 설정과 공개 indexer를 신뢰하는 모델입니다.</p>
    </section>
    <button id="reviewer-export" type="button" class="button button-outline" disabled>공개 관찰 요약 다운로드</button>
    <p id="reviewer-export-note">저장 당시의 관찰만 담습니다. 공증·입장권·서명된 증명이 아니며 현재 상태는 다시 조회해야 합니다.</p>
    <p class="scope-note">‘사용 기록 있음’은 누군가 한 번 소비했다는 뜻입니다. 현재 방문자의 입장 승인·신원·발급자 인증을 뜻하지 않습니다. 지갑 연결, 비밀값 입력, 서명과 거래 요청은 필요하지 않습니다.</p>
    <details id="recorded-example" class="wallet-help"><summary>Recorded example · 과거 검증 기록</summary>
      <p>과거 Preview 거래 증거입니다. 현재 조회·새 UI의 검증과 별개입니다.</p><p id="recorded-meta"></p>
      <dl><div><dt>계약</dt><dd id="recorded-address"></dd></div><div><dt>당시 배포 ID</dt><dd id="recorded-deploy"></dd></div><div><dt>당시 claim ID</dt><dd id="recorded-claim"></dd></div></dl>
      <a id="recorded-source" target="_blank" rel="noopener noreferrer">원래 검증 기록</a> · <a id="recorded-ci" target="_blank" rel="noopener noreferrer">당시 CI</a>
    </details>`;
}
