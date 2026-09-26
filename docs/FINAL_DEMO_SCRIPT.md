# 최종 발표·시연 대본

후보 UI에서 사용할 원고. 실제 낭독·영상은 **미실시**다. 아래 초 구간은 계획이지 측정값이 아니다. 앱 시작 READY는 현재 공개 조회 성공과 다르다.

## 30초 한국어
“초대 코드를 공개 원장에 그대로 올리면 다른 사람이 복사할 수 있습니다. Silent Pass는 비밀값 대신 커밋먼트와 사용 여부만 기록하고, 소지자가 비밀값을 증명해 한 번 사용합니다. 확인자는 지갑이나 초대 코드 없이 지정된 계약의 소비 기록을 봅니다. 다만 사용 기록은 지금 온 사람의 신원이나 입장 허가가 아닙니다. 그 경계를 실제 회로 시연과 공개 기록으로 보여드립니다.”

25~35초 편집 목표. 실제 속도에 따라 줄인다. 30초에 모든 라이브 클릭을 강요하지 않는다.

## 60초 English pitch
“An invitation code should not become public just because its use is recorded on a shared ledger. Silent Pass separates the bearer secret from the consumption record. A holder supplies a private input to a small Midnight contract. The contract checks the commitment, permits one claim, and rejects reuse. A reviewer can inspect the pinned public contract without a wallet or the secret. Our demonstration separates actual local circuit execution, historical Preview transactions, and a new public-indexer observation. It also labels failed reads and unsigned exports honestly. A database and QR code can be simpler for one trusted operator. We are demonstrating a different shared-state model, not claiming to replace every ticketing system. Issuer authenticity, secret delivery and admission remain separate responsibilities. The result is a small, inspectable prototype with explicit limits.”

## 3분 실행 순서
| 계획 시간 | 화면/행동 | 말할 내용 | 남기는 증거 |
|---|---|---|---|
| 0:00–0:20 | 첫 화면. 새로 생성한 실제 민감정보는 쓰지 않음 | 초대 비밀과 소비 기록의 분리 | 제품 범위 |
| 0:20–0:40 | 확인자 전용 화면; 준비 상태 확인 | 이 경로는 지갑·비밀값·거래를 요청하지 않는다 | entry/맥락 |
| 0:40–1:05 | 공개 기록 새로 조회 | USED는 누군가 사용했다는 기록, 현재 사람의 입장 승인이 아님 | 실제 요청ID·시각·상태 |
| 1:05–1:35 | 전체 데모의 독립 회로 시연 | 잘못된 값 거절, 올바른 값 1회, 재사용 거절. 체인 거래/새 proof가 아님 | 실제 3단계 결과 |
| 1:35–1:55 | Recorded example 펼침 | 9/25 Preview 거래·당시 commit, 지금 UI와 별개 | 역사 tx·원문 |
| 1:55–2:15 | 관찰 JSON 다운로드 설명 | 서명 없는 기록이며 나중에 편집될 수 있고 상태가 바뀔 수 있다 | allow-list 출력 |
| 2:15–2:35 | 거래 복구 안내 (실제 새 거래 금지) | timeout≠취소, 원래 ID의 결과, BLOCKED 우회 금지 | 문서/기존 tests |
| 2:35–3:00 | 범위·릴리스 근거 | 발급자/신원/입장/익명성 보장 안 함. 최종 source와 빌드 증거 연결 | release와 README |

## Indexer 실패 대본
“현재 조회는 UNKNOWN입니다. 네트워크의 응답을 확인하지 못했으므로 성공이라고 말씀드리지 않겠습니다. 여기의 Recorded example은 과거 Preview 거래 기록입니다. 현재 상태와 구분해 보여드리고, 로컬 회로 동작은 별도로 확인하겠습니다.”

## SDK 초기화 실패 대본
“지금 SDK 초기화를 완료하지 못했습니다. 이 준비 실패는 계약의 사용 결과가 아닙니다. 공개 원문과 역사 기록을 열겠습니다. 이를 라이브 동작 성공으로 대신하지 않겠습니다.”

## 보호선
영상/스크린샷에 실제 지갑 주소·시드·비밀값·개인 계정 화면을 넣지 않는다. 단일 실제 시연의 실패를 편집으로 없애 성공처럼 꾸미지 않는다. 예제 입력만 쓰고 로컬 회로 생성 secret은 화면에서 확대하거나 공유하지 않는다. 녹화 전에 sensitive 입력란이 비어 있는지 확인한다.
