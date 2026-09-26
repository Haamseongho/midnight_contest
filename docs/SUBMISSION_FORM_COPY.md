# Silent Pass — 실제 제출폼용 원고

상태: **LOCAL CANDIDATE · NOT SUBMITTED**. 작성일 2026-09-26 KST.
로컬 패치는 `dev_haams`에 적용되어 있지만, 이 원고는 새 commit·공개 배포·접수 완료를 주장하지 않는다. 패치 후 실제 결과는 [로컬 통합 검증 기록](FINAL_INTEGRATION_VALIDATION.md), 최종 확인은 [GO Sheet](FINAL_GO_SHEET.md), 사용자 실행 순서는 [제출 순서](USER_SUBMISSION_STEPS.md)를 따른다.

## 실제 폼에서 확인한 항목

2026-09-26 KST [공식 페이지](https://www.hackathon.midnightkorea.org/kor)의 **프로젝트 제출하기**에서 열린 [Tally 폼](https://tally.so/popup/Np20VW)을 입력 없이 확인했다. 필수 여부는 화면의 `*` 표시와 DOM의 `aria-required`를 읽은 결과이며, 최종 Submit 검증 결과는 아니다. 값 입력·체크·파일 첨부·Submit은 하지 않았다.

| 실제 폼 항목 | 필수 여부 | 넣을 내용 |
|---|---|---|
| 팀/프로젝트명 | 필수 | 프로젝트명 `Silent Pass`. 등록 팀명이 따로 있으면 사용자 확인 후 함께 표기 |
| 참가 형태 | 필수 | 실제 등록에 맞게 `개인 Individual` 또는 `팀 Team` 선택 |
| 소속/이름 | 필수 | 모든 팀원의 이름·이메일·직책. Luma 등록정보와 일치해야 함 |
| 대표 연락처 | 필수 | 실제 이메일 또는 Discord 연락처 |
| Public GitHub repo 링크 | 필수 | `https://github.com/Haamseongho/midnight_contest` |
| `midnightntwrk` 토픽 추가 확인 | 필수 | 실제 토픽을 확인한 뒤 사용자가 체크 |
| 프로젝트 소개 | 필수 | 아래 「프로젝트 소개 — 복사할 본문」 |
| Midnight 구현 포인트 | 필수 | 아래 「Midnight 구현 포인트 — 복사할 본문」 |
| Project Deck | 선택 | 실제 Google Slides URL이 있을 때만 입력 |
| Demo Video | 선택 | 실제 영상 URL이 있을 때만 입력. 3분 이내 권장 |
| Demo URL | 선택 | 최종 공개 검수 후 `https://haamseongho.github.io/midnight_contest/` |
| Explorer/Scholar 단계별 증서 | 선택 | 실제 취득한 증서만 첨부. 파일 10 MB 제한 표시 |

선택 항목은 확인 당시 DOM에서 `aria-required=false`였다. 별도 한 줄 설명, Problem, Solution, Privacy, 카테고리 입력칸이나 지갑 주소 입력칸은 보이지 않았다. 내용을 아래 두 본문으로 합쳤다. 용도 불명의 이름 없는 `Untitled` 링크 필드도 보였으므로 임의의 URL을 넣지 않는다.

DOM에는 `maxlength`가 없었다. 서버 측 길이 제한은 미확인이므로 입력 시 오류가 있으면 의미를 유지하며 줄인다. 공식 공지는 트랙 구분 없이 심사한다고 안내하므로 `Identity & Privacy`를 필수 공식 트랙으로 입력하지 않는다. Luma 신청 완료자가 제출 대상이며 Local Devnet/Preview/Preprod 모두 허용한다.

2026-09-26 GitHub 공개 API에서 저장소의 public 상태와 `midnightntwrk` 토픽을 확인했다. 당시 토픽은 `compact`, `dapp`, `midnightntwrk`, `privacy`, `zero-knowledge`였다. 제출 시점에 다시 확인하고 체크한다.

## 프로젝트 소개 — 복사할 본문

Silent Pass는 초대 비밀값을 공개 원장에 올리지 않고 일회용 사용 기록을 남기는 Midnight 프로토타입입니다. 전달 가능한 초대 코드를 원장에 그대로 공개하면 다른 사람이 복사해 사용할 수 있습니다. 이 프로젝트는 비밀값을 아는 소지자의 사용 요청과 확인자가 알아야 하는 공개 사용 상태를 분리합니다.

소지자는 비밀 입력으로 패스를 한 번 사용하고, 확인자는 별도 페이지에서 앱에 고정된 Preview 계약의 공개 상태를 지갑 연결이나 비밀값 전달 없이 조회합니다. 핵심 기능은 비밀값 확인, 일회용 사용 처리, 재사용 거절, 공개 상태 조회와 서명 없는 관찰 기록 내보내기입니다. 시연은 확인자 페이지의 공개 조회 → 전체 데모의 잘못된 비밀값 거절·정상 사용·재사용 거절 회로 실행 → 과거 Preview 거래 기록 확인 순서입니다. 현재 조회, 브라우저에서 실행한 회로와 과거 네트워크 거래는 서로 다른 증거로 표시하며, 조회 실패는 UNKNOWN으로 남깁니다.

이는 일회용 사용 원리를 검토하는 제한된 데모입니다. 화면을 보여주는 사람의 신원이나 입장 자격을 인증하지 않으며, 티켓 발급·전달·운영까지 갖춘 서비스는 아닙니다. 실제 운영에는 발급자 인증, 안전한 비밀값 전달과 별도의 입장 판단 절차가 필요합니다.

## Midnight 구현 포인트 — 복사할 본문

Compact 계약은 공개 원장에 32바이트 commitment와 claimed 상태를 저장합니다. 패스는 무작위 32바이트 비밀값으로 준비하며, claim 회로는 아직 사용되지 않았는지와 비밀 입력의 persistent hash가 저장된 commitment와 일치하는지를 검사한 뒤 claimed를 참으로 바꿉니다. 잘못된 비밀값과 두 번째 사용 요청은 거절됩니다. 비밀값 자체는 공개 원장 필드에 저장하지 않습니다. 공개적으로 공유할 사용 기록과 공개하면 안 되는 전달 가능한 비밀값을 분리해야 한다는 점이 프라이버시가 필요한 이유입니다.

Midnight.js는 계약 배포, 증명 생성, 지갑의 거래 잔액 조정, 제출과 공개 상태 해석을 연결합니다. 확인자 페이지는 앱이 지정한 Preview 계약의 공개 데이터를 읽으며 지갑 연결·비밀값·서명·거래를 요청하지 않습니다. 계약 주소, commitment, 사용 상태와 거래 식별자는 공개될 수 있고, 지갑·네트워크 메타데이터도 관찰될 수 있습니다. 소지자의 지갑이나 증명 제공자는 비밀 회로 입력을 처리할 수 있습니다. 확인자는 앱 배포자와 설정된 공개 indexer를 신뢰하며, 내려받은 관찰 기록은 수정 가능한 서명 없는 스냅샷입니다. 과거 Preview 거래, 현재 공개 조회, 로컬 회로 실행, 로컬 개발망 거래 테스트와 배포 정보는 각각 구분합니다. 결과가 불명확한 거래는 원래 거래 ID의 최종 결과를 확인하며, 시간 초과나 미사용 상태만으로 실패를 확정해 재전송하지 않습니다.

## 사용자만 확정할 정보

참가 형태, 등록 팀명, 소속, 모든 팀원의 이름·이메일·직책과 대표 연락처는 실제 Luma 등록정보와 대조해서 직접 입력한다. 기존 문서의 기여자 이름만으로 등록 팀원을 확정하지 않는다. 이메일 검색 누락은 미등록 증거가 아니다. 실제 등록 완료 여부와 별도 등록 종료시각은 미확인이다.

없는 선택 자료는 비워 두며, `USER TO FILL`, 예시 이메일, 임시 URL 같은 placeholder를 제출하지 않는다. 아래 영문 항목과 한 줄 요약은 발표·추가 자료용 참고이며 실제 폼의 별도 입력칸을 뜻하지 않는다.

## 참고 원고

## Project Name
Silent Pass

## One-line Description
One-time secret-based redemption on Midnight, with a wallet-free view of a pinned public consumption record.

## One-line Description Korean
초대 비밀값은 원장에 공개하지 않고, 지정 계약의 일회용 사용 기록을 지갑 없이 확인합니다.

## Short Description
Invitation codes are easy to share, but publishing the code itself on a shared ledger would expose a transferable credential. Silent Pass separates that secret from its consumption record. A holder uses a private input to consume a pass once on Midnight, while a reviewer reads a deployment-pinned contract without connecting a wallet or receiving the secret. The demonstration includes wrong-secret rejection, one successful claim, replay rejection, historical Preview transactions, and a clearly separate local circuit scenario. It also provides an unsigned snapshot of a public observation. This is a bounded prototype, not a ticketing or identity platform. It trusts the app publisher and public indexer; issuer authenticity, secret delivery, wallet metadata privacy, and admission decisions remain outside the contract's guarantees.

편집 기준 121 words — 공식 길이 제한은 미확인.

## Problem
Publishing a transferable invitation secret on a shared ledger would let others copy it. A reviewer may need the consumption record, not the secret itself.

## Solution
A Compact contract checks private knowledge of the secret and permits one consumption. A separate reviewer page reads a deployment-pinned public contract without asking for a wallet or the holder's secret.

## Why Midnight
Some workflows need a shared record of one-time redemption without publishing the bearer secret itself. Silent Pass makes that distinction concrete and inspectable: the holder uses the secret, while a reviewer sees the selected contract's consumption state. A conventional database and QR code may be simpler when everyone trusts one operator; this prototype does not claim universal superiority. Its value is a small, reproducible demonstration of Midnight's private-input and public-state model, with a wallet-free review path and explicit evidence boundaries. Real deployments would still need authenticated issuance, safe delivery, operational policies, and a separate decision about who is entitled to enter.

## How Midnight Is Used
Silent Pass uses a Compact contract with two public ledger fields: a 32-byte commitment and a claimed Boolean. A fresh pass is created from a random 32-byte secret. The claim circuit checks that the pass is unused and that the persistent hash of the private secret matches the stored commitment, then marks the pass as consumed. A second claim is rejected. The secret is not assigned to the public ledger, although the wallet or proving provider may process the private circuit input.

Midnight.js connects contract deployment, proof generation, wallet balancing, transaction submission, and public-state decoding. The dedicated reviewer page constructs only a public-data reader for an app-publisher-pinned Preview contract; it does not request a wallet, pass secret, signature, or transaction. Its observation is not issuer authentication or proof of the current presenter's identity.

Evidence is kept separate: historical Preview deployment and claim records; live public-indexer observations; browser execution of generated Compact circuits; local-devnet transaction tests; and build metadata. A downloaded observation is unsigned and may become outdated. Transaction recovery keeps an unresolved operation guarded and reconciles its original transaction identifier rather than treating an unused state or timeout as proof of failure.

편집 기준 192 words — 공식 길이 제한은 미확인.

## Privacy Model
The pass secret is a private circuit input, not a public ledger field. Contract addresses, commitments, claimed status, and transaction or wallet metadata can be observable. The holder must trust their browser, wallet, proof provider, and secret-delivery channel. The reviewer trusts the published application policy and its configured public indexer; the displayed request identifier is only a local observation label. It does not bind a holder to a verifier session. A downloaded report is an unsigned record of an observation, not a certificate, admission pass, issuer authentication, or guarantee of the current state. Clearing application inputs cannot reliably erase JavaScript memory, clipboard history, or external copies.

## What Is Public
Contract address, commitment, claimed state, transaction identifiers and potentially identifying wallet/network metadata. Public observations include a local request ID and observation time.

## What Is Private
The pass secret is not a public ledger field. The holder supplies it in their own environment. Their wallet or proving provider may process it; this is not a claim that no service ever receives the secret.

## Trust Boundary
The bundled context is chosen by the application publisher. It is not on-chain issuer authentication. A USED record does not authenticate the person presenting a screen, authorize admission, or prove a current challenge response. An unsigned export can be edited after download.

## Known Limitations
This prototype uses one contract per pass. Anyone who obtains the secret can consume it; the contract has no issuer authentication, recipient binding, expiry, revocation, or credential recovery. A consumed state does not authenticate the current presenter or authorize admission. The reviewer relies on the app publisher and public indexer, not a light-client proof. Transaction recovery is a same-tab safeguard, not cross-device coordination. Historical Preview evidence does not validate later UI changes. The project has not received a formal independent security audit and is not suitable for money, production credentials, or safety-critical access.

## Repository URL
https://github.com/Haamseongho/midnight_contest

## Demo URL
https://haamseongho.github.io/midnight_contest/

## Reviewer URL
https://haamseongho.github.io/midnight_contest/review.html

## Setup Instructions
```sh
npm ci
npx playwright install chromium
npm run verify
npm run dev
```
Node >=24.11.1 and the pinned Compact compiler 0.31.1 are required. Docker/Compose is additionally required for `npm run test:local`. Install from the repository's official-toolchain guide, not an arbitrary new major version.

## Demo Flow
1. Open the reviewer page without a wallet. Read the pinned context and request a public observation.
2. Explain USED/UNUSED/MISMATCH/UNKNOWN and the observation time; none is current-person admission approval.
3. On the full demo, run the disposable wrong-secret → correct-secret → replay circuit scenario.
4. Open Recorded example and distinguish historical Preview transactions from this local circuit run and the new read.
5. Optionally download the unsigned observation. On indexer failure, retain UNKNOWN and use the explicitly labelled historical example, not a fabricated live success.

## Built With
Compact language 0.23 / compiler 0.31.1, Compact runtime 0.16.0, Midnight.js 4.1.1, DApp Connector API 4.0.1, TypeScript, Vite, Playwright, GitHub Actions and Pages. Dependency versions are unchanged by the local candidate.

## Preview Evidence — historical, not a new patch result
Original document's recorded verification time: **2026-09-25 10:46 UTC (19:46 KST)**. This is the `Verified at (UTC)` entry in the source document at commit `76d6610acae4afd994fcfe8b5b34218f1d9f80b3`; it is not a transaction inclusion timestamp or a new independent verification of raw logs.
Contract: `66e374b0cafdf387576cf29bcd5de16fb010f0e92ea10d6e6f1e2d6c4b99256c`.
Deploy: `0009965462a734559665acff00e767c2de22a4f18ce689c7045f94e4ce9b356c2e`.
Claim: `0032856554b96a452286646176f4a0e689808d22615069eb9a498973493cee35dc`.
Original evidence commit: `76d6610acae4afd994fcfe8b5b34218f1d9f80b3`.
Source: https://github.com/Haamseongho/midnight_contest/blob/76d6610acae4afd994fcfe8b5b34218f1d9f80b3/docs/PREVIEW_DEPLOYMENT.md

## Localnet Evidence
The existing main CI run 36223346869 has a successful local-e2e job. It is evidence for base commit `363064270e80d65834151ce07796616bf7680f01`, not for this unpublished patch. After applying the patch, replace the final-release reference with the new verified run and preserve the old run as history.

패치 후 로컬 검증은 [통합 검증 기록](FINAL_INTEGRATION_VALIDATION.md)을 참조한다. 새 main CI/Pages는 사용자 원격 반영 후 별도로 확인한다.

## Security / Testing — conservative submission sentence
The repository provides contract tests, browser regressions and local-devnet transaction tests. This is a limited prototype with documented trust boundaries, not a formally audited or production-ready security system. The final submitted revision and its successful validation runs must be linked explicitly.

## Team Description — registered membership not verified
Confirm every participant's registered name, email, affiliation and role against Luma. Existing contributor descriptions do not establish registered team membership. Do not submit unverified names or contact details.

## Team Members
[USER TO FILL: all members' Luma-matching names, emails and roles. Do not submit this placeholder.]

## Contact
[USER TO FILL: actual contact email / required handle. Do not include secrets.]

## Team Name
[USER TO VERIFY: do not assume the project name is the registered team name.]

## Video URL
[OPTIONAL / NOT YET PROVIDED]

## Academy Certificate
[USER TO VERIFY: attach only certificates actually earned.]

## Final release links
FINAL_SUBMITTED_SHA = [NOT YET DEPLOYED / USER TO VERIFY]
FINAL_CI = [NOT YET RUN FOR PATCH]
FINAL_PAGES = [NOT YET RUN FOR PATCH]
Use `node scripts/verify-submission-release.mjs --out final-release-evidence.json` after release. A successful metadata check is not a browser functionality or submission check.
