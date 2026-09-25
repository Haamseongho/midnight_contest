# Silent Pass 실행 및 Lace 지갑 연동 가이드

최종 확인일: 2026-09-25 (KST)

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
