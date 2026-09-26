# Silent Pass 실행 및 Lace 지갑 연동 가이드

가이드 갱신일: 2026-09-26 (KST). 이전 Preview 거래 기록은 2026-09-25 기준.

## 먼저 공개 기록 확인하기 — 지갑 불필요

[확인자 전용 화면](https://haamseongho.github.io/midnight_contest/review.html)은 비밀 입력란·지갑 연결·거래 경로를 제외한 별도 화면입니다. Docker나 Lace 없이 열 수 있습니다. 로컬에서는 Vite 주소 뒤에 `/review.html`을 붙입니다. 공개 관찰 요약 다운로드는 서명되지 않은 당시 관찰 JSON이며 공증/입장권/현재 상태 보장이 아닙니다. 주최자가 새 계약을 배포해도 이 예제의 신뢰 설정에 자동 등록되지 않습니다.

메인 화면에는 주최자/소지자 역할별 다음 행동과 심사자 4단계 가이드가 있습니다. 실제 조회·회로 결과를 확인해야 다음 단계가 열리며, 조회 실패 시 과거 예제를 명시적으로 선택할 수 있습니다. 실제 낭독·신규 사용자 이해도는 [사람 검수표](./HUMAN_VALIDATION.md)에 별도로 기록하세요.

앱의 **지갑 없이 공개 기록 확인 → 공개 기록 새로 조회**를 누릅니다. 이 경로는 앱 배포자가 고정한 Preview 계약만 읽고 비밀값·지갑·서명·거래를 요청하지 않습니다. `사용 기록 있음`은 현재 방문자의 입장 허가가 아닙니다. 조회 실패 시 UNKNOWN을 유지하고 Recorded example을 과거 기록으로만 참고하세요.

**실제 회로의 실패와 성공 확인**은 별도의 임시 세션을 사용합니다. Docker와 지갑 없이 컴파일된 회로의 잘못된 값/올바른 값/재사용 결과를 확인할 수 있습니다. 실제 네트워크 증명 생성은 아래 로컬 E2E 또는 지갑 경로에서 수행합니다.

## 새 회귀 검증과 거래 복구

`npm ci` 다음 `npx playwright install chromium`을 한 번 실행하세요. `npm run verify`에 실제 브라우저 DOM 회귀가 포함됩니다. `npm run test:preview`는 실제 Preview 공개 조회, `npm run test:local`은 실제 로컬 거래와 전송 응답 유실 후 복구를 검증합니다.

거래가 3분 동안 끝나지 않으면 상태는 UNKNOWN입니다. 원래 Promise는 계속 관찰되고 늦은 성공도 같은 operation에 반영됩니다. 같은 거래를 다시 보내지 마세요. 새로고침/재연결 후 **원래 거래 결과 확인**은 기록된 거래 ID의 최종 결과로만 상태를 복구합니다. 미사용 공개 상태나 인덱서의 일시적 미검출은 거래 실패 증거가 아닙니다.

**BLOCKED · 복구 기록 오류**가 나타나면 새 거래·취소·거래 결과 확인을 차단합니다. 손상되거나 읽을 수 없는 기록을 삭제하거나 새 탭에서 우회 전송하지 마세요. 저장소 접근 또는 원본 기록을 복구한 뒤 **복구 기록 다시 검사**를 누릅니다. 쓰기 오류 때는 메모리에 남은 같은 operation/거래 ID를 보존하며, 미확정 기록은 UNKNOWN으로 돌아가 정확한 거래 결과를 확인해야 합니다. 원본 기록이 없으면 자동 해제하지 않습니다. 개발자 도구에서 임의 상태/거래 ID를 만들어 넣지 마세요. 공개 조회·로컬 회로 시연은 계속 가능합니다.

거래 ID가 생기기 전에는 **전송 전 작업 중단**으로 앱의 후속 전송을 차단할 수 있습니다. Lace에 남은 창은 거절하세요. 이미 전송한 거래는 앱이 취소하지 못합니다. 세션 기록은 같은 탭에만 보관되며 비밀값은 포함하지 않습니다. 탭을 닫기 전 공개 operation/tx ID를 보관하세요. 다른 탭과 기기의 중복 실행은 조정하지 않습니다.

이 문서는 Silent Pass를 로컬에서 실행하고, 로컬 Midnight 개발망을
검증하고, Lace Preview 지갑을 연결하는 절차를 한곳에 정리한 운영
가이드입니다. 비밀번호·복구 구문·개인키·패스 비밀값은 어느 단계에서도
저장소나 문서에 기록하지 않습니다.

## 1. 준비물

- macOS 또는 Linux
- Chrome
- Node.js 24.11.1 이상과 npm
- Docker Desktop과 Docker Compose
- Compact devtools 0.5.1 및 Compact compiler 0.31.1
- Preview 거래까지 진행할 경우 Lace와 Preview tNIGHT/tDUST

공식 근거:

- [Midnight 도구 설치](https://docs.midnight.network/getting-started/installation)
- [호환성 표](https://docs.midnight.network/relnotes/support-matrix)
- [Midnight.js](https://docs.midnight.network/sdks/official/midnight-js)
- [네트워크와 엔드포인트](https://docs.midnight.network/guides/networks-and-environments)
- [지갑 자금 준비](https://docs.midnight.network/guides/acquire-tokens)
- [로컬 proof server](https://docs.midnight.network/guides/run-proof-server)

## 2. 설치와 전체 검증

```sh
git clone https://github.com/Haamseongho/midnight_contest.git
cd midnight_contest
npm ci
npm run verify
```

`npm run verify`는 Compact 계약 컴파일, proof artifact 동기화, TypeScript
검사, production build, production dependency audit, 계약·프라이버시·UI
문서 불변식 테스트를 실행합니다.

## 3. 브라우저 데모 실행

```sh
npm run dev
```

터미널에 표시된 로컬 주소(기본 `http://127.0.0.1:5173/`)를 Chrome에서
엽니다. 다른 프로세스가 포트를 사용 중이면 Vite가 5174, 5175 등 다음
포트를 사용할 수 있으므로 터미널에 실제로 표시된 주소를 사용합니다.

**입장 패스 실험실**에서 다음을 확인합니다.

1. 새 패스를 생성한다.
2. 공개 상태에는 비밀값이 아닌 커밋먼트만 표시되는지 확인한다.
3. 비밀값 한 글자를 바꿔 제출하고 거절되는지 확인한다.
4. 정확한 비밀값으로 한 번 사용한다.
5. 같은 비밀값을 다시 사용하면 거절되는지 확인한다.

이 실험실은 컴파일된 Compact 회로를 브라우저에서 실행하지만 블록체인
거래를 제출하지는 않습니다.

## 4. 로컬 Midnight 개발망 거래 검증

```sh
docker compose -f devnet/compose.yml up -d --wait --wait-timeout 240
npm run test:local
docker compose -f devnet/compose.yml stop
```

이 검증은 실제 로컬 노드·인덱서·proof server를 사용해 계약 배포,
잘못된 비밀값 거절, 정상 claim, replay 거절, DApp Connector 애플리케이션
경로와 재연결을 확인합니다.

주요 로컬 주소:

- Node RPC: `http://127.0.0.1:9944`
- Indexer: `http://127.0.0.1:8088/api/v4/graphql`
- Proof server: `http://127.0.0.1:6300`

## 5. Lace Preview 지갑 준비

1. [Lace 공식 사이트](https://www.lace.io/)에서 확장 프로그램을 설치한다.
2. 새 지갑을 만들거나 기존 지갑을 복구한다. 복구 구문은 오프라인에
   보관하고 누구에게도 전달하지 않는다.
3. Midnight 계정을 만들고 네트워크를 `Preview`로 선택한다.
4. `mn_addr_preview`로 시작하는 공개 unshielded 주소를 복사한다.
5. [Preview faucet](https://midnight-tmnight-preview.nethermind.dev/)에서
   해당 주소로 무료 tNIGHT를 요청한다.
6. 로컬 proof server를 실행하고 상태를 확인한다.

```sh
docker compose -f devnet/compose.yml up -d proof-server
curl http://127.0.0.1:6300/health
```

7. Lace의 Midnight 계정에서 **Generate tDUST**를 선택한다.
8. Lace가 표시한 Preview DUST 주소와 tNIGHT 수량을 확인하고 등록 거래를
   검토·승인한다.
9. tDUST 탱크에 사용 가능한 잔액이 표시될 때까지 기다린다.

tNIGHT를 보유하는 것만으로는 거래 수수료를 낼 수 없습니다. 공식
가이드에 따라 tNIGHT를 DUST 생성에 등록해야 tDUST가 쌓입니다.

## 6. Silent Pass와 Lace 연결

1. Lace와 같은 Chrome 프로필에서
   [공개 데모](https://haamseongho.github.io/midnight_contest/) 또는 로컬
   앱을 연다.
2. **지갑·네트워크 실험**에서 `Preview`를 선택한다.
3. **지갑 연결**을 누르고 Lace의 Silent Pass 연결 요청을 승인한다.
4. 앱에 `preview 연결됨`이 표시되는지 확인한다.
5. 새 비밀값을 생성하고 안전한 비공개 채널에 저장한다.
6. **지갑으로 배포**를 누른 뒤 Lace에서 목적과 네트워크를 확인하고
   승인한다.
7. 공개 계약 주소와 배포 트랜잭션 ID만 기록한다.
8. 잘못된 비밀값 거절, 정상 사용, 재사용 거절을 순서대로 검증한다.
9. claim 트랜잭션 ID와 최종 공개 상태만 기록한다.

2026년 9월 25일 실제 Preview 검증에서는 계약
`66e374b0cafdf387576cf29bcd5de16fb010f0e92ea10d6e6f1e2d6c4b99256c`가
배포 트랜잭션
`0009965462a734559665acff00e767c2de22a4f18ce689c7045f94e4ce9b356c2e`로
생성됐고, claim 트랜잭션
`0032856554b96a452286646176f4a0e689808d22615069eb9a498973493cee35dc`
후 인덱서에서 `claimed = true`를 조회했습니다. 앱은 성공 후 두 비밀값
입력란을 모두 지웠으며, 지갑 주소와 패스 비밀값은 기록하지 않았습니다.

지갑 연결은 개인키를 앱에 제공하지 않습니다. 하지만 wallet API는 공개
주소와 연결 상태를 앱에 제공할 수 있고, proof provider는 회로의 private
input을 처리할 수 있습니다. 신뢰할 수 있는 로컬 proof server와 공식 Lace만
사용합니다.

## 7. 문제 해결

- **지갑을 찾지 못함:** Lace가 설치·활성화되어 있고 현재 사이트 접근을
  허용했는지 확인한 뒤 페이지를 새로고침한다.
- **tDUST 0:** tNIGHT 수령만으로 끝난 것이 아닌지 확인하고 Lace의
  **Generate tDUST** 등록을 완료한다.
- **거래가 Sending에서 멈춤:** 같은 거래를 반복 제출하지 말고 Lace
  Activity, Preview 동기화, proof server health/log, 공개 계약 상태를 먼저
  확인한다.
- **네트워크 불일치:** Lace와 Silent Pass가 모두 Preview인지 확인한다.
- **proof server 오류:** Docker Desktop을 실행한 뒤 proof-server 컨테이너와
  `http://127.0.0.1:6300/health` 응답을 확인한다.

더 자세한 Preview 기록 절차는 [Preview deployment runbook](./PREVIEW_DEPLOYMENT.md),
보안 경계는 [SECURITY.md](../SECURITY.md)를 참고합니다.
