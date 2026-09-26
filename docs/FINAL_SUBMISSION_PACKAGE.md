# Midnight Korea Hackathon — 최종 제출 준비 패키지

**현재 상태: ZIP 패치를 dev_haams에 적용한 로컬 후보. 새 commit·원격 반영·새 배포·실제 계정 정보 입력·최종 Submit은 사용자 단계입니다.** 패치 후 검증 결과는 [로컬 통합 검증 기록](FINAL_INTEGRATION_VALIDATION.md)을 확인합니다. 문서 작성이나 체크리스트 생성은 접수 증거가 아닙니다.
최종 제출 버튼은 사용자/지정 제출자가 실제 입력 내용을 확인한 뒤 직접 누릅니다.

## 1. 지금 사용할 문서

- [사용자가 직접 진행할 제출 순서](USER_SUBMISSION_STEPS.md)
- [실제 폼에 맞춘 복붙 원고](SUBMISSION_FORM_COPY.md)
- [최종 GO Sheet와 실행 기록](FINAL_GO_SHEET.md)
- [패치 후 로컬 통합 검증 기록](FINAL_INTEGRATION_VALIDATION.md)
- [최종 데모 대본](FINAL_DEMO_SCRIPT.md)
- [영상 스토리보드](VIDEO_STORYBOARD.md)
- [사람 이해도·리허설 표](HUMAN_VALIDATION_READY.md)
- [로컬 보완·재검증 경계](FINAL_HARDENING_NOTES.md)

## 2. 과거 기준과 새 제출판 구분

| 구분 | 상태 / 근거 |
|---|---|
| 패치 기준 main | `363064270e80d65834151ce07796616bf7680f01` |
| 기준 CI | [36223346869](https://github.com/Haamseongho/midnight_contest/actions/runs/36223346869) |
| 기준 Pages | [36223346867](https://github.com/Haamseongho/midnight_contest/actions/runs/36223346867) |
| 기준 배포 artifact | `sourceCommit=363064270e80d65834151ce07796616bf7680f01`, `sourceRef=refs/heads/main`, `workflowRun=36223346867` |
| 이번 로컬 수정 후보 | 오류 원문 비노출·취소 저장 실패 처리·SDK 준비/실패 안내·릴리스 검증·제출 자료. `dev_haams`에 적용, 아직 공개하지 않음 |
| 패치 후 로컬 검증 | [통합 검증 기록](FINAL_INTEGRATION_VALIDATION.md)의 실제 실행 결과 참조. 기준 CI나 ZIP 내 제한 검수 결과로 대체하지 않음 |
| 패치 반영 후 제출판 | 사용자의 main 반영 후 새 SHA·CI·Pages·release.json·공개 화면을 함께 확인해야 함 |

문서에 자신의 미래 commit SHA를 미리 넣지 않습니다. 최종 SHA는 배포 후 GitHub와 공개 `release.json`을 대조해 별도 검수 기록에 남깁니다. 검수 후 코드나 문서가 다시 바뀌면 새 최종판을 확인합니다. 기록만 보존하기 위해 이미 검증한 코드를 다시 변경할 필요는 없습니다.

ZIP의 최초 감사가 기록한 37개 Node·8개 제한 브라우저 검수는 원본 환경의 검수입니다. 전체 checkout의 새 build, 전체 브라우저 회귀, 실제 공개 origin, 로컬 개발망 거래 테스트 결과와 구분합니다.

## 3. 실제 결과를 확인한 뒤 체크

- [x] 패치 기준과 로컬 변경 내역을 검토했다.
- [x] 통합 검증 기록에서 패치 후 install/Compact compile/typecheck/build/tests/브라우저/로컬망 결과를 확인했다.
- [x] 새 production 확인자 코드 검사에 holder/wallet/transaction/scenario 경로가 없다.
- [ ] 사용자가 직접 dev commit·push하고 검증 성공 후 main에 반영했다.
- [ ] 현재 main과 같은 SHA의 CI verify/local-e2e 및 Pages build/deploy가 성공했다.
- [ ] `node scripts/verify-submission-release.mjs --out final-release-evidence.json`이 `RELEASE_PROVENANCE_VERIFIED`를 반환했다.
- [ ] 최종 공개 `/`와 `/review.html`에서 실제 조회·회로 시연·실패/기록 구분을 확인했다.
- [ ] 실제 폼·README·보안 문서·시연·원고의 보장 범위가 일치한다.
- [ ] 실제 Luma 신청 완료, 모든 팀원 정보와 대표 연락처를 확인했다.
- [ ] 사용자가 실제 필수 항목을 입력하고 전체 내용을 미리보기했다.
- [ ] 사용자가 직접 Submit한 뒤 접수 증거와 시각을 보관했다.

사람 3명 이해도 확인과 발표 리허설은 내부 품질 제안입니다. 실제 수행 여부는 [리허설 표](HUMAN_VALIDATION_READY.md)에 기록하며 공식 필수 접수 조건으로 설명하지 않습니다. 실제 등록·연락처 확인은 코드 검증과 병행할 수 있습니다.

## 4. 실제 폼 확인 결과

2026-09-26 KST [공식 페이지](https://www.hackathon.midnightkorea.org/kor)의 제출 링크에서 열린 [Tally 폼](https://tally.so/popup/Np20VW)을 입력 없이 확인했습니다.

필수 표시가 있는 항목은 팀/프로젝트명, 참가 형태, 소속/이름(모든 팀원의 이름·이메일·직책, Luma 정보 일치), 대표 연락처, public GitHub 링크, `midnightntwrk` 토픽 확인, 프로젝트 소개, Midnight 구현 포인트입니다. 덱·영상·데모 URL·Explorer/Scholar 증서는 선택 항목으로 표시됐습니다. 영상은 3분 이내 권장, 증서는 파일 10 MB 제한이 표시됐습니다.

별도 한 줄·Problem·Solution·Privacy·트랙·지갑 주소 입력칸은 보이지 않았습니다. 원고는 실제 소개/구현 두 칸으로 재배치했습니다. 용도 불명 `Untitled` 링크 필드는 채우지 않습니다. DOM에 `maxlength`는 없었으나 서버 길이 제한은 미확인입니다. 필수 여부는 화면/DOM 확인이며 최종 Submit 검증은 아닙니다. 값 입력·체크·첨부·Submit은 하지 않았습니다.

GitHub 공개 API로 저장소의 public 상태와 `midnightntwrk` 토픽을 확인했습니다. 실제 개인/팀 정보·Luma 등록 완료·대표 연락처는 사용자가 직접 확인해야 합니다.

## 5. 과거 Preview 증거 보존

2026-09-25의 contract/deploy/claim과 원본 commit은 [폼 원고의 과거 Preview 기록](SUBMISSION_FORM_COPY.md)에 있습니다. 원 증거 commit은 `76d6610acae4afd994fcfe8b5b34218f1d9f80b3`입니다. 기존 CI `36126468920` / Pages `36126468936`은 그 당시 증거이며 새 릴리스 검증 성공의 근거로 사용하지 않습니다.

[원본 Preview 문서](https://github.com/Haamseongho/midnight_contest/blob/76d6610acae4afd994fcfe8b5b34218f1d9f80b3/docs/PREVIEW_DEPLOYMENT.md)의 `Verified at (UTC)`에는 **2026-09-25 10:46 UTC (19:46 KST)**가 기록되어 있습니다. ZIP의 `NOT_RECOVERED` 표기를 원본 확인 결과에 따라 정정했습니다. 이는 문서에 기록된 검증 시각이며 거래 포함 시각이나 원시 로그의 새 독립 검증을 뜻하지 않습니다.

## 6. 공식 안내와 제출 기한

공식 작품 마감: **2026-09-28 00:00 KST**입니다. 9월 28일 낮이나 밤이 아니라 **9월 27일 밤이 지나 날짜가 바뀌는 시각**입니다. 내부 목표는 9월 27일 안에 접수 증거를 확보하는 것입니다.

2026-09-26 공식 공개 안내에서 개인 또는 최대 4명 팀, Local Devnet/Preview/Preprod 허용, 영상 선택, Explorer/Scholar 증서 안내와 트랙 구분 없음을 확인했습니다. [Luma](https://luma.com/2pnv2fwk)의 실제 등록 완료 여부와 별도 등록 종료시각은 미확인입니다.

Preview 공개 거래는 해커톤의 필수 제출 조건이 아니며 Local Devnet도 공식 허용 환경입니다.

## 7. 미확정 거래 처리

시간 초과는 취소가 아닙니다. 공개 상태의 미사용·미검출만으로 이전 거래 실패를 확정하지 않습니다. 원래 거래 ID의 최종 결과를 확인하고 결과 불명은 UNKNOWN으로 유지합니다. BLOCKED에서 저장소 삭제나 새 탭을 우회 재전송 수단으로 사용하지 않습니다.
