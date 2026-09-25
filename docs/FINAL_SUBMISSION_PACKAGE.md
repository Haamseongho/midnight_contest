# Midnight Korea Hackathon 최종 제출 패키지

최종 확인일: 2026-09-25 (KST)

이 문서는 제출 사이트에 그대로 옮길 수 있는 프로젝트 정보와 제출 직전
검증 항목을 모은 것입니다. 실제 최종 제출 버튼은 프로젝트 소유자가
Hackathon Program Page에서 직접 누릅니다.

## 제출용 프로젝트 정보

- **Project name:** Silent Pass
- **One-line description:** 비밀값을 공개하지 않고 일회용 행사 입장 자격을
  증명하는 Midnight DApp.
- **English description:** A one-time access-pass DApp that proves knowledge of
  a private secret while publishing only its commitment and claimed status on
  Midnight Network.
- **Public repository:** <https://github.com/Haamseongho/midnight_contest>
- **Public demo:** <https://haamseongho.github.io/midnight_contest/>
- **Category:** Identity & Privacy
- **License:** Apache-2.0
- **Run guide:**
  <https://github.com/Haamseongho/midnight_contest/blob/main/docs/RUN_AND_LACE_GUIDE.md>
- **Demo script:**
  <https://github.com/Haamseongho/midnight_contest/blob/main/docs/DEMO_SCRIPT.md>
- **Security model:**
  <https://github.com/Haamseongho/midnight_contest/blob/main/SECURITY.md>

## How Midnight is used

Silent Pass stores a commitment and a `claimed` Boolean in the public Compact
contract state. The 32-byte pass secret remains a private circuit input. The
`claim` circuit proves that the submitted secret matches the commitment and
rejects a second use after `claimed` becomes `true`. Midnight.js connects
contract deployment, proof generation, wallet balancing, transaction
submission, and indexer reads. The wallet signs these contract operations and
pays the network fee; Silent Pass does not hold or transfer user funds.

## 실행 또는 데모 흐름

1. 저장소를 clone하고 `npm ci`, `npm run verify`를 실행한다.
2. `npm run dev`로 브라우저 데모를 연다.
3. 새 패스를 생성하고 공개 상태에 커밋먼트만 남는 것을 보여준다.
4. 잘못된 비밀값이 거절되는 것을 보여준다.
5. 정확한 비밀값이 한 번만 성공하고 replay가 거절되는 것을 보여준다.
6. 거래 증빙은 `npm run test:local`의 로컬 개발망 E2E 또는, 준비된 경우,
   Lace Preview 배포·claim 공개 기록으로 제시한다.

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

- [ ] GitHub `main`이 로컬 HEAD와 일치한다.
- [ ] 최신 GitHub Actions의 `verify`와 `local-e2e`가 모두 성공했다.
- [ ] GitHub Pages가 같은 commit을 배포했다.
- [ ] public demo, `claim.prover`, `claim.bzkir`가 HTTP 200을 반환한다.
- [ ] 저장소에 비밀번호, 복구 구문, 개인키, 지갑 주소, 패스 비밀값이 없다.
- [ ] 제출 페이지의 프로젝트명·설명·repo·demo 링크를 위 값과 대조한다.
- [ ] 선택 자료를 첨부하려면 데모 영상과 Academy 수료증만 추가한다.
- [ ] 제출 내용을 한 번 더 미리보기한 뒤 프로젝트 소유자가 최종 제출한다.

Preview 공개 거래는 해커톤의 필수 제출 조건이 아니며 Local Devnet도 공식
허용 환경입니다. 다만 Awesome Midnight dApps 품질 목표를 위해 Preview
계약 주소와 transaction ID를 확보하면 README와 readiness checklist에
추가합니다.
