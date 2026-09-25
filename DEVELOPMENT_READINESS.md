# Midnight Korea · World Bank 개발 착수 체크리스트

> 최초 선행조건 조사는 2026-09-21에 작성했고, 개발 환경과 저장소 상태는 2026-09-25에 갱신했습니다. 참가 등록·팀 자격처럼 로컬에서 증명할 수 없는 항목은 계속 `미확인`으로 둡니다. 앱의 실행 절차는 [실행 및 Lace 가이드](./docs/RUN_AND_LACE_GUIDE.md), 제출용 문안은 [최종 제출 패키지](./docs/FINAL_SUBMISSION_PACKAGE.md)를 참고하세요.

확인일: 2026-09-21 (KST). 이 문서는 **공개된 공식 자료와 이 Mac에서 직접 확인한 상태**만 기록한다. `미확인`은 충족했다는 뜻이 아니다.

| 항목 | 현재 상태 | 개발 착수에 필요한 판단과 공식 근거 |
| --- | --- | --- |
| Node.js | 확인 완료: v24.20.0 | Midnight.js 요구 버전은 22.x 이상. [Midnight.js](https://docs.midnight.network/sdks/official/midnight-js) |
| Docker Desktop | 확인 완료: Docker Engine 29.8.0, Compose v5.5.1, `hello-world` 실행 성공 | 로컬 proof server에 필요. [Midnight.js](https://docs.midnight.network/sdks/official/midnight-js), [Docker Mac 설치](https://docs.docker.com/desktop/setup/install/mac-install/) |
| Compact 도구 | 실행 확인: `compact` 0.5.1, 컴파일러 0.31.1 | 현재 테스트 완료 조합에 맞춤. 설치 기록은 아래 누락 목록 참고. [호환성 표](https://docs.midnight.network/relnotes/support-matrix), [설치 가이드](https://docs.midnight.network/getting-started/installation) |
| 로컬 proof server | 확인 완료: `midnightntwrk/proof-server:8.0.3` healthy, `127.0.0.1:6300` 게시 | 저장소의 고정된 로컬 E2E 스택과 일치. [proof server 가이드](https://docs.midnight.network/guides/run-proof-server) |
| Midnight.js 프로젝트 의존성 | 설치·고정 완료: Midnight.js 4.1.1, DApp Connector API 4.0.1, Compact runtime 0.16.0 | `package.json`과 lockfile로 재현 가능하며 공식 호환성 표와 일치. [최신 호환성 표](https://docs.midnight.network/relnotes/support-matrix) |
| Chrome · VS Code | 앱 설치 확인 | 공식 도구 설치 가이드에 기재. [설치 가이드](https://docs.midnight.network/getting-started/installation) |

## 대회별 필수 조건

| 구분 | Midnight Korea Hackathon 2026 | World Bank Small AI Challenge 2026 |
| --- | --- | --- |
| 계정·신청 | 공개 GitHub 저장소와 `main` 원격 연결은 확인 완료. [Luma 참가 등록](https://luma.com/2pnv2fwk) 여부는 사용자 계정에서만 확인 가능하므로 **미확인**. [공식 허브](https://www.hackathon.midnightkorea.org/) | [Hack-Nation 신청](https://luma.com/z3za7zow) 및 주최 측 승인이 필요. **9월 26일** 신청 마감, 추천 코드 `WBGSmallAIGADS`. 참가자별 등록·승인 여부는 **미확인**. [World Bank 공고](https://www.worldbank.org/en/events/2026/10/19/global-ai-and-digital-summit-2026) |
| 개발 요건 | Midnight의 프라이버시 기능을 사용하는 작동하는 DApp. 허용 환경: Local Devnet, Preview, Preprod. [공식 허브](https://www.hackathon.midnightkorea.org/) | 보건·농업·관광 중 한 과제의 제약 환경용 Small AI 솔루션. 특정 필수 SDK는 공개 공고에 명시되지 않음. [World Bank 공고](https://www.worldbank.org/en/events/2026/10/19/global-ai-and-digital-summit-2026) |
| 필수 제출물 | 프로젝트명, 한 줄 설명, **README 포함 공개 GitHub 저장소**, 실행 방법 또는 데모 흐름(텍스트), Midnight 활용 설명. **9월 28일 00:00 KST** 마감. [공식 허브](https://www.hackathon.midnightkorea.org/) | 승인된 참가자가 **10월 3–4일** 공식 포털에 영어로 제출. 세부 제출 파일·기술 요건·정확한 시각은 Hack-Nation 플랫폼 규정 확인 필요. [World Bank 공고](https://www.worldbank.org/en/events/2026/10/19/global-ai-and-digital-summit-2026) |
| 데모 | 영상은 선택. 심사자가 저장소를 클론·컴파일하고 데모에 접근할 수 있어야 함. 수상팀 오프라인 발표는 별도. [공식 허브](https://www.hackathon.midnightkorea.org/) | 공고가 영상 제출을 언급하지만 길이·파일 형식·링크 방식은 공개 공고만으로 확인되지 않음. 수상자 서울 발표의 형식·시간은 주최 측 결정. [World Bank 공고](https://www.worldbank.org/en/events/2026/10/19/global-ai-and-digital-summit-2026) |
| 팀 | 개인 또는 최대 4명. [공식 허브](https://www.hackathon.midnightkorea.org/) | 개인 또는 최대 4명. 구성원별 18–35세·회원국 자격, 개별 등록, 참가 시작 후 팀 변경 불가. 참가·제출 모두 영어. 실제 팀 구성·자격은 **미확인**. [World Bank 공고](https://www.worldbank.org/en/events/2026/10/19/global-ai-and-digital-summit-2026) |

## 누락·보류 목록

1. **사용자 확인 필요:** Midnight Luma 등록, World Bank Hack-Nation 신청·승인, 모든 팀원 등록·연령·회원국 자격. 계정 정보와 승인 이메일은 이 저장소에 두지 않는다.
2. **Hack-Nation 포털 확인 필요:** World Bank 분야별 브리프, 최종 제출 필드, 영상 규격, 정확한 마감 시각·시간대, 원본성/사전 작업·타 대회 제출물 재사용 규정. **Midnight 출품 코드를 World Bank에 재사용할 수 있다고 가정하지 않는다.** [World Bank 공고](https://www.worldbank.org/en/events/2026/10/19/global-ai-and-digital-summit-2026)
3. **사용자 확인 필요:** 최종 제출 페이지에서 프로젝트 소유자가 내용을 검토하고 제출한다. 이 앱 자체를 제출 포털로 사용하지 않는다.
4. **선택 항목:** 데모 영상과 Midnight Academy 수료증은 필수가 아니며 준비 여부가 **미확인**이다.
5. **Awesome dApps 추가 증빙:** 해커톤 제출에는 Local Devnet이 허용되지만, 우수사례 등록 목표를 위해 Preview tDUST 등록·계약 배포·claim 공개 transaction evidence를 남긴다. 현재 Lace Preview 연결과 tNIGHT 수령까지 확인했고 tDUST 등록은 남아 있다.

참고: 제공된 [한국어 Midnight.js 문서](https://docs.midnightkorea.org/sdks/official/midnight-js)는 개요에 유용하지만, 한국어 [호환성 표](https://docs.midnightkorea.org/relnotes/support-matrix)는 4.0.4를 표시한다. 설치 버전은 더 최신인 [본가 호환성 표](https://docs.midnight.network/relnotes/support-matrix)의 4.1.1을 기준으로 확인했다.

## 로컬 확인 명령

```sh
node --version
docker version
docker compose version
compact --version
compact compile --version
curl http://127.0.0.1:6300/health
curl http://127.0.0.1:6300/version
```

위 proof server 실행 상태와 중지 명령은 2026-09-21 당시의 기록이다. 현재 앱은 [README의 Compose 절차](./README.md)로 노드·인덱서·증명 서버를 함께 기동하며, 로컬 거래 검증 후에는 컨테이너를 정지해 두었다. Docker Desktop 재시작 후 테스트하려면 Compose를 다시 기동해야 한다.
