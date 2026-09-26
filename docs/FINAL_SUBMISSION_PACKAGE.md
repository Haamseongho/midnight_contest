# Midnight Korea Hackathon 최종 제출 패키지

문구 갱신일: 2026-09-26 (KST). 제출 계정 요건은 별도 확인 필요.

이 문서는 제출 사이트에 그대로 옮길 수 있는 프로젝트 정보와 제출 직전
검증 항목을 모은 것입니다. 실제 최종 제출 버튼은 프로젝트 소유자가
Hackathon Program Page에서 직접 누릅니다.

## 제출용 프로젝트 정보

- **Project name:** Silent Pass
- **One-line description:** 초대의 비밀은 공개하지 않고, 그 초대가 한 번 사용됐는지는 함께 확인합니다.
- **English description:** A one-time access-pass DApp that proves knowledge of
  a private secret while publishing only its commitment and claimed status on
  Midnight Network.
- **Scope:** 소지자는 자기 환경에서 claim을 만들고, 확인자는 앱이 고정한 계약의 공개 소비 기록을 지갑 없이 조회합니다. 발급자 인증·현재 방문자 확인·입장 허가를 자동 제공하지 않습니다.
- **Public repository:** <https://github.com/Haamseongho/midnight_contest>
- **Public demo:** <https://haamseongho.github.io/midnight_contest/>
- **Reviewer-only demo:** <https://haamseongho.github.io/midnight_contest/review.html>
- **Current implementation branch:** `dev_haams` (main은 과거 기준; 자동 병합하지 않음)
- **Category:** Identity & Privacy
- **License:** Apache-2.0
- **Run guide:**
  <https://github.com/Haamseongho/midnight_contest/blob/dev_haams/docs/RUN_AND_LACE_GUIDE.md>
- **Demo script:**
  <https://github.com/Haamseongho/midnight_contest/blob/dev_haams/docs/DEMO_SCRIPT.md>
- **Security model:**
  <https://github.com/Haamseongho/midnight_contest/blob/dev_haams/SECURITY.md>
- **Preview contract:**
  `66e374b0cafdf387576cf29bcd5de16fb010f0e92ea10d6e6f1e2d6c4b99256c`
- **Preview deploy transaction:**
  `0009965462a734559665acff00e767c2de22a4f18ce689c7045f94e4ce9b356c2e`
- **Preview claim transaction:**
  `0032856554b96a452286646176f4a0e689808d22615069eb9a498973493cee35dc`

## How Midnight is used

Silent Pass stores a commitment and a `claimed` Boolean in the public Compact
contract state. The 32-byte pass secret remains a private circuit input. The
`claim` circuit proves that the submitted secret matches the commitment and
rejects a second use after `claimed` becomes `true`. Midnight.js connects
contract deployment, proof generation, wallet balancing, transaction
submission, and indexer reads. The wallet signs these contract operations and
pays the network fee; Silent Pass does not hold or transfer user funds.

## 실행 또는 데모 흐름

새 A–F 고도화 및 Notion U3 검수는 [ENHANCEMENT_PROGRESS.md](./ENHANCEMENT_PROGRESS.md)를 기준으로 한다. 공개 관찰 JSON은 서명되지 않은 기록이며 현재 상태·공증·입장권이 아니다. 신규 방문자 3명의 이해도와 실제 낭독은 [HUMAN_VALIDATION.md](./HUMAN_VALIDATION.md)에 실제 결과가 기록되기 전에는 미완료다. 비교·차별점은 [FEATURE_COMPARISON.md](./FEATURE_COMPARISON.md)에 출처와 함께 정리했다.

1. 저장소를 clone하고 `npm ci`, `npm run verify`를 실행한다.
2. `npm run dev`로 브라우저 데모를 연다.
3. 지갑 없는 공개 기록 조회를 실행하고 맥락 출처·조회 시각·‘사용 기록 있음’을 보여준다. 입장 승인으로 해석하지 않는다.
4. 독립 로컬 회로 시연으로 잘못된 비밀값 거절 → 올바른 값 성공 → 재사용 거절을 보여준다.
5. Recorded example을 열어 과거 Preview 증거와 이번 UI 검증이 다름을 설명한다.
6. 거래 증빙은 `npm run test:local`의 로컬 개발망 E2E 또는, 준비된 경우,
   Lace Preview 배포·claim 공개 기록으로 제시한다.

새 UI/U1~U4의 실행 결과는 [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)에서 확인한다. 아래 과거 체크는 2026-09-25 기준이며 dev_haams의 새 CI/Pages 결과를 대신하지 않는다. 제출 폼에 실제 반영됐는지는 계정에서 별도 확인해야 한다.

## 공식 제출 요건 대비

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| 프로젝트명 | 준비 완료 | `Silent Pass` |
| 한 줄 설명 | 준비 완료 | 위 제출용 정보 |
| 공개 GitHub + README | 준비 완료 | 공개 저장소와 Apache-2.0 라이선스 |
| 실행 방법/데모 흐름 | 준비 완료 | README, 실행 가이드, 데모 스크립트 |
| Midnight 활용 설명 | 준비 완료 | Compact 계약, Midnight.js, 위 설명 |
| 작동하는 DApp | 준비 완료 | public demo, CI, local-network E2E |
| 데모 영상 | 선택 항목·미제작 | 공식 공지상 선택 사항 |
| Luma 참가 등록 | 사용자 계정에서 확인 필요 | 저장소로 확인할 수 없음 |
| Midnight Academy 수료증 | 선택 항목·미확인 | 제출 시 가산점 자료 |
| 최종 Program Page 제출 | 미실행 | 사용자가 제출 직전 직접 실행 |

공식 Luma 공지는 제출 기한을 2026년 9월 27일로 안내하며, 최종 프로젝트는
[Hackathon Program Page](https://hackathon.midnightkorea.org/)에서 제출한다고
명시합니다. 프로그램 페이지에서 확인한 상세 마감은 2026년 9월 28일
00:00 KST이므로, 안전하게 9월 27일 안에 제출합니다.

## 제출 직전 10분 체크

- [x] GitHub `main`이 검증된 Preview 증빙 commit `76d6610`을 포함한다.
- [x] GitHub Actions의 `verify`와 `local-e2e`가 모두 성공했다 ([run 36126468920](https://github.com/Haamseongho/midnight_contest/actions/runs/36126468920)).
- [x] GitHub Pages가 같은 commit을 배포했다 ([run 36126468936](https://github.com/Haamseongho/midnight_contest/actions/runs/36126468936)).
- [x] public demo, `claim.prover`, `claim.bzkir`가 HTTP 200을 반환한다.
- [x] 공개 문서에는 계약 주소와 transaction ID만 기록했고 비밀번호, 복구 구문, 개인키, 지갑 주소, 패스 비밀값은 기록하지 않았다.
- [ ] 제출 페이지의 프로젝트명·설명·repo·demo 링크를 위 값과 대조한다.
- [ ] 선택 자료를 첨부하려면 데모 영상과 Academy 수료증만 추가한다.
- [ ] 제출 내용을 한 번 더 미리보기한 뒤 프로젝트 소유자가 최종 제출한다.

Preview 공개 거래는 해커톤의 필수 제출 조건이 아니며 Local Devnet도 공식
허용 환경입니다. 다만 Awesome Midnight dApps 품질 목표를 위해 Preview
계약 배포와 claim까지 2026년 9월 25일 검증했고, 공개 가능한 계약 주소와
transaction ID를 README와 readiness checklist에 기록했습니다. 지갑 주소와
패스 비밀값은 기록하지 않았습니다.
