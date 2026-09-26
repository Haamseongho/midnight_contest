# 우수·유사 사례 적용 체크리스트

검토일: 2026-09-26 KST. U1~U4 구현 및 로컬/브라우저 검증 후 작성.
판정은 원문에서 확인한 사실과 Silent Pass에 적용한 설계 판단을 구분한다. 다른 프로젝트의 자체 README는 이번 세션에서 그 프로젝트를 실행·감사했다는 증거가 아니다.

추가 확인: [공동 주관사 라온시큐어의 2025-09-25 수상 발표](https://www.raon.com/ko/about/news_list/view/453)에서 위임(We-im) 대상, zkBlock 최우수상, 성희청과·TodayRPG·Typha 우수상을 확인했다. 이전 결선 공지만으로 미확인으로 남긴 수상·영문명 항목을 아래와 같이 갱신한다. **아직 구현하지 않은 추가 아이디어는 [별도 제안서](./BENCHMARK_IDEAS_PROPOSAL.md)에 분리**했다.

## 적용과 검증

후속 A–F는 사용자 요청으로 전체 채택했다. 아래 표는 최초 U1–U4의 검수이고, 추가 구현·증거 및 미완료 사람 검수는 [ENHANCEMENT_PROGRESS.md](./ENHANCEMENT_PROGRESS.md)에서 구분한다.

| 참고 사례 | 원문에서 확인한 범위 | 가져온 강점·Silent Pass 반영 위치 | 검증·판정 |
| --- | --- | --- | --- |
| 국내 위임(We-im)·성희청과 | 디지털 위임장, DID 위임·공증·내용증명 플랫폼. 대상/우수상 확인. [공식 수상 발표](https://www.raon.com/ko/about/news_list/view/453) | 업무를 역할별로 연결하는 설계 원칙을 적용: `index.html`의 주최자 → 소지자 → 확인자, `trusted-context.ts`의 맥락 출처 | [x] 역할과 책임이 표시되고 소지자 입력이 검증자 조회로 전달되지 않음. 결선 공지는 Wiim, 수상 발표는 We-im 표기. |
| 국내 zkBlock·TodayRPG·Typha | 각각 ZK 구인구직, TRPG 모임·창작물 공유, DID/NFT 티켓팅. 최우수상/우수상/우수상 확인. [공식 수상 발표](https://www.raon.com/ko/about/news_list/view/453) | 특정 사용자와 필요한 정보를 먼저 설명하는 원칙을 적용: 첫 화면의 초대 소비 문제, 소지자의 비밀 입력과 확인자의 공개 기록 | [x] 문제→행동→보이는 정보 순서 적용. DID·모바일 신분증·암표 방지 기능을 Silent Pass에 구현했다고 주장하지 않음. |
| VaxZK | 발급기관 등록, 서명된 인증서, 증명 요청, 소지자의 증명 제출을 구분. [프로젝트 README](https://github.com/bochaco/vaxzk) | 역할 설명과 신뢰 전제의 명시: U2의 앱 배포자 정책, `SECURITY.md`, 제출 문구 | [x] 발급·소지·조회 경계를 표시. Silent Pass는 VaxZK의 issuer registry/서명 검증을 제공하지 않는다고 명시. |
| AnchorZK | 공개 확인 포털은 지갑 연결·쓰기 없이 indexer를 조회한다고 설명. [프로젝트 README](https://github.com/0xstrong/AnchorZK#verification-portal) | U2의 검증자 화면을 소지자 거래 화면에서 분리; `public-reader.ts`는 고정 endpoint·계약만 읽음 | [x] 실제 Preview 새 브라우저 조회 성공. 지갑 API 접근 0, private input 0, transaction request 0. UI nonce/QR로 신원을 해결했다고 주장하지 않음. |
| EDDA·Brick Towers | 공식 회고는 실제 플레이 가능한 데모, 명확한 UI·회로, 문서와 발표를 강점으로 설명. [Sea Battle 공식 회고](https://midnight.network/blog/developers-navigate-public-and-private-states-in-the-midnight-sea-battle-challenge), [개발자 조언](https://midnight.network/blog/how-developers-level-up-with-the-midnight-network) | U3 실제 회로 시연, 재현 명령, `DEMO_SCRIPT.md`의 30초/3분 경로, `IMPLEMENTATION_EVIDENCE.md` | [x] actual compiled circuit의 실패→성공→재사용 거절과 독립 세션을 DOM에서 검수. [x] 두 길이의 발표 스크립트 작성. [ ] 발표자의 실제 낭독 시간·영상 촬영은 별도. |
| Lens & Frens·Zhat's Me·Selkie | 기존 ZK 이벤트 티켓팅, 신원+이메일 티켓 검증, 비밀 지식 기반 자산 claim 사례가 존재. [Lens & Frens](https://ethglobal.com/showcase/lens-and-frens-ogedp), [Zhat's Me](https://ethglobal.com/showcase/zhats-me-vioyt), [Selkie](https://github.com/DpacJones/selkie-usdm-escrow) | README·첫 화면·제출 설명의 주장 축소. Silent Pass의 차이는 작은 일회 소비 회로, 고정 맥락 공개 reader, 정직한 증거 구분과 복구 흐름 | [x] 세계 최초·익명 입장·가짜 티켓 차단을 주장하지 않음. [x] 신원/이메일 검증과 자산 이전은 제공하지 않음을 명시. |

## 출시 전 확인

- [x] 주최자는 무엇을 고정하고 소지자는 무엇을 보관하는지 설명한다.
- [x] 확인자는 지갑·비밀·서명·거래 없이 공개 기록을 읽는다.
- [x] 정책 출처와 버전을 표시하고 holder의 `trusted=true`/URL 입력을 신뢰하지 않는다.
- [x] `claimed=true`를 현재 방문자의 입장 승인으로 표시하지 않는다.
- [x] 잘못된 비밀값/올바른 비밀값/replay 결과는 실제 컴파일된 회로에서 계산한다.
- [x] Recorded example과 이번 live 관찰의 날짜·근거를 섞지 않는다.
- [x] UNKNOWN에 중복 전송을 막고 동일 tx ID의 최종 결과로 복구한다.
- [x] README·SECURITY·DEMO_SCRIPT·제출용 초안의 핵심 주장을 맞춘다.
- [ ] 실제 제출 폼의 입력값, Luma 등록·팀 자격, 최종 Submit 접수 증거는 사용자 계정에서 별도 확인한다.

## 추정하지 않은 항목

- 원본 ZIP, REPORT_KO.md, BENCHMARK_CASES.md, candidate/reviewer_policy.mjs, prior_review probe는 현재 작업 폴더와 확인한 다운로드 경로에 없었다. 이번 구현은 사용자가 붙인 브리프와 현재 저장소·공식 원문에 근거했다. 원래 probe를 수정 후 PASS 증거로 재사용하지 않았다.
- 국내 사례의 수상은 위 추가 공식 발표로 확인했다. 상세 소스·실제 배포의 동작 검증은 수행하지 않았다. 역할/문제 중심 적용은 공개 설명에서 도출한 설계 판단이다.
- 외부 프로젝트의 현재 모든 기능을 직접 실행한 검증은 수행하지 않았다. 인증·DID·암표 방지 능력을 이 프로젝트로 이전한 것으로 해석하지 않는다.
- 실제 발표자의 30초/3분 낭독 리허설과 영상은 제작하지 않았다. 화면 경로와 재현 명령은 검수했고, 사용할 스크립트는 준비했다.

## 후속 확장 선택지

issuer/session/request binding, 만료, 철회, batch가 필요하면 먼저 누가 누구에게 무엇을 증명하는지와 위협 모델을 정한다. 물리적 입장을 다루려면 현재 세션에 결합된 소지자 응답이 필요하다. 계약/ABI/key를 바꾸면 새 localnet 및 Preview 거래 증거를 확보한다. 이 항목들은 이번 일회 소비 프로토타입의 완료 조건에 포함하지 않는다.
