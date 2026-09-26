# F1 수정·F2 릴리스 검수 — 2026-09-26

기준: `dev_haams`의 `181fd3b419b044932563066c2e3f146a0a905ef6`. 사용자가 수정·재검증 후 main 병합을 승인했다. 이 문서는 구현자 측 검수이며 팀원의 독립 승인·사람 리허설·최종 제출 증거가 아니다.

## F1: 복구 기록 오류를 숨기지 않기

- 손상 JSON, 스키마 오류, sessionStorage getter/read/write 오류를 `BLOCKED`로 표시한다. 원본 오류 문자열·원본 데이터는 화면에 노출하지 않고 기록도 자동 삭제하지 않는다.
- BLOCKED 동안 새 deploy/claim, 취소 및 거래 결과 확인을 차단한다. 공개 조회와 독립 로컬 회로 시연은 유지한다.
- 저장소 접근/원본 기록을 복구한 뒤 **복구 기록 다시 검사**를 명시적으로 누른다. 미확정 작업은 같은 operation/tx ID의 UNKNOWN으로 복구한다. 오류 뒤 기록이 사라졌다는 이유로 전송을 허용하지 않는다.
- 쓰기 오류는 메모리의 최신 작업을 보존한다. 전송 직전 저장에 실패하면 hook이 반환되기 전에 중단되므로 실제 broadcast는 0이다. 이 경우는 전송 전 상태로 복구해 저장소가 회복된 뒤 안전한 전송 전 중단을 허용한다. 보내지도 않은 거래 ID를 영구 대기하지 않는다.
- 실제 전송 후 결과 불명은 정확한 최종 tx 결과나 늦은 성공으로만 해제한다. 한 번의 `unclaimed`·미검출은 실패 증거가 아니다. 다른 탭/기기의 거래를 조정하지 않으며, 원본 기록을 잃으면 자동 해제할 수 없다. 기록 삭제/새 탭 재전송을 우회 방법으로 안내하지 않는다.

구현: `src/network/operations.ts`, `src/main.ts`, `index.html`. 테스트: `tests/operations.test.mjs`, `tests/browser/regressions.spec.ts`.

## 로컬 재검증 결과

- `npm run verify`: exit 0, production audit 0 vulnerabilities, Compact/TypeScript/production build 통과, Node 30/30, DOM 30/30. 실제 Preview 2개는 별도 네트워크 검증이므로 이 명령에서는 skip한다.
- F1 새 단위 4개는 잘못된 기록/접근 오류/각 저장 단계 실패/timeout·늦은 성공의 저장 실패를 검사한다. 전송 직전 실패에서 broadcast 0과 명시적 복구 후 중단 가능도 검사한다.
- F1 새 DOM 6개는 실제 앱 이벤트·화면에서 BLOCKED/원본 보존/읽기 전용 유지/안전한 재검사를 검사한다. 장애 주입과 모의 네트워크는 실제 체인 증거라고 부르지 않는다.
- `BUILT_PREVIEW=1 npm run test:preview`: 2/2 PASS, main 및 review.html 각각 새 Chromium. 지갑 접근 0·비밀 입력 0·거래 요청 0, 고정 Preview 계약 read. main에서 독립 compiled circuit 3/3 PASS.
- 위 공개 관찰 UTC: main `2026-09-26T06:10:54.647Z` / reviewer `2026-09-26T06:11:07.511Z`. 이 시각은 현재 read의 시각이며 9/25 배포·claim 검증 시각을 대체하지 않는다.
- `npm run test:local`: exit 0, 실제 undeployed localnet 8단계 통과. 직접 SDK 계약 `8ec270bb4da988a6be4637851e5bda5114e32145b0a5e1fdef35eae4360d0b49`, Connector 계약 `4855bdc6070642bd7dbd30bc57d7e8c79fe0a080ccb915d583f2e9b34d554fcb`. 실제 broadcast 후 응답 유실 UNKNOWN → 재연결 후 CONFIRMED: operation `a0359759-1c77-425f-bcf0-b6c8fc4921c0`, tx `00e3811b6419777fcb30fdd791e5499bbffa9a665af4e194ece7c728b9fd086401`. 로컬 거래 증거이며 실제 Lace Preview 승인창 검증은 아니다.
- SDK annotation/큰 번들/생성 회로 sourcemap 경고는 남는다. 자동 검사 통과가 무결함·독립 보안 감사·발표 완성을 뜻하지 않는다.

## F2: canonical main과 배포 소스 대조

Pages push 대상을 main으로 제한하고 수동 실행도 main만 허용한다. 화면의 저장소/보안/신뢰 설정 링크도 main을 가리킨다. 개발은 dev_haams에서 계속한다.

빌드가 `release.json`에 CI의 `sourceCommit`, `sourceRef`, `workflowRun`을 기록한다. 로컬 빌드는 null/local로 명시한다. 이 파일 자체는 암호학적 증명이 아니므로 remote main SHA + 같은 SHA의 CI/Pages 성공 + 실제 공개 URL 응답을 함께 대조해야 한다.

이 커밋 작성 시점에는 원격 검수/병합/Pages 검증을 아직 실행할 수 없으므로 선완료로 기록하지 않는다. 실행 후 정확한 SHA·run 링크·새 공개 read 결과는 [Notion 종료 패키지](https://app.notion.com/p/3e6c9bbb7de58149a8e0cb23c9a367b2)에 기록한다. 옛 Pages 성공을 새 배포 성공으로 재사용하지 않는다.

## 미체크 항목과 해제 조건

| 항목 | 미체크 이유 | 필요한 증거·다음 행동 |
| --- | --- | --- |
| U3-3 | 9/25 정확한 검증 시각 원자료 없음. 계약·ID·커밋·날짜·CI는 연결됨 | 당시 로그/원본에서 확인된 시각과 출처 확보. 새 관찰 시각으로 추정 보완 금지 |
| 기존 검수 6: 문서/제출 폼 일치 | 저장소 문구는 대조했지만 실제 폼 입력값 미확인 | 담당자가 최종 입력·링크·보장 범위를 문서와 대조하고 검수 기록 남기기 |
| 기존 검수 8: 3분 리허설 | 자동 시나리오·타이머는 사람 발표 증거가 아님 | 실제 발표·시연의 시간, 누락/문제, 재시도 결과를 HUMAN_VALIDATION.md에 기록 |
| 기존 검수 9: 등록/팀/제출 | 실제 계정·팀 자격·연락처·접수 증거 미확인 | 실제 계정 증빙 확인, 지정 제출자가 최종 Submit 후 접수 화면/확인 메일 보존 |
| 별도 사람 검수 | 신규 사용자 3명 응답·30초 낭독·팀원 독립 재검수 없음 | 실제 수행자의 응답/버전/일시/결론 확보. 자동 테스트로 대체 금지 |

U4-3은 이전 F1 때문에 미체크였으며, 이번 실패 경계/복구 검증을 근거로 별도로 갱신한다. 기록 자체가 소실된 경우의 안전 차단과 결함에 의한 무안내 영구 잠금은 구분한다.

## 재현 및 되돌림

```sh
npm ci
npx playwright install chromium
npm run verify
BUILT_PREVIEW=1 npm run test:preview
docker compose -f devnet/compose.yml up -d --wait --wait-timeout 240
npm run test:local
DEMO_URL=https://haamseongho.github.io/midnight_contest/ npm run test:preview
```

실행·Lace 복구 안내: [RUN_AND_LACE_GUIDE.md](./RUN_AND_LACE_GUIDE.md). 회로/ABI/key/SDK 버전은 바꾸지 않았고 새 Preview 거래는 송신하지 않는다. 이전 [A–F 검수](./ENHANCEMENT_PROGRESS.md)와 [역사/신규 증거](./IMPLEMENTATION_EVIDENCE.md)는 이력으로 보존한다. 필요하면 해당 변경의 revert commit을 검토하고 다시 검증한다. force-push나 기존 데이터 삭제로 되돌리지 않는다.
