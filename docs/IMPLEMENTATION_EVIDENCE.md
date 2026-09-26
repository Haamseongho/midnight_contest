# Silent Pass U1–U4 구현·검수 증거

> 2026-09-26 후속 정정: 원본 `76d6610`/`f87aee3`의 PREVIEW_DEPLOYMENT.md에서 검증 기록 **2026-09-25 10:46 UTC (19:46 KST)**를 확인했다. 아래 ‘날짜만 있다’는 판단은 당시의 누락이며 정정한다. 분 단위 문서 기록과 실제 블록 시각은 구분한다. 새 후보 검수는 [통합 검증](./FINAL_INTEGRATION_VALIDATION.md)을 참조한다.

기준일: 2026-09-26 KST. 작업 브랜치: `dev_haams`.
시작 시 로컬 및 원격 main/dev_haams는 `f87aee390bb20ccd8e033dcfa7dbec42de522b68`, 작업 폴더는 깨끗했다.

## 완료 기준과 결과

| 기준 | 실제 구현 | 실행 증거 |
| --- | --- | --- |
| U1 | network/address/request 세대별 결과 분리; 주소·네트워크 변경과 재조회 시 이전 state/tx 제거; 늦은 응답 무시; 실패 UNKNOWN; local/network generated+claim 입력 함께 지우기 | Chromium actual DOM: A→B, slow A→fast B, network 변경, 성공→실패, 두 구역 clear 및 claim-input-only clear PASS |
| U2 | 배포에 포함된 고정 event/network/address/commitment/source/version, 전용 public provider와 Compact decoder, 별도 검증자 화면 | 실제 Preview fresh-browser read PASS; wallet API 접근 0, private input 0, transaction request 0. wrong network/address/commitment, malformed, stale, timeout, failure에서 성공 표시 0 |
| U3 | 새 disposable session에서 compiled Compact circuit을 실행하는 시나리오; 과거 Preview 증거 별도 카드 | wrong-secret reject, correct-secret consume, replay reject 모두 actual circuit 결과 PASS; 원래 소지자 세션 unchanged; Recorded와 live 분리 |
| U4 | public operation metadata, UNKNOWN 보존, 원래 Promise의 늦은 완료 처리, 재연결/reload 후 exact-ID 조회, 제출 전 중단과 late-submit 차단 | 상태 단위 테스트 6개 + 실제 DOM reject/late/disconnect/reload PASS. 실제 localnet에 claim을 전송한 후 connector 응답 유실을 주입하고 재연결하여 CONFIRMED 복구 |

파일: `src/main.ts`, `src/context/trusted-context.ts`, `src/network/public-reader.ts`, `src/ui/reviewer-state.ts`, `src/ui/reviewer.ts`, `src/demo/scenarios.ts`, `src/evidence/preview-example.ts`, `src/network/operations.ts`, `src/network/midnight.ts`, `tests/browser/regressions.spec.ts`, `tests/operations.test.mjs`, `scripts/local-e2e.mjs`.

## 실제 실행 결과

- `npm run verify`: exit 0. Production audit 0 vulnerabilities; Compact compilation, TypeScript, production build PASS; Node tests 25/25 PASS; deterministic DOM regressions 16/16 PASS (390px narrow-screen 검수 포함). 실제 Preview 항목 하나는 이 명령에서 의도적으로 skip하고 별도 실행한다.
- `LIVE_PREVIEW=1 npm run test:ui`: 초기 통합 검증 16/16 PASS (실제 Preview 포함).
- `npm run test:preview`: 1/1 PASS, exit 0. 2026-09-26 12:42:08.628 KST에 실제 public state 조회. 요청 query는 지정 계약의 public state이며 mutation은 없다. [공개 조회 결과 기록](./evidence/u2-preview-read-20260926.json).
- `npm run test:local`: exit 0. 기존 8단계 실제 localnet E2E와 새 U4 응답 유실 복구 PASS.
- 정상 build에 SDK 번들 크기 경고, 의존성 annotation 경고, 생성된 회로의 sourcemap 원본 경고가 남는다. 검증 실패가 아니며 숨기지 않았다.

### 새 실제 localnet U4 증거

```text
Direct SDK PASS address=f6f60b987c7bfea684db1f623ca438aaadff0ca69f79401357882b70a4ce3347
U4 actual broadcast / lost response: status=UNKNOWN
tx=0035158bada87179af3d1bc54265dec6668098b5c56504c0087ea2d989a9d46861
U4 recovery PASS operation=c3581146-caeb-4a85-8606-0e5ac89e23ca
tx=0035158bada87179af3d1bc54265dec6668098b5c56504c0087ea2d989a9d46861
Connector SDK PASS address=2fd6e75e0adae73752e52123b9fa37813f9ccf36cb4e9163a2e15626ea35cb86
```

이 주소/거래는 disposable `undeployed` 네트워크의 새 검증이다. Preview 배포 증거로 부르지 않는다. Connector adapter는 실제 로컬 지갑을 사용하며, 이미 실제 전송한 뒤 응답만 강제로 실패시켰다. 이로 인해 사용자 Lace 대화상자의 모든 환경을 검증했다고 주장하지 않는다.

## 원래/새 evidence mapping

| 증거 | 증명하는 것 | 증명하지 않는 것 |
| --- | --- | --- |
| 2026-09-25 Preview deploy/claim, code `76d6610`, docs `f87aee3`, CI [36126468920](https://github.com/Haamseongho/midnight_contest/actions/runs/36126468920) | 당시 기존 계약의 실제 배포/1회 소비, 원래 구현의 CI | 이번 reviewer UI, U1 수정, U4 복구 |
| `src/evidence/preview-example.ts` | 위 기록의 날짜·network·contract·deploy/claim ID·CI 연결 | 현재 방문자의 권리, 현재 live 성공 |
| 새 실제 Preview read + DOM suite | 새 reader의 SDK decoding/CORS/지갑 없는 조회와 화면 정책 | 새 계약 배포, issuer 인증, 현장 입장 승인 |
| 새 localnet E2E + operation tests | 변경된 거래 lifecycle과 응답 유실 후 exact-ID 복구 | 새 lifecycle의 실제 Lace Preview 송신 시험 |

회로/ABI/key는 바꾸지 않았다. 새 Preview 거래를 만들지 않았으며 기존 계약을 read-only로 확인했다. 원기록에는 2026-09-25 날짜만 있어 과거 검증의 정확한 시각을 만들어 넣지 않았다.

## 공식 기술 근거

- [Midnight SDK compatibility / public endpoints](https://github.com/midnightntwrk/midnight-sdk/blob/main/COMPATIBILITY.md)
- [공식 한국어 network 환경과 v4 indexer 경로](https://docs.midnightkorea.org/guides/networks-and-environments)
- 실제 고정 endpoint: `https://indexer.preview.midnight.network/api/v4/graphql`, WebSocket `wss://indexer.preview.midnight.network/api/v4/graphql/ws`.
- 설치된 Midnight.js 4.1.1 public data provider의 `queryContractState`는 no-cache query와 SDK state 역직렬화를 사용한다. 앱은 생성된 `ledger` decoder로 상태를 읽는다. CORS는 새 브라우저에서 실제 성공으로 확인했다.
- U4의 `watchForTxData`는 SDK 정의상 무기한 기다릴 수 있으므로 앱은 대기 시간 초과를 UNKNOWN으로 표현한다. 최신 `unclaimed` 한 번으로 실패를 추론하지 않는다.

## 실패와 수정 기록

1. 초기 DOM fault suite: timeout/failure/stale 3개 실패. 테스트 도중 source/compiler 갱신으로 Vite HMR이 페이지를 재로드하고 모듈 경로가 바뀌어 fault 경계가 해제됐다. 테스트 전용 서버에서 파일 감시를 꺼 독립 실행으로 수정. 전체 16개 재실행 PASS. 이전 실패를 최종 성공으로 둔갑시키지 않았다.
2. 첫 실제 U4 localnet run: broadcast 이후 복구 record 검사에서 실패했다. 거래 ID를 64 hex로 가정한 것이 원인; ledger v8의 실제 tagged transaction ID는 66 hex였다. 저장/복구 검사와 모의 fixture를 실제 형식으로 수정. 같은 8단계 및 U4 실제 네트워크 재실행 PASS.

실패 발췌:

```text
Expected pattern: /UNKNOWN|MISMATCH/; Received: IDLE / USED
Error: 거래 복구 기록을 읽지 못했습니다. 기존 거래를 확인해야 합니다.
    at new OperationTracker ... operations.ts
```

원시 브라우저 trace는 테스트용 비밀 입력을 포함할 수 있어 `test-results/`는 Git에서 제외한다. 재실행 시 테스트 결과 JSON, 실패 trace, live screenshot은 그 폴더에 생성된다. 위에는 공개 가능한 실패/결과만 기재했다.

## 재현

```sh
npm ci
npx playwright install chromium
npm run verify
npm run test:preview
docker compose -f devnet/compose.yml up -d --wait
npm run test:local
npm run dev
```

브라우저 fault tests는 실제 DOM handler를 실행하되 SDK/reader 경계만 제어한다. 모의 wallet 결과를 실제 회로 또는 실제 체인 증거로 부르지 않는다.

## 남는 제한과 외부 확인

- 공개 reader는 app publisher와 고정 indexer를 신뢰한다. publisher 정책은 on-chain issuer 인증이 아니다.
- 복구 정보는 같은 탭의 sessionStorage에만 저장된다. 다른 탭/기기를 조정하지 않으며 탭 종료·저장소 삭제로 사라질 수 있다. 전송된 거래가 영원히 관찰되지 않는다면 비포함을 증명할 수 없으므로 UNKNOWN을 유지한다. 제출 전 작업은 명시적으로 중단해 late submission을 차단할 수 있다.
- 이번 변경의 새로운 Lace Preview 거래 승인은 수행하지 않았다. 실제 transaction 영향 검증은 localnet에서 완료했다.
- 최종 제출 폼 입력값, Luma 등록, 팀 자격과 최종 Submit은 사용자 계정 증거로 따로 확인해야 한다. 이 작업은 최종 제출이 아니다.
- [발표 스크립트](./DEMO_SCRIPT.md), [참고 사례 체크리스트](./BENCHMARK_CHECKLIST.md), [실행·Lace 가이드](./RUN_AND_LACE_GUIDE.md)를 함께 사용한다.

## 원격 배포 기록

- 구현 커밋: [`fd71c40c2a873db2b67ef189147bf5bad7082904`](https://github.com/Haamseongho/midnight_contest/commit/fd71c40c2a873db2b67ef189147bf5bad7082904). `dev_haams`에 push 완료. `main`은 시작 커밋 그대로 유지했다.
- [새 CI 36215886045](https://github.com/Haamseongho/midnight_contest/actions/runs/36215886045): **success**. `verify`와 실제 `local-e2e` 두 job 모두 통과했다. 이 결과는 위 구현 커밋에 해당한다.
- [Pages 36215886066](https://github.com/Haamseongho/midnight_contest/actions/runs/36215886066): build 성공, deploy 차단. GitHub의 `github-pages` 환경 보호 규칙이 `dev_haams` 브랜치를 허용하지 않는다. 실패 사유: `Branch "dev_haams" is not allowed to deploy to github-pages due to environment protection rules.`
- 최초 차단 당시에는 환경 보호 규칙을 임의로 변경하지 않고 사용자 승인을 요청했다.
- 2026-09-26 사용자 승인 후 `github-pages` 환경에 정확한 branch `dev_haams`를 추가했다. 기존 `main` 및 다른 보호 설정은 유지했다. 저장 완료 메시지와 두 브랜치가 함께 허용된 화면을 확인했다.
- 문서 후속 커밋 `afc0b5620886db0bf0a29711f83cfcea3274d98b`의 [CI 36216200134](https://github.com/Haamseongho/midnight_contest/actions/runs/36216200134) **success**, [Pages 36216200151 재시도 #2](https://github.com/Haamseongho/midnight_contest/actions/runs/36216200151/attempts/2) **success**.
- 실제 [공개 demo](https://haamseongho.github.io/midnight_contest/)에서 새 reviewer UI 초기화, 고정 Preview 계약 조회 **USED**, 관찰 `2026-09-26T04:04:39.754Z`, request `5d25b5fe-488a-43f6-be91-dfa275692827`를 확인했다. 지갑 연결/거래 승인 없이 조회했다. 이어 disposable actual circuit의 wrong-secret/correct-secret/replay 세 항목 **PASS**를 화면에서 확인했다. 과거 기록은 별도 접힌 카드로 유지된다.
- 이 공개 smoke 검수는 위 배포 커밋에 대한 증거이며 새 Preview 거래 송신 증거가 아니다. 후속 변경은 문서와 현재 브랜치를 가리키는 footer 링크 정합성 보완이다. 추가 아이디어의 기능 구현은 하지 않았다.
