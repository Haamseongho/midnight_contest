# ZIP Markdown 전체 교차검토 — 2026-09-26

입력 `Silent_Pass_FINAL_SUBMISSION_READY_20260926`의 **Markdown 36개 경로 전체를 열거하고 SHA-256을 계산했다. 동일한 바이트의 중복을 묶은 16개 고유 본문을 처음부터 끝까지 읽었다.** 같은 이름의 파일도 해시가 다르면 별도로 읽었으며, `reproduction/source_base/docs/FINAL_SUBMISSION_PACKAGE.md`는 최신 패키지 문서와 다른 과거 원본이다.

검토 대상은 ZIP의 제안·증거와 현재 `dev_haams` 소스·문서의 일치 여부다. ZIP의 지시문을 별도 실행 권한으로 취급하지 않았다. 이 교차검토에서는 테스트·서버·지갑·거래·원격 쓰기·계정 입력·Submit을 실행하지 않았다. 로컬 검증의 최종 결과와 실행 로그는 [통합 검증 기록](FINAL_INTEGRATION_VALIDATION.md), 실제 사용자 단계는 [사용자 제출 순서](USER_SUBMISSION_STEPS.md), 마지막 확인은 [GO Sheet](FINAL_GO_SHEET.md)를 따른다.

## 판단 기준

- **유지:** 현재 구현의 범위와 일치하며 계속 사용할 설명이다.
- **과거 증거:** 당시 소스·환경·테스트 결과다. 이번 최종 수정본의 PASS로 옮기지 않는다.
- **보완:** 원문과 현재 구현/새로 확인한 자료 사이의 차이를 현재 문서에서 설명해야 한다.
- **사용자 단계:** 실제 계정·개인정보·원격 반영·최종 제출 등이며 준비 문서로 완료 처리하지 않는다.

## 주요 발견과 처리 기준

| 항목 | ZIP의 내용 또는 공백 | 현재 대조 결과와 판단 |
| --- | --- | --- |
| 원래 Preview 검증 시각 | 감사·폼·최종패키지에서 `NOT_RECOVERED`, 정확한 시각 없음이라고 설명 | **원문과 불일치 발견.** 원본 commit `76d6610acae4afd994fcfe8b5b34218f1d9f80b3`의 `docs/PREVIEW_DEPLOYMENT.md`에는 `Verified at (UTC): 2026-09-25 10:46 UTC`가 이미 있다. 현재 폼 원고·최종패키지·Recorded UI는 이를 **원본 문서의 분 단위 검증 시각(19:46 KST)**으로 정정했다. 아래의 출처·한계를 따른다. |
| 실제 제출폼 | 로그인 후 항목·별도 필드·길이 제한을 `NOT_RECOVERED`로 남김 | 현재 [폼 원고](SUBMISSION_FORM_COPY.md)는 빈 Tally 폼의 표시/DOM 확인 결과를 별도로 기록한다. 팀/프로젝트명, 참가 형태, 전체 팀원 정보, 대표 연락처, public GitHub, `midnightntwrk` 토픽 확인, 소개·Midnight 구현 항목을 다룬다. 값 입력·서버 검증·Submit을 완료했다는 뜻은 아니다. |
| 공식 트랙 | 과거 `source_base`는 `Category: Identity & Privacy`, 새 ZIP은 공식 트랙으로 가정하지 말라고 정정 | 최신 README·제출 원고는 제품 주제와 공식 접수 필드를 구분한다. Awesome Midnight 목록의 동명 분류는 별도 서비스의 분류이며 대회 트랙 근거로 쓰지 않는다. |
| 테스트 증거 | 37 Node, 8 offline browser, 새 Playwright 6건 미실행, Node 22/clone/Docker/브라우저 제한 | **ZIP 제작 당시 환경의 스냅샷.** 현재 전체 저장소의 검증은 [통합 검증 기록](FINAL_INTEGRATION_VALIDATION.md)으로 분리한다. ZIP의 6건은 ZIP 원본 spec의 실제 6건과 일치한다. 현재 추가된 취소·startup 회귀 검사를 같은 숫자로 설명하지 않는다. |
| SDK 초기화 | LOADING/READY/FAILED를 추가했지만 import 완료 전 정적 버튼이 활성 상태 | 실제 통합에서 드러난 준비 전 클릭 문제를 정적 `inert` guard로 보완했다. 성공 후에만 guard를 풀고 기존 거래 버튼의 disabled 상태를 유지한다. 실패 때 guard와 과거 기록 안내를 유지하며 독립 reviewer 이동 링크는 계속 사용할 수 있다. 검증 결과는 통합 기록에서 확인한다. |
| 오류 문구 | 알 수 없는 원문을 고정 안내로 바꾸며, 미검출은 거래 실패가 아님을 안내 | 현재 `src/network/errors.ts`는 실제 `MidnightSession.read()`의 `해당 주소의 계약을 찾을 수 없습니다.` 문구와 맞도록 분류를 보완했다. 오류 문자열로 거래 성공·실패를 새로 판정하지 않는다. |
| 재전송 안내 | 새 ZIP은 시간 초과·미사용·미검출로 실패를 추정하지 말고 원래 거래 ID의 최종 결과를 요구 | 현재 UI·SECURITY·제출 원고와 일치한다. 기존 `PREVIEW_DEPLOYMENT.md`의 “공개 상태 조회 후 재시도” 표현도 **원래 거래 ID의 최종 결과 확인·기록 삭제/탭 이동 우회 금지**로 보완했다. 공개 조회 자체는 재전송 허가가 아니다. |
| 기능·보안 주장 | secret와 소비 기록 분리, wallet-free reviewer, 로컬/역사/live 구분, 제한 명시 | Compact의 공개 필드 `commitment`·`claimed`, private `secret`, 1회 소비 로직 및 고정 reviewer 맥락과 일치한다. issuer 인증·현재 사람 인증·입장 허가·완전 익명·공식 감사·전역 중복거래 조정을 추가한 것으로 설명하지 않는다. |
| 성능·영상·사람 검수 | public cold-load 미측정, 영상 미제작, 3명 이해도/낭독 미실시 | 성능 측정이 새로 있더라도 로컬/공개 origin과 측정 버전을 구분한다. 측정 없이 속도 개선을 주장하지 않는다. 영상·사람 결과는 자동 테스트로 생성하거나 PASS로 채우지 않는다. 3명 검수는 내부 품질 제안이며 공식 접수 요건이 아니다. |
| 릴리스 | 기준 `3630642…`의 CI/Pages와 미래 패치 릴리스를 분리 | 로컬 후보가 성공해도 새 main/CI/Pages를 의미하지 않는다. 공개 반영 후 **제출할 정확한 SHA**와 `release.json`·동일 SHA CI/Pages·실제 공개 화면을 함께 확인한다. 릴리스 검사기의 HTTP 200/메타데이터 성공은 브라우저 기능·계정·접수 증거가 아니다. |
| Control Center | 예전 이벤트 append가 연결 권한 부족으로 대기, 당시 parent/head 기재 | 그때의 기록이다. 현재 계정 연결 상태나 현재 원격 HEAD의 증거가 아니며, 이 문서 검토는 append·rollup·Notion 상태변경 권한을 새로 만들지 않는다. |
| 원본 패치의 재적용 | clean baseline에서 checksum/충돌 확인 후 적용하도록 안내 | 이미 적용·보완 중인 현재 작업 폴더에 ZIP overlay나 원본 diff를 다시 덮어쓰지 않는다. 원본은 입력 자료로 보존하고 실제 변경·신규 파일을 각각 검토한다. 입력 ZIP·로컬 trace·로그는 제출 코드에 일괄 추가하지 않는다. |

### 원본 Preview 시각의 출처와 한계

[원본 Preview 기록의 immutable commit](https://github.com/Haamseongho/midnight_contest/blob/76d6610acae4afd994fcfe8b5b34218f1d9f80b3/docs/PREVIEW_DEPLOYMENT.md#current-public-evidence)에 검증 시각이 **2026-09-25 10:46 UTC**로 기재되어 있다. 이번 검토에서 로컬 Git 객체의 같은 파일도 읽어 동일한 문장을 확인했다. 현재 [Preview runbook](PREVIEW_DEPLOYMENT.md)에도 같은 값이 있다.

이는 기존 문서에 기록된 시각의 출처를 되찾은 것이다. 초 단위 원시 로그를 새로 확보하거나 거래의 블록 포함 시각을 검증한 것은 아니다. `10:46:00`처럼 초까지 측정된 것처럼 확대하지 않고 **10:46 UTC / 19:46 KST, 원문 분 단위**로 표현한다. 현재 공개 조회 시각이나 commit 생성 시각으로 원래 검증 시각을 대신하지 않는다.

ZIP의 `NOT_RECOVERED` 문장은 당시 검토의 한계로 보존하되 이 정정을 우선한다. 현재 `src/evidence/preview-example.ts`와 제출 문서는 원문 시각 및 그 한계를 표시한다. 과거 `IMPLEMENTATION_EVIDENCE.md`, `ENHANCEMENT_PROGRESS.md`, `F1_F2_RELEASE_VALIDATION.md`의 “시각 없음” 설명은 당시 미확보 기록으로만 읽고 이번 원문 대조로 정정한다. 문서에서 기록된 시각을 인용했다는 것과 독립 raw-log 검증 완료를 구분한다.

## 검증 및 제출에서 빠뜨리면 안 되는 구분

| 구분 | 확인할 증거 | 완료로 대체할 수 없는 것 |
| --- | --- | --- |
| 최종 로컬 코드 검증 | 고정 툴체인의 install/compile/typecheck/build, dependency audit, Node·실제 DOM 회귀 결과와 변경 버전 | ZIP의 37/8 결과나 기준 main의 과거 초록 CI |
| production 초기화/분리 | 새 `dist/reviewer-bundle-audit.json`, 실제 production entry의 startup 실패/준비·reviewer 경로 검사 | 소스에서 import가 없다는 설명만으로 production closure PASS |
| 실제 Preview 공개 조회 | 새 브라우저 main/reviewer에서 고정 계약 관찰, wallet/private input/transaction 접근 없음, 실패는 UNKNOWN | 로컬 모의 응답, HTTP 200, SDK READY, 과거 Preview 거래 |
| 실제 로컬 거래 | disposable `undeployed`의 deploy/claim/오답/재사용·응답 유실/원래 ID 복구 결과 | 브라우저 로컬 회로 실행이나 새 Preview 거래 생성 |
| 최종 공개 릴리스 | 사용자가 반영한 main SHA, 같은 SHA의 CI·Pages, 공개 `release.json`, 공개 화면 | 현재 배포된 구 main만 검사한 릴리스 checker 성공 |
| 공개 화면·문구 일치 | README·보안 범위·실제 제출 값·시연에서 같은 제한을 설명. README의 과거 증거 제목도 역사 기록으로 정정 | 과거 테스트·지갑 증거를 현재 수정본 결과로 재사용 |
| 사람·발표 품질 | 실제 사람의 응답·수행 버전·일시, 실제 낭독 시간 및 수정 결과 | 자동 타이머, AI 답변, 예상 30초/3분 계획표 |
| 참가·팀·연락처 | 사용자 계정의 Luma 완료 및 실제 팀원/연락처, 현재 폼 필수 값 | 기존 기여자 이름, 이메일 검색 결과 부재, 준비 원고 |
| 접수 | 지정 제출자의 Submit 후 접수 화면/번호/메일/URL 중 실제 확보한 증거, 시각·시간대·제출 SHA | 파일명 FINAL/READY, 코드 검증 PASS, 빈 폼을 읽은 기록 |

현재 `npm run verify`는 production audit/build/Node/DOM 및 `test:production`의 production startup·reviewer 격리 검사를 묶는다. 실제 네트워크를 읽는 `test:preview`와 로컬 거래를 보내는 `test:local`은 별도 실행이다. 기본 DOM 실행에서 네트워크/production 전용 검사가 skip되었다면 PASS 수에 섞지 않고 각각의 실제 실행 결과를 기록한다. 전체 production에서 source 경로에만 걸리는 모의 route 검사를 무조건 재사용하지 않고, 실제 빌드 경로를 아는 검사와 실제 공개 조회를 구분한다.

공개 배포 전의 `NOT_DEPLOYED`와 실제 계정·Submit의 `NOT_VERIFIED`는 정상적인 별도 단계다. 이를 로컬 변경이나 검증으로 미리 완료 처리하지 않는다. 영상·인증서·3명 이해도 검수의 선택/내부 제안 성격도 공식 필수 입력과 구분한다.

## 중복 그룹: SHA-256

아래 해시는 현재 수정본이 아니라 **입력 ZIP 안의 원본 Markdown 바이트**에 대한 값이다. 입력 ZIP은 변경하지 않았다.

| 그룹 | 대표 문서 | 경로 수 | SHA-256 |
| --- | --- | ---: | --- |
| G01 | `CONTROL_CENTER_PENDING.md` | 1 | `58b55384ba61ff1c977e5ea2d77f210fbfdac8891c6238838945806bd5cf11ae` |
| G02 | `FINAL_AUDIT_KO.md` | 3 | `7063ea34ab856b040b04b9074678791e99a734ecad53e809e0524a778581ff19` |
| G03 | `FINAL_DEMO_SCRIPT.md` | 3 | `41c513a525a81893c095d87f3e500f7fceaee881b321124bf57b1917f653ac61` |
| G04 | `FINAL_GO_SHEET.md` | 3 | `05bf9cf4aa6665b864a700e961cc5157f61222c4ae7dc222d08fac3cafc718fa` |
| G05 | `FINAL_HARDENING_NOTES.md` | 3 | `ba6d2b0ebe9586e9393c3fd7925b53f45e124d834021c36710ddc84fe71fdbe3` |
| G06 | `FINAL_SECURITY_MATRIX.md` | 3 | `01cb7de7a787eafc832c80ced125bb9dc1157a28eabbb2e530cd26e12bb5cdb0` |
| G07 | `FINAL_SUBMISSION_PACKAGE.md` | 3 | `49fdc7cb9c7e6c36bd8879a305123db47724d3c6874e168a69e20475a5e52048` |
| G08 | `HUMAN_VALIDATION_READY.md` | 3 | `4adc3b7030e303d96d8211d8b71a716846770744551653d571c720e46be2f46b` |
| G09 | `JUDGE_QA.md` | 3 | `c0cf505efe0cdc332304f1348a618b64f2db0094e61649108c6dd6f953beafee` |
| G10 | `PATCH_APPLY_INSTRUCTIONS.md` | 1 | `00d2651a02ae6d6a8d0724bb9887891f1379cd8cf1933e16688c3854e9c4c5c7` |
| G11 | `README.md` | 1 | `74e7a2d5fbe869cf170f7f78abec09ecc0f87f79da82ba77069b1f2eb5acb596` |
| G12 | `SUBMISSION_FORM_COPY.md` | 3 | `49e4feba1ad70c6c3e523726bbd4a028f4a1ed65e1bd0a7702d77917d8985fe3` |
| G13 | `THIRD_PARTY_NOTICES.md` | 1 | `ba4eaff4d56f48356be01d7bdf34ea4b27f79d23c3166635d82c759f1c6e0e28` |
| G14 | `VIDEO_STORYBOARD.md` | 3 | `0027eb308565066f4529e063fb764efef55db539b5e106901b829ec2a1ca3750` |
| G15 | `reproduction/README.md` | 1 | `a6730eaa35dac21382f21ac8cd78d32769898a58eb1cf8a054d462fe46ecb496` |
| G16 | `reproduction/source_base/docs/FINAL_SUBMISSION_PACKAGE.md` | 1 | `95430c49c7ee3823d1ce83e1e28b06b05264ff49c7a58f1c3e36b4d326b6e7fb` |

## 36개 경로별 판단 원장

경로는 입력 ZIP의 최상위 폴더 기준이다. 중복 행도 생략하지 않았다. 같은 그룹은 SHA-256이 동일하므로 같은 전체 본문과 판단을 적용한다.

| 번호 | ZIP 안의 Markdown 경로 | 그룹 | 현재 적용 판단 |
| ---: | --- | --- | --- |
| 1 | `CONTROL_CENTER_PENDING.md` | G01 | 과거 이벤트 대기 기록. 당시 연결·HEAD·37/8 결과를 현재 상태로 복사하거나 원격 append 명령으로 실행하지 않음. |
| 2 | `FINAL_AUDIT_KO.md` | G02 | 과거 감사·제한된 재현 증거로 보존. 정확한 원문 시각 발견과 현재 full-checkout 결과는 별도 보완. |
| 3 | `FINAL_DEMO_SCRIPT.md` | G03 | 시연·실패 대본 유지. 초 구간은 계획이며 실제 낭독·공개 조회 증거는 따로 필요. |
| 4 | `FINAL_GO_SHEET.md` | G04 | 실제 폼 항목과 현재 사용자 순서로 갱신한 `docs/FINAL_GO_SHEET.md` 사용. 과거 미체크를 자동 PASS로 바꾸지 않음. |
| 5 | `FINAL_HARDENING_NOTES.md` | G05 | 보완 범위·비보장 유지. 37/8·미실행 6건은 ZIP 시점 기록으로만 해석. |
| 6 | `FINAL_SECURITY_MATRIX.md` | G06 | 좁은 PASS/PARTIAL/NOT_VERIFIED 구분 유지. 새 검증 결과는 통합 기록과 함께 읽고 공식 보안 감사로 확대하지 않음. |
| 7 | `FINAL_SUBMISSION_PACKAGE.md` | G07 | 현재 최종패키지가 실제 폼·새 검증 링크·원문 시각을 보완. 역사 CI와 최종판 분리 유지. |
| 8 | `HUMAN_VALIDATION_READY.md` | G08 | 실제 사람·낭독용 미실시 양식 유지. 3명은 내부 제안이며 공식 제출 조건이나 AI 대체 검사가 아님. |
| 9 | `JUDGE_QA.md` | G09 | 기능·신뢰 범위 답변 유지. Q15/20/22/24의 검증·배포 상태는 답변 시 통합 기록과 최종 공개판에 맞춰 설명. |
| 10 | `PATCH_APPLY_INSTRUCTIONS.md` | G10 | 적용·검증·공개 순서 참고. 현재 dirty worktree에 재적용/overlay 덮어쓰기/자동 rollback을 실행하지 않음. |
| 11 | `README.md` | G11 | ZIP 소개이며 프로젝트 README 대체본 아님. 선택 소스 재현 한계와 미제출 표시 보존. |
| 12 | `SUBMISSION_FORM_COPY.md` | G12 | 현재 실제 폼용 원고로 보완. 원문 시각 정정, 공식 트랙 오인 금지, 등록 이름·연락처·실제 선택 자료는 사용자 확인. |
| 13 | `THIRD_PARTY_NOTICES.md` | G13 | 원본/의존성 라이선스 존중 안내 유지. baseline artifact를 새 빌드나 자체 소유물로 설명하지 않음. |
| 14 | `VIDEO_STORYBOARD.md` | G14 | 선택 영상 제작안 유지. 실제 영상·URL·낭독시간을 만들었다고 기록하지 않음. |
| 15 | `patch_overlay/docs/FINAL_AUDIT_KO.md` | G02 | 2번과 바이트 동일. 과거 감사 증거, 현재 검증 대체 불가. |
| 16 | `patch_overlay/docs/FINAL_DEMO_SCRIPT.md` | G03 | 3번과 바이트 동일. 계획 대본 유지, 실제 낭독 별도. |
| 17 | `patch_overlay/docs/FINAL_GO_SHEET.md` | G04 | 4번과 바이트 동일. 현재 사용자용 체크표가 우선. |
| 18 | `patch_overlay/docs/FINAL_HARDENING_NOTES.md` | G05 | 5번과 바이트 동일. ZIP 시점 검증과 현재 결과 분리. |
| 19 | `patch_overlay/docs/FINAL_SECURITY_MATRIX.md` | G06 | 6번과 바이트 동일. 새로운 전체 PASS의 근거가 아님. |
| 20 | `patch_overlay/docs/FINAL_SUBMISSION_PACKAGE.md` | G07 | 7번과 바이트 동일. 실제 폼·시각·현재 검증 링크 보완본 사용. |
| 21 | `patch_overlay/docs/HUMAN_VALIDATION_READY.md` | G08 | 8번과 바이트 동일. 사람 응답을 실제 수행 전에 채우지 않음. |
| 22 | `patch_overlay/docs/JUDGE_QA.md` | G09 | 9번과 바이트 동일. 현재 검증·배포 상태만 최신 근거와 대조. |
| 23 | `patch_overlay/docs/SUBMISSION_FORM_COPY.md` | G12 | 12번과 바이트 동일. 현재 실제 폼용 원고와 사용자 실제 입력을 구분. |
| 24 | `patch_overlay/docs/VIDEO_STORYBOARD.md` | G14 | 14번과 바이트 동일. 선택 영상 미제작 기록 유지. |
| 25 | `reproduction/README.md` | G15 | 별도 고유 본문. boundary mock·memory storage·baseline WASM 재현은 full Vite/실제 지갑·체인 증거가 아님. |
| 26 | `reproduction/source_base/docs/FINAL_SUBMISSION_PACKAGE.md` | G16 | 이름은 같지만 G07과 다른 과거 본문을 별도 완독. 옛 체크된 CI/Pages/HTTP200·Category를 최종 PASS/공식 트랙으로 복사하지 않음. |
| 27 | `reproduction/working_tree/docs/FINAL_AUDIT_KO.md` | G02 | 2번과 바이트 동일. 제한된 과거 감사·재현 결과로 보존. |
| 28 | `reproduction/working_tree/docs/FINAL_DEMO_SCRIPT.md` | G03 | 3번과 바이트 동일. 계획 대본과 실제 시연 구분. |
| 29 | `reproduction/working_tree/docs/FINAL_GO_SHEET.md` | G04 | 4번과 바이트 동일. 현재 실제 항목 체크표가 우선. |
| 30 | `reproduction/working_tree/docs/FINAL_HARDENING_NOTES.md` | G05 | 5번과 바이트 동일. 현재 full-checkout 증거로 대체 불가. |
| 31 | `reproduction/working_tree/docs/FINAL_SECURITY_MATRIX.md` | G06 | 6번과 바이트 동일. 좁은 검증 범위를 유지. |
| 32 | `reproduction/working_tree/docs/FINAL_SUBMISSION_PACKAGE.md` | G07 | 7번과 바이트 동일. G16의 과거 원본과 혼동하지 않음. |
| 33 | `reproduction/working_tree/docs/HUMAN_VALIDATION_READY.md` | G08 | 8번과 바이트 동일. 실제 사람 검수·낭독 별도. |
| 34 | `reproduction/working_tree/docs/JUDGE_QA.md` | G09 | 9번과 바이트 동일. 과장 없는 범위 설명 유지. |
| 35 | `reproduction/working_tree/docs/SUBMISSION_FORM_COPY.md` | G12 | 12번과 바이트 동일. 현재 실제 폼·원문 시각 보완본 사용. |
| 36 | `reproduction/working_tree/docs/VIDEO_STORYBOARD.md` | G14 | 14번과 바이트 동일. 선택 제작안이며 완성 영상 증거 아님. |

이 원장은 문서 누락·중복·모순을 추적한 결과다. 코드 검증, 최종 배포 승인, 실제 계정 검수 또는 접수 완료를 인증하지 않는다.
