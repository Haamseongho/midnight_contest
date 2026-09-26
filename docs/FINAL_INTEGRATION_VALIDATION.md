# 최종 ZIP 통합·전체 검증 — 2026-09-26

**LOCAL_VALIDATED / NOT_DEPLOYED / NOT_SUBMITTED — 2026-09-26 17:21 KST 실행 결과 확인.** 원격 반영·새 main/CI/Pages·계정·최종 Submit은 사용자 단계다. 발견한 로컬 결함과 문서 모순을 보완하고 아래 전체 검증이 통과했다. 공개 배포 성공이나 보안 인증으로 확대하지 않는다.

## 1. 입력과 안전한 적용

- 작업 브랜치: `dev_haams`. 기준 HEAD / origin/main / origin/dev_haams: `363064270e80d65834151ce07796616bf7680f01`.
- 입력: `Silent_Pass_FINAL_SUBMISSION_READY_20260926.zip`.
- ZIP SHA-256: `e82a61ef3a5dd757a7b25249e808c014a3fe2507bfb4d923c7f95ef8f078b815`.
- 저장소 밖 `/tmp/silent-pass-final.Fd6IHr/Silent_Pass_FINAL_SUBMISSION_READY_20260926`에 별도 해제했다. MANIFEST의 118개 항목은 크기·해시 일치, ZIP 전체는 manifest 포함 119개 파일이다.
- FINAL_AUDIT_KO / PATCH_APPLY_INSTRUCTIONS / 적용 스크립트·manifest·diff를 읽고 최신 origin/main을 가져와 대조했다. 사용자 ZIP들 때문에 원래 작업 폴더의 dry-run이 `DIRTY_WORKTREE`로 중단되는 것을 확인했다. 파일을 삭제·숨기거나 안전장치를 우회하지 않았다.
- 동일 origin/main의 깨끗한 임시 detached worktree `baseline-check`에서 원본 `apply_patch.py`를 dry-run하여 **DRY_RUN_OK**를 확인했다. 기준 SHA·충돌·체크섬이 일치했다.
- 검토한 diff를 실제 `dev_haams`에 파일별로 적용했다. overlay 전체 복사·강제 적용·reset·commit·push·merge는 하지 않았다. 적용 직후 manifest의 new_sha256 대상 22개 파일이 모두 일치했고, 아래 추가 보완을 별도로 수행했다.
- [ZIP Markdown 전체 대조표](./FINAL_DOCUMENT_CROSSCHECK.md): 36개 경로를 전부 확인, 해시 중복을 묶은 16개 고유 본문 완독. ZIP README와 과거 reproduction/source_base 문서를 현재 프로젝트 파일로 덮어쓰지 않았다.

## 2. 적용 및 추가로 바로잡은 사항

1. 미지의 provider/로컬 오류 원문을 고정 안내로 제한했다. getter/toString을 의도적으로 호출하지 않고 입력값을 화면에 반사하지 않는다.
2. 거래 중단 시 storage 쓰기 실패를 UI에서 처리하며 BLOCKED·원본 기록·중복 전송 차단을 유지한다. 실제 DOM의 늦은 wallet 응답에서도 broadcast 0을 검사한다.
3. main/reviewer의 SDK 준비·실패 상태를 분리했다. 통합 검사에서 찾은 준비 전 클릭 유실은 **정적 HTML의 inert guard**로 수정했다. import 성공 후만 해제하며 거래 버튼의 기존 disabled는 유지한다. 실패해도 독립 확인자 화면 링크와 과거 기록 링크는 사용할 수 있다. READY는 공개 조회 결과가 아니다.
4. 계약 미검출의 실제 예외 문구와 오류 분류를 맞췄다. 미검출/미사용/timeout은 원래 거래 실패의 증거가 아니며 exact-ID 최종 결과 확인이 필요하다. 기존 Preview runbook도 이 규칙에 맞췄다.
5. 원본 기록 재대조로 **과거 검증 시각 누락 오기**를 수정했다. 원본 `76d6610` 및 `f87aee3`의 PREVIEW_DEPLOYMENT.md에는 `2026-09-25 10:46 UTC`가 있다. Recorded UI·제출 원고·대본에 **19:46 KST / 원본 문서의 분 단위 기록 / 블록 시각 아님**으로 반영했다. 현재 조회 시각이나 초 단위를 만들어 넣지 않았다. 과거 감사·진행표에는 정정 안내를 추가하고 당시 이력을 보존했다.
6. 실제 제출폼 항목에 맞게 한국어 소개/구현 원고를 재배치했다. README의 Identity & Privacy는 제품 주제이지 공식 트랙이 아니라고 정리하고, 옛 CI·거래 증거에 역사 기록 제목을 붙였다.
7. production startup/실패·reviewer 분리 검사를 `npm run verify`에 포함했다. source UI와 production 결과 파일을 분리했다. 로컬 콜드 로딩 측정에는 실제 URL·관찰 시각을 남기고 공개 인터넷 성능으로 확대하지 않는다.

계약 소스·ABI·SDK 버전·dependency lockfile·OperationTracker 핵심 lifecycle은 변경하지 않았다. 새 발급자 인증·입장권·익명성·결제 기능을 추가하지 않았다.

## 3. 실행 환경과 결과

Node **24.20.0**, npm **11.19.0**, Compact devtools **0.5.1** / compiler **0.31.1**, Docker client/server **29.8.0**. 실제 Chromium 새 context와 pinned Docker node 0.22.3 / indexer 4.0.1 / proof-server 8.0.3 사용.

| 검사 | 실제 결과 | 증거 수준 |
| --- | --- | --- |
| npm ci / Chromium 설치 | PASS | 전체 checkout 의존성 설치; 기존 lockfile 유지 |
| 전체 npm run verify | **exit 0 · Node 65/65 · source DOM 40/40 · production 4/4 · audit 0** | Compact·타입·Vite도 PASS. source suite의 전용 검사 3개 skip은 아래/production 별도 실행이며 PASS 수에 미포함 |
| 실제 Preview 공개 조회 | **2/2 PASS**, wallet/private input/transaction 각 0 | 로컬 production origin에서 실제 공개 indexer; 새 Preview 거래 아님 |
| 실제 Docker local E2E | **8단계 PASS · exit 0** | direct SDK·connector·증명·거래·exact-ID 복구 |
| 새 production reviewer 분리 | **PASS**, forbiddenModules=[] | static/dynamic 4개 chunk closure + 실제 브라우저 요청 경로 일치, 비밀 입력/holder controls 없음 |
| Pages 경로 추가 검증 | **build PASS + 실제 공개 조회 2/2 PASS** | `/midnight_contest/` base로 별도 로컬 빌드·서비스. 공개 GitHub Pages 배포는 아님 |
| 로컬 cold-load | **6/6 READY 관찰**, HTTP 200 | 각 entry별 cache-disabled 새 context 3회; 공개 성능 아님 |
| 새 공개 릴리스 / 사용자 계정 / 접수 | NOT_EXECUTED | 사용자 단계; 과거 성공으로 대신하지 않음 |

### 현재 결과의 로컬 근거

`logs/final-integration-20260926/`는 Git에서 제외된 로컬 증거 폴더다.

- `verify-final.log`: Node 65, DOM 40, production 4의 전체 통과. `ui-results.json`, `production-results.json`은 각각의 실제 결과다.
- `preview-read.log`, `preview-results.json`, `preview-browser/`: 기본 production 경로의 실제 Preview 읽기와 화면 캡처. 확인자 캡처의 준비/관찰/역사 구분도 직접 확인했다.
- `pages-path-build.log`, `pages-path-preview.log`, `pages-path-preview-results.json`: 실제 Pages base를 사용한 로컬 추가 확인. 제출 branch/릴리스 metadata는 위조하지 않았고 local build의 sourceCommit/workflowRun은 null이다.
- `reviewer-bundle-audit.json`: 금지 모듈 0. main/지갑/거래/시나리오를 reviewer closure로 가져오지 않았다.
- `local-e2e.log`: 실제 로컬 개발망 거래 8단계.
- `dry-run.log`: 같은 원본 clean worktree의 dry-run 재확인.
- `cold-load.json`, `cold-load.log`: 2026-09-26T08:19:18.241Z, main READY 2199/2522/1187ms, reviewer 499/493/440ms. 같은 Mac의 loopback 및 Docker 실행 조건이며 속도 개선 비교·공개 인터넷 성능 보장이 아니다.

기본 production 읽기의 관찰 UTC: main **2026-09-26T08:18:36.294Z**, request `aeebc05c-48ba-4bf5-adea-cdaf1e0e3644`; reviewer **2026-09-26T08:18:41.503Z**, request `a162074b-7916-42ec-8efd-dcd7c7844fc6`. 요청은 고정 계약의 CONTRACT_STATE_QUERY이며 mutation 없음. 이 시각을 9/25 과거 거래 검증 시각으로 사용하지 않는다.

실제 `undeployed` 개발망의 이번 최종 실행:

- direct SDK 계약: `f06df00d164ca1ed77eb8bc7c355afa1256ff22b1dfdf88bac2b0d3d6baff8e5`
- direct claim: `675114afbf2637409fee0feccb2af4318bb0d201317e6a5a2f26b719fa035eb0`
- connector 계약: `abc0b800a6d70a82c4c6654fa7ee2818f57acb77e0ef03e59269932f2f24662c`
- 응답 유실 → 복구한 동일 operation: `5f2918db-074f-4bba-8cb2-76caa2bc2768`
- 같은 transaction ID: `001feecb7c6a33ab8a72c07c9aa681f665e59261c7da1f885394319172ec633e61`, **UNKNOWN → CONFIRMED**. 실제 Lace Preview 승인을 다시 받은 검사가 아니다.

## 4. U1–U4와 Notion 대조

[딱따구리 종일 작업실](https://app.notion.com/p/3e6c9bbb7de58149a8e0cb23c9a367b2)과 연결된 [16:40 후보 패키지 페이지](https://app.notion.com/p/3e7c9bbb7de58162b625d3f56b5959ed)를 읽었다. 실제 연결 워크스페이스가 ‘딱따구리’임을 확인했다. 이번 요청에서는 참고만 했으며 Notion의 과거 체크박스를 현재 결과로 덮어쓰지 않았다.

- U1: 주소 A→B, 늦은 A→빠른 B, 네트워크 변경, 성공→실패 UNKNOWN, 각 영역의 generated/claim-only 입력 삭제를 실제 source DOM으로 검사한다.
- U2: 앱 배포 맥락을 고정하고 wallet-free 공개 조회, 맥락 불일치·malformed·stale·timeout에서 성공 표시 방지를 검사한다. USED는 방문자 인증/입장 승인이 아니다.
- U3: disposable compiled circuit의 오답→정답→재사용 거절, holder 세션 독립성, 실제 결과 기반 가이드, 역사/live/local 분리를 검사한다. **U3-3의 문서상 시각 누락은 원본 문서로 복구했다.** 초 단위 raw log·블록 포함 시각은 새로 검증한 것이 아니다.
- U4: 승인·거절·timeout·늦은 성공·끊김·reload/reconnect·exact-ID 복구와 BLOCKED 경계를 검사한다. 저장소 장애와 새 탭/기기까지 조정하는 전역 잠금은 서로 다르다.

Notion의 기존 기술 PASS는 `3630642` 기준 이력이다. 이번 로컬 후보의 기술 검사, 새 공개판 검사, 팀원의 독립 승인·사람 낭독·실제 등록·폼 입력·접수를 별도 단계로 관리한다.

이번 로컬 기술 대조 결과는 **U1 6/6 · U2 6/6 · U3 5/5 · U4 4/4**다. U3-3은 원본문서에 기재된 분 단위 검증시각을 출처와 함께 연결한다는 범위다. 팀원 독립 승인이나 새 공개판 검수·제출 완료를 뜻하지 않는다.

## 5. 실패 이력과 보완

- 원본 dry-run의 DIRTY_WORKTREE는 사용자 ZIP 보존을 위한 정상 중단이었다. 동일 SHA의 별도 clean worktree로 검사했다.
- 첫 전체 검증에서 기존 문서 안전 문장 누락 1건을 발견했다. 사용자 직접 Submit / Local Devnet 공식 허용 문장을 복원했고 기존 테스트를 삭제하지 않았다.
- 다음 source DOM에서 준비 전 클릭 유실로 8건 실패했다. 초기화 완료 전 정적 제어를 막는 제품 수정으로 해결했다.
- 추가 cold-click 테스트 1건은 아래쪽 버튼으로 자동 스크롤하는 동안 SDK가 위쪽 DOM을 삽입해 클릭 위치가 변동했다. trace의 pointer interception을 확인했다. 동일 준비 전 클릭/handler 대기를 화면 상단 역할 버튼에서 검증하도록 바꾸고 3회 반복의 9개 검사를 통과했다. 버튼 guard를 없애거나 READY 대기를 모든 기존 테스트에 덧붙이는 방식으로 숨기지 않았다.
- 원본 검증 시각 정정 뒤 기존 가이드 테스트 2건이 ‘시각 없음’이라는 옛 기대값으로 실패했다. 실제 원본문서의 시간과 역사 범위를 확인하는 기대값으로 갱신했고 최종 전체 재실행에 포함했다.
- 실패 로그: `logs/final-integration-20260926/verify-startup-scroll-failure.log`, `verify-history-expectation-failure.log`. 해당 오류 context/trace도 로컬 logs에 보존했다. 초기 도구 실행의 실패는 위 요약으로 보존하며 모든 최초 실행의 별도 파일 로그가 있다는 뜻은 아니다.

원시 browser trace는 입력 데이터를 포함할 수 있으므로 Git/공개 제출물에 넣지 않는다. 테스트는 합성 값 또는 disposable localnet을 사용했으며 기존 실제 지갑의 비밀번호·seed를 사용하지 않았다.

## 6. 제출폼 및 남은 사용자 단계

2026-09-26 [공식 페이지](https://www.hackathon.midnightkorea.org/kor)에서 열린 [실제 Tally 폼](https://tally.so/popup/Np20VW)을 **입력 없이** 읽었다. public GitHub 및 `midnightntwrk` 토픽도 공개 API로 확인했다.

필수: 팀/프로젝트명, 참가 형태, 소속/이름(모든 팀원의 이름·이메일·직책), 대표 연락처, public GitHub, 토픽 확인, 프로젝트 소개, Midnight 구현 포인트. 덱·영상·데모 URL·Explorer/Scholar 증서는 선택 표시다. 별도 지갑 주소·트랙·한 줄·Problem·Solution 칸은 없었다. 이름 없는 Untitled 링크의 용도와 서버 길이 제한은 미확인으로 유지했다.

[사용자 실행 순서](./USER_SUBMISSION_STEPS.md) → [폼 원고](./SUBMISSION_FORM_COPY.md) → [GO Sheet](./FINAL_GO_SHEET.md)를 사용한다.

1. 검증된 파일만 사용자 직접 commit/push; 검증 후 main 반영. 입력 ZIP·개인정보·local trace를 일괄 stage하지 않는다.
2. **새 제출 SHA**의 CI·Pages·release.json 및 공개 main/review.html 확인. 과거 기준 SHA의 릴리스 검사 성공은 이번 후보의 공개 성공이 아니다.
3. 실제 Luma 등록·팀원·연락처·필수 입력은 사용자 확인. 코드와 병행 가능하다.
4. 실제 사람 이해도와 30초/3분 발표는 [미실시 양식](./HUMAN_VALIDATION_READY.md)에 실제 결과만 기록. 내부 품질 제안이며 공식 필수 접수 항목으로 부풀리지 않는다. 영상도 아직 제작하지 않았다.
5. 최종 폼 전체를 검토한 뒤 사용자 직접 Submit, 접수 증거·시간대·제출 SHA 보존.

공식 마감은 **2026-09-28 00:00 KST**다. ‘로컬 검증 완료’와 ‘공개 제출판 확인 완료’, ‘접수 완료’를 구분한다.

## 7. 한계와 경고

formal security audit, 운영용 자격증명, issuer/현재 제시자 인증, 현장 입장 결정, 완전 익명, cross-device lock은 제공하지 않는다. Preprod 새 검증·새 Lace Preview 거래도 수행하지 않았다.

dependency audit의 0은 모든 보안 위험 부재를 뜻하지 않는다. SDK PURE annotation, 500 KB 초과 chunk, 생성 contract sourcemap 및 일부 deprecated dependency/install-script 관리 경고가 남는다. 대규모 SDK 업데이트·CSP/frame-ancestors·GitHub Actions immutable pinning을 검증 없이 추가하지 않았다. 공개 cold-load 개선 수치, 사람의 실제 이해도·영상·등록·접수는 만들어 넣지 않는다.

## 8. 재현 명령

검수 후 이번에 켠 Docker node/indexer는 원래 중지 상태로 돌렸고, 기존 proof-server는 healthy 실행 상태를 유지했다. 임시 검증 서버 5188/5189도 종료했다. 기존 사용자의 앱 서버·지갑·원본 ZIP은 종료·삭제·변경하지 않았다. 작업 종료 전 fetch 결과 HEAD/origin/main/origin/dev_haams는 모두 기준 `3630642…`였고, 변경은 `dev_haams`의 미커밋 파일로만 남겼다. 기존 생성 키/빌드/로그의 Git 제외 규칙도 유지했다.

```sh
npm ci
npx playwright install chromium
npm run verify
BUILT_PREVIEW=1 npm run test:preview
docker compose -f devnet/compose.yml up -d --wait --wait-timeout 240
npm run test:local
```

`verify`는 네트워크 fault에 경계 대역을 사용한다. `test:preview`는 실제 공개 읽기만, `test:local`은 실제 disposable 개발망 거래를 실행한다. 이 명령들이 최종 Submit을 수행하지는 않는다.
