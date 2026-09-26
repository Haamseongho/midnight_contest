# Silent Pass — 최종 로컬 보완·제출 준비 감사

> **보존된 ZIP 원본 감사 기록:** 아래 환경·37개 Node/8개 제한 브라우저 결과는 ZIP 작성 당시의 기록이며, 현재 전체 체크아웃의 검증 결과가 아니다. 2026-09-26 로컬 통합·추가 수정·재검증은 [FINAL_INTEGRATION_VALIDATION.md](./FINAL_INTEGRATION_VALIDATION.md)를 우선 확인한다. 원본 감사의 제한과 실패 이력은 삭제하지 않았다. 두 기록 모두 새 원격 배포나 최종 접수 증거가 아니다.

## 한눈에 보는 판정
- **FINAL SHA REVIEWED:** `363064270e80d65834151ce07796616bf7680f01`
- **SPRINT STATE:** LOCAL_PATCH_AND_SUBMISSION_ASSETS_CREATED / NOT_DEPLOYED
- **SECURITY DECISION:** B · ACCEPTABLE AFTER PATCHES AND COMPLETE REVALIDATION. 검토된 prototype 범위이며 formal security audit 아님.
- **SUBMISSION READINESS:** B · READY AFTER LISTED FIXES/REVALIDATION. “계정 입력만 남음”이라고 할 수 없음.
- **WIN-CONVERSION:** B · TARGETED HARDENING.
- **OUTPUT:** 로컬 diff·수정 파일·37개 Node 검수·8개 제한된 브라우저 검수·원고/시연/Q&A/GO sheet.

## 1. 실제 입력과 우선순위
업로드된 지시서와 `Silent_Pass_Winner_Benchmark_20260926 (1).zip`을 사용했다. 입력 ZIP은 72,875bytes, SHA256 `188ea4c3bb2aa250447805f930d8b7c5ffa90f82df5ef20b20819e196381e675`. 기준이 f87aee3인 선행자료이지 최신 구현의 정답이 아니다. 최신 source와 충돌하면 source를 우선했다.

GitHub connector로 main SHA, package.json, 실제 main/errors/operations/contract 및 UI source, 보안·README·제출문서를 조회했다. 수정에 사용한 원본은 Git blob SHA로 대조했다. 저장소 전체 clone이 아니라 **검증한 선택 소스와 실제 기준 배포 artifact**를 사용했다.

## 2. 환경과 재현 한계
이 환경: Node22.16.0 / npm10.9.2 / system Chromium / Python Playwright / global TypeScript. 저장소는 Node>=24.11.1을 요구한다. clone은 DNS 실패, codeload도 확보 실패, Docker 부재. Chromium의 URL navigation은 공개/loopback 모두 ERR_BLOCKED_BY_ADMINISTRATOR였다.

따라서 full `npm ci`, 전체 `npm run verify`, 새로운 Compact compilation/Vite bundle/production import audit, Docker E2E, current Preview publicquery를 완료했다고 말하지 않는다. 이 제한을 회피한 것처럼 숨기지도 않는다. 준비된 로그와 실행 가능한 새 tests를 남겨 전체 checkout에서 이어서 검증하게 한다.

### 제한된 브라우저 검수의 구성
기존 Pages artifact의 JS/CSS/WASM을 로컬에서 읽고 Blob/data URL로 재연결했다. 수정한 TS 소스를 transpile하여 실제 DOM handler를 실행했다. sessionStorage는 about:blank 환경용 memory store이고 지갑/네트워크는 명시적 boundary double이다. 외부 request는 모두 차단했다. 실제 baseline compiled circuit은 그대로 실행했다. 이는 synthetic PASS 화면을 만드는 검사가 아니지만, **새 production bundle이나 actual chain 검증도 아니다.**

## 3. 재현한 문제와 직접 수정
### H1. 알 수 없는 외부 오류 원문이 화면으로 반환됨
원본 `networkErrorMessage`는 분류하지 못한 Error.message를 그대로 반환한다. 실제 baseline production DOM에 synthetic private-looking sentinel을 포함한 error를 주입했을 때 원문이 보이는 것을 재현했다. textContent이므로 이 테스트에서 executable XSS는 없었고, 실제 사용자 secret 유출·외부 전송을 발견한 것도 아니다. 잠재적인 민감정보 노출을 줄이는 **중간 수준의 오류표시/데이터최소화 문제**다.

수정: own data descriptor의 bounded fields만 분류에 사용하고 미지 오류는 고정 안내로 치환. custom getter/toString을 의도적으로 호출하지 않는다. known contract error literal 호환성을 보존한다. local generation/claim fallback도 고정화했다. transaction의 성공/실패 상태를 오류문구 분류로 새롭게 결정하지 않는다.

### H1b. 취소 시 저장 실패 예외가 handler 밖으로 전파될 수 있음
OperationTracker의 failclosed core는 유지했다. direct cancel click 호출에 catch를 두어 저장 실패를 BLOCKED 상태/고정문구로 안내한다. 기록삭제·guard해제·재전송을 추가하지 않는다. controlled browser에서 cancel write fault 후 BLOCKED/no pageerror, 늦은 작업이 전송하지 못함을 확인했다. 이 범위는 실제 지갑 대신 모의 경계다.

### H2. SDK 로딩 실패가 첫 화면에서 불명확함
새 main/reviewer bootstrap과 정적인 준비 표시를 추가했다. LOADING/READY/FAILED는 앱 초기화 상태이며 live publicquery 상태가 아니다. dynamic import 실패 시 원문 오류를 출력하지 않고 historical 링크와 안전주의를 표시한다. 자동 reload, wallet호출, transaction, storage reset 없음. decoder를 바꾸지 않았다.

성능 향상으로 포장하지 않는다. public TTFB·cold-load 반복 측정은 미실시다. offline초 단위 기록은 harness runtime이며 인터넷성능 수치가 아니다. heavy SDK/WASM은 여전히 필요할 수 있다.

### H3. 릴리스·재전송·제출 문구
역사 CI/Pages를 현재 제출 체크에서 분리했고, 앞으로 패치가 반영된 finalSHA/CI/Pages는 별도로 검증하도록 바꿨다. `verify-submission-release.mjs`의 11개 pure tests는 정상/불일치/실패를 검증한다. live API 실행은 아직 하지 않았다.

재시도 도움말은 ‘공개 미사용/미검출은 실패 증거가 아님, 원래 tx의 최종 결과 먼저’로 좁혔다. no-referrer meta를 추가했으나 CSP나 responseheader enforcement를 했다고 주장하지 않는다.

## 4. 실제 실행 결과
| 실행 | 결과 | 해석 |
|---|---|---|
| 새 hardening Node | 22/22 PASS | sanitizer·기존 recovery fault/unit |
| 새 release-validator Node | 11/11 PASS | synthetic metadata cases |
| 기존 network-errors tests | 4/4 PASS | 수정 후 기존 기대동작 호환 |
| isolated strict tsc | exit0 | errors/operations/startup만, 전체 app 아님 |
| TS transpile | 8modules diagnostics0 | syntax 변환; full dependency typecheck 아님 |
| baseline production offline | 11 관찰 완료 | 1개 rawerror결함 재현 포함. 11개 보안PASS 아님 |
| patched source offline browser | 8/8 PASS | 실제 sourcehandlers+baseline runtime, boundary mocks |
| 새 Playwright spec | 6cases 작성 | full repo/Vite에서는 NOT_RUN |
| clone/fullbuild/Preview/Docker | NOT_VERIFIED | 위 환경 차단 근거 |

처음 patched browser 시도에서 **harness 오류 2개**가 있었다. page.evaluate가 반환된 함수를 실행하는 형태를 고쳐 `void 0`로 끝내고 재실행했다. 앱 코드를 바꿔 숨긴 실패가 아니며 최초 로그도 보존했다. URL navigation이 막힌 11attempt는 앱 결함 11개가 아니다.

## 5. Threat model과 비보장
보호 대상은 secret·오류표시·정확한 계약맥락·미확정 거래guard·관찰export·릴리스근거다. 신뢰 모델은 앱 publisher·indexer·wallet/prover·browser다. URL공격자는 pinned context를 바꾸면 안 되고, malformedresponse/stalerace는 UNKNOWN/MISMATCH로 닫혀야 한다. 그러나 origin에서 이미 임의 JS를 실행할 수 있는 공격자를 이 앱만으로 격리하는 sandbox는 없다.

- F1/U4는 같은 탭의 safetyguard이며 storage가 공격자에 의해 완전히 바뀌거나 새탭/새기기로 이동할 때 전역 coordination을 보장하지 않는다.
- secret possession은 identity/issuer/현재 현장 session 증명이 아니다.
- public indexer의 진실성·network proof를 독립 검증하는 lightclient가 아니다.
- historical tx, newread, localcircuit, localnettransaction, buildmetadata, unsignedexport는 다른 증거층이다.

## 6. Security / DOM / dependency 상세 판정
고정 template의 innerHTML과 untrusted textContent를 구분했다. 이번 synthetic HTML은 실행되지 않았다. 모든 XSS/extension/supply-chain vector를 닫았다고 말하지 않는다. unknownmessage를 boundedcopy로 바꿔 rawdata가 화면·스크린샷으로 들어갈 경로를 줄였다.

기존 main-only Pages, least-needed read/source+Pageswrite 구조와 baseline 성공은 보존한다. Action mutabletag, transitive deprecated package/installscript는 유지했으며 과거 audit0이 오늘 모든 dependency의 안전성을 뜻하지 않는다. 실제 exploit을 입증하지 않은 경고 때문에 majorupgrade나 lockfile 변경은 하지 않았다. `npm audit`는 전체 checkout에서 재실행해야 한다.

CSP는 WASM/SDK/WebSocket/동적 import를 깨뜨릴 수 있어 검증 없이 삽입하지 않았다. meta frame-ancestors는 응답헤더 대체가 아니며 현재 hosting의 clickjacking 방어를 검증했다고 하지 않는다.

## 7. 국내·해외 benchmark 강점 적용
이번에는 업로드 사례를 새로 발명하거나 숫자를 확대하지 않았다. 첨부 원장 자체가 국내5프로젝트는 1개대회, 일부UI NOT_VIEWED임을 명시한다. 수상 인과관계나 우승확률을 이 표본으로 추정하지 않는다.

| 참고자료에서 추출한 패턴 | 이번 실제 적용 | 가져오지 않은 것 |
|---|---|---|
| 역할부터 보여주기(위임 등) | 기존 role/reviewer흐름 유지, 원고에 holder/reviewer 구분 | 법적위임·DID·기관인증 주장 |
| 확인자 마찰 낮추기(AnchorZK 등) | 별도 bootstrap/준비·실패 상태, 지갑없는 entry 유지 | 경쟁작 전체 기능·수상원인 추정 |
| 즉시 확인할 증거(EDDA 등) | 실제회로·history·live·release 구분 원고 | 가짜 성공·새 Preview 재생성 |
| 필요한 정보만 표시(zkMatch 등) | unknownerror rawdata 최소화 | 실수요·데이터효과 수치 |
| 좁은 end-to-end flow | 제출폼 copy/GO Sheet/실제사람검수표 | 추가 ticketing/issuer platform |

## 8. 경쟁력 판단 — 리뷰어 해석
기술 실행·회로/재현자료는 강점, 기본 primitive 신규성·실수요/운영완결성은 약점이다. 이번 변경은 보안 인증을 붙이는 것이 아니라 감점 요인인 rawerror/불명확한 로딩/구버전 릴리스 체크를 줄이는 국소 보완이다. 추가 protocol 기능을 넣을 근거는 이번 검수에서 확보하지 못했다. 우승을 확률로 예측하지 않는다.

## 9. 정확한 다음 행동
1. clean full repo에서 안전 적용 script를 실행한다. main이 달라졌으면 중단 후 affectedfiles를 재대조한다.
2. Node24/Compact/Docker 환경에서 전체 재검증. 새bootstrap의 production closure도 검사한다.
3. 사용자/팀원이 직접 commit/승인/remote 반영. 자동push/PR 없음.
4. 같은SHA source·CI·Pages·release·실제publicdemo 확인.
5. 사람 이해도/실제낭독·등록/팀/최종폼을 확인하고 사용자 직접Submit.

## 10. STOP / rollback
성능 수치 미확보를 이유로 fakeclaim을 만들지 않는다. 새production build가 깨지거나 reviewer forbiddenmodules가 생기면 bootstrap 변경을 분리 rollback하고 안전한 오류처리/문서와 독립평가한다. 원래 transaction 기록을 reset하지 않는다. unresolved lifecycle/regression이 남으면 해당변경의 제출완료 선언을 보류한다. 무조건 시간/패치 수로 중단하지 않는다.

## Sources
- 실제 source: https://github.com/Haamseongho/midnight_contest/tree/363064270e80d65834151ce07796616bf7680f01
- 오류 함수: https://github.com/Haamseongho/midnight_contest/blob/363064270e80d65834151ce07796616bf7680f01/src/network/errors.ts
- recovery: https://github.com/Haamseongho/midnight_contest/blob/363064270e80d65834151ce07796616bf7680f01/src/network/operations.ts
- 보안 경계: https://github.com/Haamseongho/midnight_contest/blob/363064270e80d65834151ce07796616bf7680f01/SECURITY.md
- CI: https://github.com/Haamseongho/midnight_contest/actions/runs/36223346869
- Pages: https://github.com/Haamseongho/midnight_contest/actions/runs/36223346867
- 공식: https://www.hackathon.midnightkorea.org/kor (2026-09-26 fresh read)
- Luma: https://luma.com/2pnv2fwk (실제 계정/별도 cutoff 미확인)
- 첨부 benchmark: 입력 ZIP의 BENCHMARK_CASES.md/MANIFEST.json. 사례의 세부 미확인을 그대로 유지.
