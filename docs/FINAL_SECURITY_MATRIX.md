# 최종 보안·제출 matrix — ZIP 작성 당시 기록

> 아래 표는 ZIP 저자의 제한된 환경 검수 원본을 보존한 것이다. 현재 Node 24 전체 체크아웃의 재검수와 새로 확인된 사항은 [통합 검증](./FINAL_INTEGRATION_VALIDATION.md), [전체 Markdown 대조표](./FINAL_DOCUMENT_CROSSCHECK.md)를 우선한다. 특히 아래 ‘과거 시각 NOT_RECOVERED’는 정정되었다: 원본 `76d6610`/`f87aee3` 문서에 **2026-09-25 10:46 UTC / 19:46 KST**가 분 단위로 기록되어 있다. 이는 원본 문서의 관찰 시각이지 블록 포함 시각이 아니다. 새 원격 배포·계정·최종 제출은 여전히 별도 사용자 단계다.

PASS는 명시된 좁은 범위의 통과다. 전체 앱 보안 인증이 아니다. PARTIAL은 source/이력/일부 검사만 확보한 항목, NOT_VERIFIED는 실제 실행/증거가 필요한 항목이다.

|항목|판정|근거|범위/남은 일|
|---|---|---|---|
|secret persistence|PARTIAL|source, input-only clear, export allow-list 검토|전체 SDK/지갑/trace 검수는 아님|
|secret DOM clear|PASS|기준 실제 artifact와 수정 source handlers의 입력 정리|JS/OS/클립보드 완전삭제 보장 아님|
|unknown provider error|PASS|합성 raw error 반영 재현 후 fixed-copy sanitization 검수|실제 유출/외부 exfiltration 발견 아님|
|malformed error getter/toString|PASS|sanitizer가 getter/toString을 호출하지 않는 단위·DOM|동일 origin에 이미 실행 중인 악성 JS의 sandbox 아님|
|local exception sanitization|PASS|생성/claim fallback bounded|전체 의존성의 모든 로그를 감사한 것 아님|
|cancel storage write failure|PASS|patched handler에서 BLOCKED·no pageerror|operations core 불변; 실제 wallet은 모의 경계|
|generated secret cleanup on all exceptional paths|PARTIAL|입력삭제·대표 예외 검증|모든 in-flight 배열/GC 경로 보장 안 함|
|public export|PARTIAL|baseline allow-list, UNKNOWN/MISMATCH semantics source|patch 후 실제 public download 재검증 필요|
|logs / failure traces|NOT_VERIFIED|이번 증거는 synthetic inputs만 포함|전체 upstream artifact에 대한 전수 비밀탐지 미실시|
|URL/context tampering|PARTIAL|pinned deployment policy, existing tests source|새 public origin 통합 재실행 미실시|
|DOM injection|PARTIAL|textContent와 fixed HTML, 합성 unknown error 비반영|사이트 전체 penetration test 아님|
|malformed indexer|PARTIAL|baseline decoder·classifier source와 기존 CI|악성 indexer 실망 검증 아님|
|stale response/race|PARTIAL|기존 source/CI와 이전 경계검수|최신 전체 app regression 재실행 필요|
|reviewer source isolation|PASS|별도 bootstrap→review, main import 없음|production closure 다음 행 참조|
|reviewer production closure|NOT_VERIFIED|baseline artifact forbiddenModules=[]|새 Vite build 후 산출물 closure 검사 필요|
|wallet-free live Preview|NOT_VERIFIED|기존 구현자/CI별도자료만 존재|이 환경 actual public query 성공 없음|
|U3 compiled circuit|PASS|실제 baseline compiled artifact3/3 + patchedhandlers|새 온체인 ZK transaction 아님|
|duplicate transaction guard|PASS|UNKNOWN·exact-ID source 및 단위|실제 wallet/체인 재실행은 별도|
|corrupt recovery storage|PASS|baseline F1·원기록보존·명시적BLOCKED|tamper-proof metadata라고 주장 안 함|
|storage write failure|PASS|3단계 synthetic fault에서 broadcast 차단|actualPreview broadcast 시험 안 함|
|missing record after fault|PASS|기존 안전차단 유지|탭 종료 후 새 탭/다른 기기 잠금 없음|
|exact-ID reconcile|PASS|기존 결과 매칭·UNKNOWN 회귀|신뢰 indexer의 진실성까지 증명 안 함|
|cross-tab / cross-device|PARTIAL|같은 탭 safeguard 한계 명시|전역 double-submit 조정 아님|
|startup failure visibility|PASS|실제 candidate startup module controlled browser|새배포·public cold timing 아님|
|public cold-load|NOT_VERIFIED|URL navigation administrator blocked|TTFB/FCP/ready 개선 수치 생성 안 함|
|mobile390 overflow|PASS|오프라인 candidate screenshot/DOM|전체 기기/브라우저 matrix 아님|
|keyboard/screen reader|PARTIAL|statusrole와 basicfocus|실제 스크린리더 전수검사 없음|
|referrer policy|PARTIAL|HTML meta no-referrer 선언/DOM 확인|모든 외부요청 header 측정 미실시|
|CSP / clickjacking|NOT_VERIFIED|추가하지 않음|GitHubPages 응답 frame-ancestors 미검증|
|dependency vulnerability audit|NOT_VERIFIED|baseline CI audit0 이력과 pinneddeps|현재 npm audit 실행/새lock 변경 없음|
|Actions supply chain|PARTIAL|기존 main-only Pages 및 readonly source|mutable Action tags 유지, immutable attestation 아님|
|release validator logic|PASS|11 synthetic cases|live API checker 실행 미실시|
|baseline main/CI/Pages|PASS|3630642와 기존 성공runs/artifact metadata|patched code 증거로 재사용 금지|
|candidate main/CI/Pages|NOT_VERIFIED|remote write0|새 SHA/CI/deploy 이후 검증|
|README/form agreement|PARTIAL|문구 패키지와 published fields 검수|실제 계정 폼은 미확인|
|historical/live/local evidence|PASS|문서·UI 경계 유지|정확한 옛 시각 NOT_RECOVERED|
|issuer/presenter/admission boundary|PASS|비보장 명확화|새 issuer-auth 기능 아님|
|human comprehension/rehearsal|NOT_VERIFIED|템플릿만 생성|사람 수행 필요, 공식 접수요건 아님|
|registration/team|NOT_VERIFIED|공식 조건 확인|개인 계정 증거 없음|
|Submit/receipt|NOT_VERIFIED|행동하지 않음|준비 문서≠접수|
