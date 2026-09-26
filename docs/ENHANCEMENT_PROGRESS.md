# A–F 고도화·U3 검수 진행표

후속: [F1 수정·F2 릴리스 검수와 남은 체크](./F1_F2_RELEASE_VALIDATION.md). 아래 main 미변경·Notion 연결 미완료 문구는 각 기록 당시의 이력이다. 이후 사용자 승인에 따른 수정/병합 및 현재 연결 상태는 후속 검수와 Notion 종료 패키지로 구분한다.

시작: 2026-09-26, 기준 `b782615`, branch `dev_haams`. 시작 시 working tree clean, remote와 동일. main은 변경하지 않는다.

사용자가 A–F 전부 채택했다. 회로/ABI/key, 발급자 인증, 입장권·송금 기능은 변경 범위 밖이다.
권장 순서 B/D/E → A/C/F → 자동/실제 네트워크 검수 → CI/Pages → Notion U3 대조.

## 구현·검수

- [x] A 역할별 진입·공개 관찰 요약 (비밀값/지갑 정보 내보내기 금지)
- [x] B 사용 장면·정보 최소화·상태별 다음 행동
- [x] C 확인 근거·미확인 항목 패널
- [x] D 확인자 전용 정적 entry (소지자/거래/시나리오 모듈 미로딩 검사)
- [x] E 결과에 연결된 심사자 가이드·리허설 계측 도구
- [x] F 출처가 있는 기능 비교·FAQ·발표 자료
- [ ] 신규 사용자 3명의 이해도 검사 — 실제 사람의 응답 필요
- [ ] 발표자의 실제 30초/3분 낭독 리허설 — 실제 사람의 수행 필요

## Notion U3 원문 기준

출처: https://app.notion.com/p/2026-09-26-Midnight-3e6c9bbb7de58149a8e0cb23c9a367b2
현재 MCP 연결은 다른 워크스페이스여서 404, 로그인된 Chrome의 해당 페이지에서 원문을 읽었다. 기존 기록을 지우거나 담당자의 독립 검수를 대신 완료 처리하지 않는다.

사용자가 이번 갱신을 승인한 뒤 ‘딱따구리’의 지정 페이지 U3 1·2·4·5를 체크하고, 바로 아래에 `2026-09-26 구현·검수 업데이트 — dev_haams` 및 근거 링크를 추가했다. U3-3은 미체크 유지. 브라우저 편집 성공과 MCP 재연결은 별개이며 도구의 워크스페이스 재연결은 완료하지 않았다.

- [x] U3-1 disposable local session에서 실제 compiled circuit 호출로 wrong-secret→correct-secret→replay 시연하기. 실제 DOM + 새 독립 세션, 기존 소지자 세션 미소비 확인.
- [x] U3-2 hardcoded PASS나 wallet mock 결과를 회로·체인 검증이라고 표시하지 않기. 실제 결과를 표시하고 의도적 실패 주입 시 PASS 0 / 다음 단계 잠금 확인.
- [ ] U3-3 기존 Preview 계약·deploy/claim ID·원래 커밋·검증 시각·CI를 기록 예제에 연결하기. **부분 충족:** 주소·ID·커밋·날짜·CI 연결 완료. 원자료에 정확한 검증 시각이 없어 미확인으로 표시. 원기록이 확보되기 전 ‘시각까지 전부 확인’으로 체크하지 않음.
- [x] U3-4 로컬 회로 / 역사적 Preview 거래 / 방금 공개 조회의 증거 수준을 분리하기. 세 영역의 출처/관찰/경계를 별도 표시, UNKNOWN에서는 live 성공 표시 없음.
- [x] U3-5 기존 Preview 성공을 아직 검증하지 않은 새 UI·새 회로의 증거로 사용하지 않기. 회로/ABI/key 변경 없음; 새 UI는 별도 DOM 및 빌드 검수. 기존 스크린샷도 baseline으로 명시.

## 현재 실행 증거

- `npm run verify` exit 0: audit 0 vulnerabilities, Compact/TypeScript/build PASS, Node 25/25, deterministic DOM 24/24. 실제 Preview 2개는 이 명령에서 의도적으로 skip하고 별도로 실행한다.
- `reviewer-bundle-audit.json`: 확인자 entry의 정적/동적 import closure에서 앱 holder/거래/시나리오 및 connector/proof-provider 모듈 0. 공개 SDK의 ledger/runtime 및 주소 인코딩용 `wallet-sdk-address-format`은 포함되며 지갑 연결 기능이 아니다.
- 추가 DOM 검수: 역할 URL 고정, 공개 export allowlist/비밀 미포함, 성공→실패에서 이전 결과 제거, mismatch/malformed 시 소비 성공 0, 전용 화면 input/textarea/select 0, 390px 가로 넘침 0, 키보드 버튼 이동, 가이드 정상/Recorded/회로 실패, 타이머.
- [비교 자료](./FEATURE_COMPARISON.md), [발표/사람 검수표](./HUMAN_VALIDATION.md) 준비. 타이머의 자동 테스트는 실제 사람의 낭독 증거가 아니다.

## 실패와 수정 기록

1. 첫 build의 격리 검사에서 SDK 의존 `wallet-sdk-address-format`을 지갑 세션으로 과도하게 차단했다. 실제 패키지와 의존 경로를 확인하고 이 주소 인코딩 패키지만 정확히 허용했다. 다른 wallet/connector/proof/holder 경로는 계속 차단한다.
2. 첫 통합 DOM 실행은 22 PASS / 2 FAIL: `review.html`의 load 대기 45초 초과, 타이머 실제 클릭 시간 0.3초가 더해져 기대 180.0과 관측 180.3 불일치. 외부 폰트 요청 제거로 불필요한 로딩 의존을 없앴고 테스트 시계를 일시 정지해 클릭 시간과 검증 시간을 분리했다. 로딩 실패 원인을 CDN 하나로 확정한 것은 아니다. 변경 후 전체 24/24 PASS.
3. SDK annotation/번들 크기/생성 회로 sourcemap 경고는 남는다. 오류나 독립 보안 감사로 해석하지 않는다. raw trace에는 테스트 비밀값이 들어갈 수 있어 Git 제외된 `test-results`에만 두며 공개하지 않는다.
4. 첫 production Preview 검수에서 전용 화면은 PASS, 메인 화면은 IDLE로 실패했다. 초기 정적 HTML의 조회 버튼이 SDK 초기화보다 먼저 클릭될 수 있었다. 메인의 중복 초기 버튼을 제거하고 SDK/handler 준비 후 공통 패널에서만 버튼을 생성하도록 수정했다. 네트워크 실패를 성공으로 바꾸거나 타임아웃을 늘리지 않았다.

## 새 실제 로컬망 증거

### Production build 실제 Preview 조회

`BUILT_PREVIEW=1 npm run test:preview` 재실행 **2/2 PASS**, exit 0. main 및 `review.html` 각각 새 Chromium context, 지갑 접근 0 / private input 0 / transaction request 0. 두 요청 모두 고정 주소의 `CONTRACT_STATE_QUERY`이며 mutation 없음.

| 화면 | 새 공개 관찰 UTC | 요청 ID | 결과 |
| --- | --- | --- | --- |
| main | 2026-09-26T05:02:37.519Z | 826cf1de-6d53-4fbc-a9fd-d714a1f3a043 | USED, 이어 actual circuit 3/3 PASS |
| review.html | 2026-09-26T05:02:40.046Z | 3c4d1245-aba1-4568-b630-3c33aedc12ed | USED, private input DOM 0 |

위 시각은 **새 UI의 조회 시각**이지 과거 배포/claim 검증 시각을 보완하는 값이 아니다.

### Localnet

`npm run test:local` exit 0: 실제 8단계 deploy/claim/wrong-secret/replay 및 U4 broadcast 응답 유실→같은 ID 재연결 복구 PASS.

```text
Direct SDK PASS address=1bd599d4243be8dcc85cb7e1268e4f4ac82026214945b87c5c361a5235967c09
U4 UNKNOWN → CONFIRMED tx=00cde9042bda29db88fbdc59d808b589ab4e5ea6fc548d1798e14a6a38c88d80a7
operation=36a085df-eca2-4c36-bd80-e9aa4218a621
Connector SDK PASS address=fbb83816cada38336ec3245bb228843434968732cbc7b409a207166b0610ac4a
```

이는 `undeployed` 로컬 개발망 증거이며 새로운 Lace Preview 배포가 아니다. 검수 후 node/indexer는 원래처럼 중지, 기존 proof-server는 실행 유지했다. 자금·실제 지갑·최종 제출에는 변경이 없다.

## 외부 확인

신규 사용자 테스트, 실제 낭독, 팀원 독립 검수, 참가 자격/최종 제출은 자동 테스트 결과로 대체하지 않는다. 최종 Submit, 외부 공개 댓글·PR, 결제는 하지 않는다.

## 원격·공개 데모 종료 패키지

- 구현 커밋 [`cadf575ff1b2b11fc1b7390cd368ad8dfcc3d3e5`](https://github.com/Haamseongho/midnight_contest/commit/cadf575ff1b2b11fc1b7390cd368ad8dfcc3d3e5), `dev_haams` push 완료. main/origin/main은 `f87aee390bb20ccd8e033dcfa7dbec42de522b68` 유지.
- [구현 CI 36219672174](https://github.com/Haamseongho/midnight_contest/actions/runs/36219672174) success: verify와 실제 local-e2e 둘 다 통과.
- [구현 Pages 36219672146](https://github.com/Haamseongho/midnight_contest/actions/runs/36219672146) success.
- 공개 [전체 데모](https://haamseongho.github.io/midnight_contest/)와 [확인자 화면](https://haamseongho.github.io/midnight_contest/review.html), [배포 번들 분리 검사 결과](https://haamseongho.github.io/midnight_contest/reviewer-bundle-audit.json).
- 공개 fresh-browser 재검수: `DEMO_URL=https://haamseongho.github.io/midnight_contest/ npm run test:preview` **2/2 PASS**, 각 6.0초/5.7초. 지갑 API 0·private input 0·transaction 0; main actual circuit 3/3 PASS.
- main 관찰 UTC `2026-09-26T05:08:15.410Z`, request `b76fcdfc-0a3e-4b8c-8d2c-310637e89822`; reviewer 관찰 `2026-09-26T05:08:21.723Z`, request `dbcb64d9-29a4-4e16-8b87-a3151260a0b6`.
- 최초 공개 smoke에서는 main의 SDK 초기화가 45초를 넘겨 실패했고 reviewer는 42.4초에 통과했다. 같은 코드·같은 45초 제한·새 브라우저로 재실행한 결과가 위 성공이다. 필요한 JS/WASM은 HTTP 200이었고 브라우저 오류 로그는 없었다. 초기 로딩 지연 원인은 확정하지 않았으며 콜드 로딩 위험을 숨기지 않는다.

### 파일·재현·되돌림

변경 파일은 위 커밋 diff 전체를 기준으로 한다. 주요 진입은 `review.html`/`src/review.ts`, 공유 패널 `src/ui/reviewer-panel.ts`, 공개 report `src/evidence/public-observation.ts`, 역할/가이드/시연 `src/ui/{roles,judge-guide,scenario-panel}.ts`, 격리 검사는 `vite.config.ts`, 실제 DOM 검수는 `tests/browser/enhancements.spec.ts`에 있다.

```sh
git switch dev_haams
npm ci
npx playwright install chromium
npm run verify
BUILT_PREVIEW=1 npm run test:preview
docker compose -f devnet/compose.yml up -d --wait
npm run test:local
npm run dev
```

기존 U1–U4 증거는 [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md), 새 증거는 이 문서다. 계약/ABI/key 변경 및 새 Preview 배포는 없다. 필요한 경우 `cadf575` 변경을 검토해 별도의 revert commit으로 되돌리고 다시 검수한다. 원격 이력을 force-push로 되돌리지 않는다. 사용자 승인 없는 main 병합·최종 제출은 하지 않는다.
