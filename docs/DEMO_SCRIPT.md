# Silent Pass demo script

Opening: “초대의 비밀은 공개하지 않고, 그 초대가 한 번 사용됐는지는 함께 확인합니다.”

The contract proves private secret knowledge and one-time consumption. A public consumed record does not authenticate the issuer, current presenter, or an admission decision.

## Story

An organizer wants to track invitation consumption without publishing the secret. The organizer privately distributes a secret and contract address. The holder performs claim in their own environment. A reviewer reads the deployment-pinned public contract without a wallet or secret.

State the product boundary before the wallet flow: Silent Pass does not send, hold, or escrow funds. The wallet signs the contract transactions and pays network fees; it is not the subject of the private proof.

## Browser-only walkthrough

Use the four-step **처음이라면, 이 순서로 확인하세요** guide. Advance from roles to public read; wait for the result; advance to the actual circuit; run all three cases; then open the historical evidence. Failed reads do not unlock a live success: explicitly select **과거 예제로 진행 · live 성공 아님** after UNKNOWN/MISMATCH if using the fallback. Failed circuit runs never unlock the next step. Guide completion is not independent review, human narration or submission completion.

For a reviewer-only visit, use [review.html](https://haamseongho.github.io/midnight_contest/review.html). No private form or wallet connector is mounted there. An exported public observation is unsigned and can be edited by anyone; it is not admission evidence.

Start with **지갑 없이 공개 기록 확인**. Show the context source and current observation time. Then run **실제 회로의 실패와 성공 확인**, which executes wrong-secret → correct-secret → replay in an independent disposable session. Recorded example is historical evidence, not a live result.

The manual holder laboratory also supports:

1. Open the DApp and explain the three roles: organizer, attendee, and verifier.
2. Select **새 패스 생성** in the interactive laboratory.
3. Point out that the public view contains a commitment, not the displayed secret.
4. Copy the secret, alter one hexadecimal character, and submit it. Show that the claim is rejected and the public state remains unchanged.
5. Submit the correct secret. Show that `사용 여부` changes to `사용 완료` and the displayed secret is cleared.
6. Explain that a second claim is rejected by the contract.

## Network walkthrough

Use this only with a compatible DApp Connector 4.x wallet and funded test-network account.

1. Select Preview, Preprod, or the local `undeployed` network.
2. Connect the wallet and generate a fresh secret.
3. Copy the secret before deploying the contract.
4. Approve deployment and save the resulting contract address and deployment transaction identifier.
5. Reconnect, enter the saved address, and query the public state.
6. Try a wrong secret, then the correct secret, and finally a replay.
7. Record the contract address and both public transaction identifiers without recording the secret.

## Claims that should not be made

- Do not say that wallet identity or transaction metadata is hidden.
- Do not describe Silent Pass as a payment, remittance, or escrow application.
- Do not describe the browser-only laboratory as an on-chain transaction.
- Do not claim an independent security audit.
- Do not claim Preview or Preprod verification without a published contract address and transaction evidence.
- Do not claim world-first, anonymous admission, forged-ticket prevention, or on-chain issuer authentication.
- Do not describe `claimed=true` as approval for the current visitor.
- Do not call the browser scenario a ZK proof or a blockchain transaction.

## 30-second rehearsal

1. 0–8s: Explain the need to check consumption without publishing an invitation secret.
2. 8–18s: Press **공개 기록 새로 조회**. Show request ID/time and “사용 기록 있음”. Explain that this is consumption history, not admission approval.
3. 18–27s: Run the disposable circuit scenario. Show wrong-secret rejection, correct-secret success, then replay rejection.
4. 27–30s: Point to Recorded example and state the issuer/presenter boundary.

If the indexer is unavailable, keep the live result at UNKNOWN and open Recorded example with an explicit explanation. Do not promise a network response within the rehearsal time.

If transaction recovery storage is corrupt or inaccessible, show BLOCKED and keep read-only demonstrations available. Restore storage access/the original record and explicitly recheck; never delete the guard or retry in another tab. A missing record is not evidence that a transaction failed.

## Three-minute rehearsal

1. 0:00–0:30 — Organizer → holder → reviewer. The holder supplies a private input in their own environment; the reviewer never receives it.
2. 0:30–1:10 — Context source/version, network, contract, expected commitment and an actual Preview read. Explain the app publisher and indexer trust assumptions.
3. 1:10–1:50 — Run all three local scenarios and repeat. Show that a separately generated holder pass remains unused.
4. 1:50–2:20 — Open Recorded example: original code/documentation commits, contract, deploy/claim IDs, original date and CI. The historical source has no exact time; do not invent one.
5. 2:20–2:45 — Explain UNKNOWN, exact-ID recovery after reconnection, and pre-submit interruption. A missing transaction or an unclaimed read never authorizes automatic retry.
6. 2:45–3:00 — State limitations and show the reproduction commands and implementation evidence.

These are target-duration scripts, not a claim that a presentation video has been recorded. Click-through evidence is recorded separately in IMPLEMENTATION_EVIDENCE.md.

Use the in-app 30/180-second timer while actually speaking, then fill [HUMAN_VALIDATION.md](./HUMAN_VALIDATION.md). Automated clock tests validate the timer only, not a human rehearsal. [FEATURE_COMPARISON.md](./FEATURE_COMPARISON.md) is the one-page comparison/FAQ for presentation use.

## Reproduction commands

```sh
npm ci
npx playwright install chromium
npm run verify
npm run test:preview
docker compose -f devnet/compose.yml up -d --wait
npm run test:local
npm run dev
```

The DOM suite uses boundary doubles for network failures. The Preview read and local-network E2E use real services. Local E2E deliberately loses an already-broadcast transaction's reply, restores the tracker, reconnects and resolves the exact ID.
