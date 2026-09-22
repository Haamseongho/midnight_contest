# Silent Pass — Midnight 일회용 비밀 패스 프로토타입

**한 줄 설명:** 비밀값을 공개하지 않고 일회용 패스를 소유했음을 증명하는 Midnight DApp.

비밀값을 공개 원장에 저장하지 않고, 그 값을 아는 사람만 패스를 한 번 사용할 수 있게 하는 작은 Midnight Compact 계약과 웹 앱입니다. [Midnight Korea Hackathon 2026 안내](https://sensible-successes-775636.framer.app/kor)는 요구사항 참조용이며, 이 사이트를 통한 최종 제출은 하지 않습니다. 컴파일·재현 가능한 로컬 데모와 로컬 개발망 거래 검증 경로를 구현했습니다. 공개 테스트넷과 실제 브라우저 지갑 확장 프로그램은 아직 검증하지 않았습니다.

## 바로 실행

필요 환경: Node.js 22 이상, npm, Compact devtools 0.5.1 및 Compact 컴파일러 0.31.1. Compact는 [공식 설치 가이드](https://docs.midnight.network/getting-started/installation)에 따라 설치하고 `compact update 0.31.1`을 실행한 뒤 `compact --version`과 `compact compile --version`으로 확인하세요. SDK·컴파일러 버전은 [공식 호환성 표](https://docs.midnight.network/relnotes/support-matrix)에 맞췄습니다. 지갑 경로에는 DApp Connector 4.x 지원 지갑이 별도로 필요합니다.

```sh
npm ci
npm run build
npm test
npm run dev
```

개발 서버가 표시한 로컬 주소(기본 `http://127.0.0.1:5173`)에서 위쪽 **패스 실험실**의 패스를 생성하고, 비밀값을 복사해 확인 칸에 입력하면 됩니다. 잘못된 값은 거절되고, 맞는 값은 한 번만 사용할 수 있습니다. `npm run build`는 Compact 계약 재컴파일, 영지식 증명용 산출물의 웹 공개 디렉터리 복사, TypeScript 검사, 웹 앱 번들을 수행합니다.

외부 호스팅을 선택하고 사이트 하위 경로를 사용한다면 해당 경로로 `npx vite build --base /경로/`를 실행해야 합니다. 지갑 경로가 읽는 `keys/`, `zkir/`도 같은 기준 경로를 따릅니다. 현재 데모는 위 로컬 실행 절차로 확인할 수 있으며, 외부 호스팅 주소는 정하지 않았습니다.

**심사용 데모 흐름:** 위 명령을 실행한 뒤 앱에서 ① 새 패스 생성 ② 표시된 비밀값 복사 ③ 일부를 바꾼 값으로 사용 시도해 거절 확인 ④ 올바른 값으로 사용해 공개 상태가 `사용 완료`로 바뀌는 것을 확인합니다. 실제 로컬 체인 거래는 아래 `npm run test:local`로 재현할 수 있습니다.

**Midnight 구현 포인트:** Compact의 `persistentHash`로 비밀값의 32바이트 커밋먼트를 만들고, 공개 원장에는 커밋먼트와 사용 여부만 둡니다. `claim`은 비밀 회로 인자를 비교한 뒤 사용 여부를 바꾸므로 원장에 원문 비밀값을 쓰지 않습니다. Midnight.js가 증명·지갑 수수료 처리·트랜잭션 제출을 연결합니다. 로컬 개발망에서 실제 배포와 1회 사용을 검증했습니다.

## 구현 범위

- `contract/src/silent-pass.compact`: 공개 원장 상태는 32바이트 커밋먼트와 `claimed` 여부뿐입니다. `claim` 회로의 비밀 인자는 공개 원장에 기록하지 않습니다.
- `src/main.ts`: 컴파일된 Compact 계약 JavaScript를 브라우저의 로컬 상태에서 직접 실행합니다. 이 로컬 데모의 비밀값은 서버나 로컬 저장소에 전송·저장하지 않으며 사용 후 입력과 표시 값을 비웁니다. 생성·입력 파싱에 쓴 임시 바이트 배열도 사용 후 0으로 덮어쓰지만 JavaScript 문자열 사본까지 메모리에서 즉시 제거된다고 보장하지는 않습니다. 복사 버튼을 누른 값은 운영체제 클립보드에 남을 수 있습니다.
- `src/network/midnight.ts`: Midnight.js 4.1.1과 DApp Connector 4.x로 지갑 연결, 계약 배포, 공개 상태 조회, `claim` 트랜잭션 제출 경로를 구현했습니다. 로컬 `undeployed`에서는 Docker 증명 서버를, Preview·Preprod에서는 지갑이 제공하는 증명 제공자를 사용합니다. 증명 키와 ZKIR은 `public/keys`, `public/zkir`에서 제공합니다.
- `devnet/compose.yml`: 공식 `midnight-local-dev` 설정을 참고한 로컬 `undeployed` 네트워크 노드·인덱서·증명 서버 구성입니다. 컨테이너가 켜지는 것과 앱 거래 성공은 서로 다른 검증입니다.
- `tests/silent-pass.test.mjs`, `tests/artifacts.test.mjs`: 계약 상태·비밀값·재사용 방지와 브라우저 증명 산출물 일치를 검사합니다.
- `scripts/local-e2e.mjs`: 개발망에서 공개 테스트용 지갑으로 계약을 배포·사용하고, 공식 테스트 지갑 어댑터를 통해 앱의 DApp Connector 경로도 검증합니다. 앱 경로에서는 배포 후 새 연결 세션을 만들어 기존 주소를 조회·사용합니다. 두 경로 모두 잘못된 비밀값과 중복 사용 거절을 확인합니다.

**검증 상태:** 로컬 계약 실행·4개 단위 테스트와 앱 프로덕션 빌드는 통과했습니다. 개발망에서 직접 SDK 경로와 앱의 Connector 경로 모두 계약 배포, 증명 생성, 사용 트랜잭션, 사용 완료 상태 조회가 성공했습니다. 앱 경로는 배포 후 새 연결 세션에서 기존 계약을 조회·사용했습니다. 두 경로 모두 잘못된 비밀값과 재사용을 거절하고 공개 상태가 예상대로 유지되는 것을 확인했습니다. 브라우저에서도 로컬 패스의 잘못된 값 거절과 정상 사용 후 표시값 삭제를 확인했고, `/demo/` 하위 경로 빌드에서 `claim.prover`가 올바르게 제공되는 것을 확인했습니다. 실제 브라우저 지갑 승인과 Preview·Preprod 거래는 아직 확인되지 않았습니다. 참가 등록·제출 여부 역시 별도 확인이 필요합니다.

## 지갑·로컬 네트워크 실험

앱 아래쪽 **지갑·네트워크 실험**에서 Preprod, Preview 또는 로컬 Undeployed를 고른 뒤 DApp Connector 4.x 지갑을 연결합니다. 비밀값을 생성해 **배포 전에 복사해 보관**하고, 계약을 배포한 뒤 **계약 주소도 보관**하세요. 새로고침하면 화면의 비밀값과 주소는 사라지지만, 지갑을 다시 연결하고 보관한 주소·비밀값을 입력해 사용을 시도할 수 있습니다. 로컬 테스트 지갑 어댑터에서는 새 연결 세션의 기존 계약 사용까지 검증했습니다. 별도의 계약 관리 서명키는 현재 브라우저 세션 메모리에만 있어, 새로고침 뒤 계약 관리 권한을 이어받는 기능은 없습니다(일반 `claim` 사용과는 별개입니다).

로컬 네트워크 컨테이너는 Docker Desktop을 실행한 상태에서 다음처럼 기동합니다.

```sh
docker compose -f devnet/compose.yml up -d
docker compose -f devnet/compose.yml ps
npm run test:local
```

이 설정은 노드 `127.0.0.1:9944`, 인덱서 `127.0.0.1:8088`, 증명 서버 `127.0.0.1:6300`을 엽니다. `test:local`은 공식 개발망의 공개 제네시스 테스트 시드를 사용하므로 실제 사용자 지갑이나 공개망 자금을 사용하지 않습니다. 브라우저에서 수동으로 시험하려면 DApp Connector 4.x 지갑의 `undeployed` 설정과 테스트 NIGHT·DUST 자금이 별도로 필요합니다. 자금 준비 방법은 [공식 로컬 개발망 안내](https://github.com/midnightntwrk/midnight-local-dev)를 따르세요. 로컬 컨테이너는 `docker compose -f devnet/compose.yml stop`으로 정지할 수 있습니다. 이 Compose 파일의 고정된 개발용 자격값을 공개 네트워크에 사용하지 마세요.

지갑 경로의 `claim` 비밀값은 영지식 증명을 위해 로컬 Docker 증명 서버(`undeployed`) 또는 지갑이 선택한 증명 제공자(Preview·Preprod)에 전달될 수 있습니다. 이 앱 자체는 비밀값을 별도 서버·로컬 저장소에 저장하지 않지만, 증명 서비스의 처리·보관 정책은 별도로 확인해야 합니다.

## 출품 전 남은 확인

- 실제 브라우저의 DApp Connector 4.x 지갑 승인과 연결·배포·사용 흐름을 확인해야 합니다. 공식 테스트 지갑 어댑터의 로컬 성공은 실제 확장 프로그램의 성공을 대신하지 않습니다.
- Git 원격은 [midnight_contest](https://github.com/Haamseongho/midnight_contest)로 지정했습니다. [공개 안내의 필수 제출물](https://sensible-successes-775636.framer.app/kor)은 README가 있는 공개 GitHub 저장소와 실행·데모 흐름을 요구하지만, 별도 외부 호스팅 URL을 필수라고 명시하지는 않습니다. 최신 소스 게시와 심사자 관점의 클론·로컬 데모 재현은 별도로 확인해야 합니다.
- 참가 등록·팀 자격과 제출 경로는 [개발 착수 체크리스트](./DEVELOPMENT_READINESS.md)의 미확인 항목을 별도로 확인해야 합니다. 참조용 Framer 사이트에 제출하지 않습니다.

`contract/managed/`, `public/keys/`, `public/zkir/`, `dist/`, `node_modules/`는 빌드 산출물이므로 Git에서 제외합니다. 저장소를 복제한 심사자는 위 명령으로 계약과 앱을 다시 컴파일할 수 있습니다. 비밀값이나 지갑 시드는 저장소에 올리지 마세요.

공식 참고: [Compact 언어](https://docs.midnight.network/compact/reference/compact-reference) · [Midnight.js](https://docs.midnight.network/sdks/official/midnight-js) · [호환성 표](https://docs.midnight.network/relnotes/support-matrix).
