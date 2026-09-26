# Silent Pass — 한 장 기능 비교

확인일 2026-09-26. 아래 외부 기능은 공개 설명을 읽은 범위이며 실행·성능·보안 감사 결과가 아니다. 우월성이나 세계 최초를 주장하지 않는다.

**초대의 비밀은 공개하지 않고, 그 초대가 한 번 사용됐는지는 함께 확인합니다.**

| 인접 사례·공식 설명 | Silent Pass가 현재 제공하는 것 | 제공하지 않는 것 |
| --- | --- | --- |
| [Lens & Frens](https://ethglobal.com/showcase/lens-and-frens-ogedp): ZK 이벤트 티켓팅 | 선택된 계약의 비밀 지식과 1회 소비 | 티켓 판매·재판매·암표 방지 |
| [Zhat’s Me](https://ethglobal.com/showcase/zhats-me-vioyt): 신원/이메일 관련 티켓 증명 | 지갑 없는 지정 공개 기록 확인 | 신원·이메일·현재 방문자 인증 |
| [Selkie](https://github.com/DpacJones/selkie-usdm-escrow): 비밀 기반 자산 claim | 비밀 일치 시 `claimed` 상태 변경 | 자산 수령·송금·결제·에스크로 |

우리 구현의 초점은 작은 일회 소비 회로, 앱 배포자가 고정한 맥락, 확인자 전용 `review.html`, 실제 결과에 연결된 가이드, 기록/현재 조회/로컬 회로의 구분이다. 세 사례의 모든 기능을 비교한 것이 아니며, 이 조합이 유일하다는 주장도 아니다.

## 가져온 설계 원칙과 반영

- [국내 5개 팀의 공동 주관사 발표](https://www.raon.com/ko/about/news_list/view/453): We-im·성희청과의 업무 연결 → 역할별 다음 행동과 서명되지 않은 공개 관찰 JSON. zkBlock·TodayRPG·Typha의 목적·정보·행동 중심 설명 → 사용 장면과 최소 정보 표. DID·공증·출석·암표 방지 기능을 가져온 것은 아니다.
- [VaxZK](https://github.com/bochaco/vaxzk): 역할과 증명 결과 구분 → 일치한 공개 맥락 / 확인하지 않은 발급자·방문자·입장 권한 패널.
- [AnchorZK](https://github.com/0xstrong/AnchorZK#verification-portal): 확인 경로 분리 → 별도 reader entry와 빌드 의존성 검사.
- [EDDA](https://midnight.network/blog/virtual-hackathon-winners), [Brick Towers](https://midnight.network/blog/developers-navigate-public-and-private-states-in-the-midnight-sea-battle-challenge): 실제 시연과 발표 → actual circuit 3단계, 결과에 연결된 가이드, 발표 타이머. EDDA Q&A와 Sea Battle의 Edda Labs를 혼동하지 않는다.

## 자주 묻는 질문

**돈을 더 안전하게 보내는 앱인가요?** 아니요. 지갑은 계약 거래에 서명하고 네트워크 수수료를 지불합니다. 앱은 사용자 자금을 보관하거나 전송하지 않습니다.

**사용 기록이 있으면 지금 온 사람이 입장해도 되나요?** 아니요. 공개 소비 사실과 현재 제시자의 자격은 다릅니다. 현장 판단에 쓸 수 있는 소지자/세션 결합 인증을 제공하지 않습니다.

**누가 발급했는지 확인하나요?** 앱 배포자가 지정한 정책을 신뢰합니다. 그 정책 출처를 보여주지만 on-chain issuer 인증은 아닙니다.

**내보낸 JSON이 증명서인가요?** 서명되지 않은 저장 당시 관찰입니다. 누구나 편집할 수 있고, 최신 상태는 다시 읽어야 합니다. 인증·입장 판단에 사용하지 마세요.

**공개 조회 화면에서 지갑이나 Docker가 필요한가요?** 필요하지 않습니다. 거래·증명 생성 경로와 별개입니다. 실제 로컬망 거래 검수에는 Docker가 필요합니다.

검수 상태는 [진행표](./ENHANCEMENT_PROGRESS.md), 발표 내용은 [스크립트](./DEMO_SCRIPT.md), 신뢰 한계는 [SECURITY](../SECURITY.md)를 기준으로 삼는다.
