# Silent Pass — 사용자가 직접 진행할 제출 순서

**2026-09-26 KST 기준. 현재 dev_haams에 ZIP 패치를 로컬 적용한 상태이며, 이 문서는 commit·push·main 반영·폼 제출을 실행하지 않습니다.** 원격 반영과 최종 Submit은 사용자/지정 제출자가 직접 진행합니다.

공식 마감은 **9월 28일 00:00 KST**, 즉 **9월 27일 밤이 끝나는 시각**입니다. 먼저 실제 Luma 등록과 팀 연락처를 확인해 두고, 아래 순서대로 진행하세요.

## 1. 현재 변경을 확인하세요

Codex 또는 GitHub Desktop에서 현재 브랜치가 `dev_haams`인지 확인하고, 변경된 파일과 새 파일을 읽어보세요. 기준 main은 `363064270e80d65834151ce07796616bf7680f01`입니다. 터미널에서 확인하려면:

```sh
git branch --show-current
git status --short
git diff --check
git diff --stat
git diff
```

`git diff`에는 아직 Git이 추적하지 않는 새 파일의 본문이 나오지 않으므로 새 파일도 열어 확인하세요. [로컬 통합 검증 기록](FINAL_INTEGRATION_VALIDATION.md)에서 패치 후 실제 결과와 미확인 범위를 읽고 [GO Sheet](FINAL_GO_SHEET.md)에 기록하세요.

## 2. 필요한 파일만 골라 직접 commit·push하세요

변경 목록에서 이번 소스·테스트·스크립트·문서 파일을 선택하세요. 저장소 폴더의 입력 ZIP, 개인 계정 정보, 비밀값, 로컬 로그·브라우저 기록은 선택하지 마세요. **`git add .`나 전체 파일 일괄 선택을 사용하지 마세요.** 입력 ZIP까지 함께 올릴 수 있습니다.

터미널을 사용한다면 기존 추적 파일은 `git add -p`로 변경 부분을 검토하며 선택하고, 새 파일은 실제 경로를 하나씩 지정해 추가하세요. 예를 들어 `git add -- docs/USER_SUBMISSION_STEPS.md`는 이 새 문서 하나만 선택합니다. 다른 새 소스·테스트·문서도 빠짐없이 직접 확인해 선택해야 합니다.

선택한 내용은 다음 명령으로 다시 확인할 수 있습니다.

```sh
git diff --cached --stat
git diff --cached
```

확인이 끝나면 사용자가 직접 commit을 만들고 `dev_haams`를 원격 저장소에 push하세요. ZIP 패키지가 만든 로컬 변경만으로는 새 commit이나 새 공개 배포가 생기지 않습니다.

## 3. 검증 성공을 확인하고 main에 반영하세요

이번 변경이 들어간 버전에서 전체 검증, 새 production 화면 검증과 로컬 개발망 거래 테스트가 성공해야 합니다. [통합 검증 기록](FINAL_INTEGRATION_VALIDATION.md)에 완료된 검증은 그 실제 결과를 사용하세요. commit 이후 파일을 다시 수정했다면 영향을 받는 검증을 다시 진행하세요. 필요한 실행 명령과 환경은 [실행 안내](RUN_AND_LACE_GUIDE.md)와 [보완·재검증 기록](FINAL_HARDENING_NOTES.md)을 참고하세요.

검증 결과가 준비되면 사용자가 직접 `dev_haams`의 변경을 `main`에 병합하고 원격 main에 반영하세요. GitHub의 Pull Request로 직접 검토·병합하거나, 익숙한 도구에서 직접 병합·push할 수 있습니다. 다른 사람의 새 변경이나 충돌이 있으면 해당 내용을 먼저 확인하고, 검증한 버전이 바뀌면 다시 검증하세요. force push는 필요하지 않습니다.

main에 반영한 **새 commit의 GitHub Actions CI와 Pages 작업이 모두 성공했는지** 확인하세요. 예전 기준 main의 초록색 결과는 이번 변경의 결과가 아닙니다.

## 4. 새 배포와 실제 공개 화면을 확인하세요

새 main SHA, CI, Pages와 [공개 release.json](https://haamseongho.github.io/midnight_contest/release.json)이 같은 버전인지 확인하세요. 배포 완료 후 다음 읽기 전용 검사를 사용할 수 있습니다.

```sh
node scripts/verify-submission-release.mjs --out final-release-evidence.json
DEMO_URL=https://haamseongho.github.io/midnight_contest/ npm run test:preview
```

위 환경변수 표기는 Mac/Linux 기준입니다. 첫 명령의 성공 결과는 `RELEASE_PROVENANCE_VERIFIED`입니다. 결과 파일은 실제 확인 시점의 기록이며 제출 폼 첨부물로 요구된 것은 아닙니다. 공개 조회 검사는 새 Preview 거래를 보내는 절차가 아닙니다.

그다음 새 브라우저에서 [데모](https://haamseongho.github.io/midnight_contest/)와 [확인자 페이지](https://haamseongho.github.io/midnight_contest/review.html)를 직접 열어 다음을 보세요.

- 확인자 페이지에서 지갑 없이 고정된 계약을 조회할 수 있는지.
- 전체 데모의 잘못된 비밀값 → 정상 사용 → 재사용 거절 회로 시연이 동작하는지.
- 조회 실패는 UNKNOWN이며 과거 거래는 Recorded로 구분되는지.
- 준비 중·실패 안내가 실제 조회 성공이나 입장 허가로 보이지 않는지.

새 공개 화면 검수와 링크를 [GO Sheet](FINAL_GO_SHEET.md)에 기록하세요. 사람 이해도 확인과 발표 리허설은 [리허설 표](HUMAN_VALIDATION_READY.md)에 별도로 기록할 수 있습니다.

## 5. 실제 계정 정보와 폼을 채우고 다시 읽으세요

[공식 페이지](https://www.hackathon.midnightkorea.org/kor)에서 **프로젝트 제출하기**를 여세요. [폼 원고](SUBMISSION_FORM_COPY.md)의 실제 항목 표를 보며 입력하세요.

필수 입력은 팀/프로젝트명, 참가 형태, 모든 팀원의 소속/이름·이메일·직책, 대표 연락처, public GitHub 링크, `midnightntwrk` 토픽 확인, 프로젝트 소개, Midnight 구현 포인트입니다. 팀원 정보는 실제 Luma 등록정보와 맞아야 합니다. 프로젝트 이름이 등록 팀명이라고 가정하지 마세요.

프로젝트 소개와 Midnight 구현 포인트에는 원고의 해당 본문을 복사하세요. 별도 한 줄·Problem·Solution·Privacy·트랙 입력칸은 확인되지 않았습니다. 덱·영상·데모 URL·증서는 선택이며 실제 자료가 있을 때만 넣으세요. 이름 없는 `Untitled` 링크 필드는 용도가 확인되지 않아 채우지 않습니다. 지갑 주소 입력칸도 확인되지 않았습니다.

2026-09-26 확인은 빈 폼의 표시/DOM을 읽은 것이며 최종 Submit 검증은 하지 않았습니다. 실제 폼이 바뀌었거나 입력 오류를 표시하면 현재 안내를 확인하세요. 제출 전 전체 입력을 다시 읽고 임시 문구·예시 이메일·틀린 링크가 없는지 확인하세요. 별도 미리보기 버튼이 없으면 Submit을 누르기 전에 각 입력칸을 직접 검토하면 됩니다.

## 6. 직접 Submit하고 접수 증거를 보관하세요

[GO Sheet](FINAL_GO_SHEET.md)의 필수 확인을 마친 뒤 사용자/지정 제출자가 직접 Submit을 누르세요. 접수 확인 화면, 접수번호/receipt(있으면), 확인 메일 또는 접수 URL, 제출 시각·시간대, 제출한 main SHA를 함께 보관하세요.

접수 증거를 확인하기 전에는 프로젝트 상태를 `SUBMITTED`로 바꾸지 마세요. Submit 후에는 입력한 연락처로 온 확인 메일도 확인하세요. 이 문서와 로컬 파일 이름에 `FINAL` 또는 `READY`가 들어 있다는 사실은 접수 완료를 뜻하지 않습니다.
