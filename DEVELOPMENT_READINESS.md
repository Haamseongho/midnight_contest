# Midnight Korea · World Bank 개발 착수 체크리스트

> 이 문서는 2026-09-21의 선행조건 스냅샷입니다. 이후 Midnight 앱·SDK 설치와 로컬 개발망 거래 검증이 진행되어 아래의 “빈 저장소/SDK 미설치” 상태는 더 이상 현재 상태가 아닙니다. 앱의 최신 검증·남은 출품 항목은 [README](./README.md)를 참고하세요. 참가 등록·팀 자격 등 미확인 항목은 별도 확인이 필요합니다.

확인일: 2026-09-21 (KST). 이 문서는 **공개된 공식 자료와 이 Mac에서 직접 확인한 상태**만 기록한다. `미확인`은 충족했다는 뜻이 아니다.

| 항목 | 현재 상태 | 개발 착수에 필요한 판단과 공식 근거 |
| --- | --- | --- |
| Node.js | 확인 완료: v24.20.0 | Midnight.js 요구 버전은 22.x 이상. [Midnight.js](https://docs.midnight.network/sdks/official/midnight-js) |
| Docker Desktop | 확인 완료: Docker Engine 29.8.0, Compose v5.5.1, `hello-world` 실행 성공 | 로컬 proof server에 필요. [Midnight.js](https://docs.midnight.network/sdks/official/midnight-js), [Docker Mac 설치](https://docs.docker.com/desktop/setup/install/mac-install/) |
| Compact 도구 | 실행 확인: `compact` 0.5.1, 컴파일러 0.31.1 | 현재 테스트 완료 조합에 맞춤. 설치 기록은 아래 누락 목록 참고. [호환성 표](https://docs.midnight.network/relnotes/support-matrix), [설치 가이드](https://docs.midnight.network/getting-started/installation) |
| 로컬 proof server | 확인 완료: `midnightntwrk/proof-server:8.1.0` 실행 중, `/health`, `/version`, `/ready` 응답 확인 | 이 Mac의 `127.0.0.1:6300`에만 게시. [로컬 증명 가이드](https://docs.midnight.network/guides/local-proving) |
| Midnight.js 프로젝트 의존성 | 4.1.1의 npm 배포 확인. **이 빈 저장소에는 아직 설치하지 않음** | 앱 구조와 참가 규정이 정해진 뒤 해당 프로젝트에 버전을 고정해야 함. 전역 설치 대상이 아님. [최신 호환성 표](https://docs.midnight.network/relnotes/support-matrix) |
| Chrome · VS Code | 앱 설치 확인 | 공식 도구 설치 가이드에 기재. [설치 가이드](https://docs.midnight.network/getting-started/installation) |

## 대회별 필수 조건

| 구분 | Midnight Korea Hackathon 2026 | World Bank Small AI Challenge 2026 |
| --- | --- | --- |
| 계정·신청 | [Luma 참가 등록](https://luma.com/2pnv2fwk)을 마친 참가자만 제출 가능. 이 Mac의 GitHub CLI는 로그인되지 않았고, 저장소에는 원격 주소가 없다. 실제 Luma 등록·GitHub 웹 로그인은 **미확인**. [공식 허브](https://www.hackathon.midnightkorea.org/) | [Hack-Nation 신청](https://luma.com/z3za7zow) 및 주최 측 승인이 필요. **9월 26일** 신청 마감, 추천 코드 `WBGSmallAIGADS`. 참가자별 등록·승인 여부는 **미확인**. [World Bank 공고](https://www.worldbank.org/en/events/2026/10/19/global-ai-and-digital-summit-2026) |
| 개발 요건 | Midnight의 프라이버시 기능을 사용하는 작동하는 DApp. 허용 환경: Local Devnet, Preview, Preprod. [공식 허브](https://www.hackathon.midnightkorea.org/) | 보건·농업·관광 중 한 과제의 제약 환경용 Small AI 솔루션. 특정 필수 SDK는 공개 공고에 명시되지 않음. [World Bank 공고](https://www.worldbank.org/en/events/2026/10/19/global-ai-and-digital-summit-2026) |
| 필수 제출물 | 프로젝트명, 한 줄 설명, **README 포함 공개 GitHub 저장소**, 실행 방법 또는 데모 흐름(텍스트), Midnight 활용 설명. **9월 28일 00:00 KST** 마감. [공식 허브](https://www.hackathon.midnightkorea.org/) | 승인된 참가자가 **10월 3–4일** 공식 포털에 영어로 제출. 세부 제출 파일·기술 요건·정확한 시각은 Hack-Nation 플랫폼 규정 확인 필요. [World Bank 공고](https://www.worldbank.org/en/events/2026/10/19/global-ai-and-digital-summit-2026) |
| 데모 | 영상은 선택. 심사자가 저장소를 클론·컴파일하고 데모에 접근할 수 있어야 함. 수상팀 오프라인 발표는 별도. [공식 허브](https://www.hackathon.midnightkorea.org/) | 공고가 영상 제출을 언급하지만 길이·파일 형식·링크 방식은 공개 공고만으로 확인되지 않음. 수상자 서울 발표의 형식·시간은 주최 측 결정. [World Bank 공고](https://www.worldbank.org/en/events/2026/10/19/global-ai-and-digital-summit-2026) |
| 팀 | 개인 또는 최대 4명. [공식 허브](https://www.hackathon.midnightkorea.org/) | 개인 또는 최대 4명. 구성원별 18–35세·회원국 자격, 개별 등록, 참가 시작 후 팀 변경 불가. 참가·제출 모두 영어. 실제 팀 구성·자격은 **미확인**. [World Bank 공고](https://www.worldbank.org/en/events/2026/10/19/global-ai-and-digital-summit-2026) |

## 누락·보류 목록

1. **사용자 확인 필요:** Midnight Luma 등록, World Bank Hack-Nation 신청·승인, 모든 팀원 등록·연령·회원국 자격. 계정 정보와 승인 이메일은 이 저장소에 두지 않는다.
2. **Hack-Nation 포털 확인 필요:** World Bank 분야별 브리프, 최종 제출 필드, 영상 규격, 정확한 마감 시각·시간대, 원본성/사전 작업·타 대회 제출물 재사용 규정. **Midnight 출품 코드를 World Bank에 재사용할 수 있다고 가정하지 않는다.** [World Bank 공고](https://www.worldbank.org/en/events/2026/10/19/global-ai-and-digital-summit-2026)
3. **프로젝트 착수 시 결정:** Midnight 대상 네트워크와 지갑 방식. Local Devnet은 사전 충전된 genesis 지갑을 제공하고, Preview/Preprod는 해당 faucet과 DUST 등록이 필요하다. [네트워크 가이드](https://docs.midnight.network/guides/networks-and-environments)
4. **프로젝트 착수 시 실행:** 새 앱의 `package.json`에 Midnight.js 4.1.1과 호환 패키지를 고정하고, 공개 저장소·README·재현 가능한 데모를 만든다. 이 저장소는 아직 앱 코드가 없는 빈 Git 저장소다.
5. **설치 관리 확인:** Compact 실행 파일과 컴파일러는 동작하지만, 공식 설치기가 사용자 홈의 `.config` 디렉터리에 설치 기록을 쓰지 못했다(해당 디렉터리가 root 소유). 현재 컴파일 기능에는 지장이 없었으며, 나중에 `compact self` 업데이트 기능을 쓰기 전 권한 또는 기록 위치를 확인해야 한다.

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
