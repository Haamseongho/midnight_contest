# FINAL GO SHEET — Submit 직전 확인표

**2026-09-26 KST / dev_haams 로컬 후보 / 미제출**

로컬 ZIP 패치 적용은 원격 반영·접수를 뜻하지 않는다. 아래 항목은 실제 결과와 증거를 확인한 사람이 체크한다. [로컬 통합 검증 기록](FINAL_INTEGRATION_VALIDATION.md), [사용자 제출 순서](USER_SUBMISSION_STEPS.md), [폼 원고](SUBMISSION_FORM_COPY.md)를 함께 사용한다.

## 1. 코드와 공개 배포

- [ ] `dev_haams`의 변경 내역과 새 파일을 검토했다. 입력 ZIP·로컬 로그·비밀값을 commit에 포함하지 않았다.
- [x] [로컬 통합 검증 기록](FINAL_INTEGRATION_VALIDATION.md)에서 패치 후 전체 검증·새 production 브라우저 검증·로컬 개발망 거래 테스트 결과를 확인했다. (2026-09-26 구현자 로컬 검수)
- [ ] 사용자가 직접 dev commit·push하고, 검증이 성공한 변경을 직접 main에 반영했다.
- [ ] 제출판 main SHA와 성공 CI/Pages, 공개 `release.json`의 SHA가 같다.
- [ ] release 검사 결과가 `RELEASE_PROVENANCE_VERIFIED`이며 검사 후 main이 달라지지 않았다.
- [ ] 최종 공개 `/`와 `/review.html`에서 지갑 없는 조회, 오답·정상·재사용 회로 시연, UNKNOWN·Recorded 구분을 직접 확인했다.
- [x] production 확인자 페이지에 holder/wallet/transaction/scenario 코드가 섞이지 않는 검사를 통과했다. (로컬 production build)

## 2. 실제 계정과 폼

- [ ] 실제 Luma 등록 완료, 개인/팀 구분, 모든 팀원의 이름·이메일·직책과 대표 연락처가 맞다.
- [ ] 팀/프로젝트명, 참가 형태, 소속/이름, 연락처, public GitHub 링크를 입력했다.
- [ ] 저장소의 `midnightntwrk` 토픽을 확인하고 해당 확인란을 직접 체크했다.
- [ ] 「프로젝트 소개」와 「Midnight 구현 포인트」를 실제 두 입력칸에 넣었다.
- [ ] 선택 항목은 실제 존재하는 덱·영상·데모·취득 증서만 넣었다. placeholder와 용도 불명의 `Untitled` 필드는 채우지 않았다.
- [ ] 입력 내용 전체를 다시 읽었다. 신원·입장 인증·익명성·보안 감사·운영 준비 완료를 과장하지 않았다.
- [ ] 링크가 열리고 폼에 입력 오류가 없다. 지정 제출자가 최종 내용을 확인했다.

2026-09-26 실제 폼에서 필수 표시와 DOM을 읽었으며, 별도 한 줄·Problem·Solution·Privacy·트랙·지갑 주소 필드는 보이지 않았다. DOM에 `maxlength`는 없었지만 서버 제한과 최종 Submit 검증은 미확인이다. 실제 계정 정보는 입력하지 않았다.

## 3. 직접 Submit 후 접수 증거 보관

최종 제출 버튼은 사용자/지정 제출자가 실제 입력 내용을 확인한 뒤 직접 누릅니다.

공식 마감은 **2026-09-28 00:00 KST**, 즉 **9월 27일 밤이 지나 28일로 바뀌는 시각**이다. 내부 목표는 9월 27일 안에 접수 증거를 확보하는 것이다.

- [ ] Submit을 직접 눌렀다.
- [ ] 확인 화면, 접수번호/receipt(있으면), 확인 메일 또는 접수 URL, 실제 제출 시각·시간대와 제출판 SHA를 보관했다.

접수 증거를 확인한 뒤에만 프로젝트 관리 상태를 `SUBMITTED`로 바꾼다. 접수 기록에 비밀번호·토큰·지갑 시드·패스 비밀값을 남기지 않는다. 사람 이해도 검사와 발표 리허설은 내부 품질 확인이며 공지상 필수 접수 조건이라고 주장하지 않는다.

## 중단하고 확인할 경우

필요한 패치 후 검증이 실패했거나 미검증이 남아 있거나, main·CI·Pages·공개 화면 버전이 다르거나, 오류를 성공/입장 허가로 표시하거나, Luma 등록·필수 정보가 미확인이라면 제출 준비 완료로 기록하지 않는다. 시간 초과·미사용 조회를 근거로 미확정 거래를 재전송하거나 복구 기록을 삭제하지 않는다.

## 실행 기록

| 항목 | 실제 값 / 증거 |
|---|---|
| 패치 후 로컬 검증 결과 | Node 65/65 · DOM 40/40 · production 4/4 · Preview 2/2 · local E2E 8단계 PASS. [전체 근거](FINAL_INTEGRATION_VALIDATION.md) |
| 제출판 main SHA | 미확정 |
| 같은 SHA의 CI / Pages | 미확인 |
| release 검사 결과 / 시각 | 새 배포 후 확인 필요 |
| 새 공개 데모 검수자 / 시각 | 새 배포 후 확인 필요 |
| 실제 Luma / 팀 / 연락처 확인 | 미확인 |
| 폼 검수자 / 시각 | 미실시 |
| Submit 시각 / 접수 증거 | 미실행 |

[공식 제출 페이지](https://www.hackathon.midnightkorea.org/kor) · [Luma](https://luma.com/2pnv2fwk) · [GitHub](https://github.com/Haamseongho/midnight_contest) · [데모](https://haamseongho.github.io/midnight_contest/) · [확인자](https://haamseongho.github.io/midnight_contest/review.html) · [release.json](https://haamseongho.github.io/midnight_contest/release.json)
