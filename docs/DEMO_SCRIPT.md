# Silent Pass demo script

This script demonstrates a private one-time event admission credential in about three minutes.

## Story

An organizer needs to admit one invited attendee without publishing the attendee's name or the invitation secret. The organizer deploys a commitment. The attendee receives the secret and contract address through a private channel. At check-in, the attendee proves knowledge of the secret once. The public state reveals only the commitment and whether the pass has been claimed.

## Browser-only walkthrough

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
- Do not describe the browser-only laboratory as an on-chain transaction.
- Do not claim an independent security audit.
- Do not claim Preview or Preprod verification without a published contract address and transaction evidence.
