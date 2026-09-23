# Preview deployment runbook

This runbook is intentionally incomplete until a real browser wallet approves the transactions. Do not mark the deployment as verified or publish an address until every evidence field below is filled from the Preview network.

## Official prerequisites

- The latest [Lace browser extension](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk), which the official Midnight examples use for DApp Connector integration
- The wallet set to the `preview` network
- Preview tNIGHT obtained from the [official Preview faucet](https://faucet.preview.midnight.network)
- Sufficient DUST for contract deployment and the claim transaction
- Current network/package compatibility checked against the official [Midnight compatibility matrix](https://github.com/midnightntwrk/midnight-sdk/blob/main/COMPATIBILITY.md)

The official [`create-mn-app` guide](https://github.com/midnightntwrk/create-mn-app#deploy-to-preview-and-preprod) documents Preview as the shared public test network and describes the faucet-funded setup flow.

## Safety rules

- Use a dedicated test wallet; never use a production recovery phrase.
- Never paste a wallet seed, recovery phrase, private key, or the Silent Pass secret into an issue, commit, screenshot, or chat.
- Publish only the contract address, public transaction identifiers, network name, UTC timestamp, and public claimed status.
- Verify that the wallet reports `preview` before approving each transaction.

## Deployment procedure

1. Install Lace from its official website or the linked Chrome Web Store listing; verify the publisher before installing.
2. Choose **Create new wallet**, enable Midnight, and create a dedicated test wallet. Write the recovery words down offline and never share them with this project or any assistant.
3. In Lace, select the Midnight **Preview** network and copy the wallet's Preview address.
4. Fund that address through the official faucet, then generate/activate DUST in Lace (or the official Preview DUST interface if Lace directs you there).
5. Wait until the wallet is fully synchronized and shows spendable tNIGHT and sufficient DUST.
6. Open the [public Silent Pass demo](https://haamseongho.github.io/midnight_contest/) in the same browser profile.
7. In **지갑·네트워크 실험**, select **Preview** and choose **지갑 연결**.
8. Generate and privately save a fresh secret, then choose **지갑으로 배포** and approve the request.
9. Record the contract address and deployment transaction identifier shown in **네트워크 공개 상태**.
10. Query the contract again, submit the correct secret, approve the claim, and record its transaction identifier.
11. Confirm that the public state is `사용 완료` and that a repeated claim is rejected.
12. Add only the public evidence below to this file and the readiness checklist.

## Public evidence

| Field | Verified value |
| --- | --- |
| Network | Pending |
| Contract address | Pending |
| Deployment transaction ID | Pending |
| Claim transaction ID | Pending |
| Final public state | Pending |
| Verified at (UTC) | Pending |
| Public explorer links | Pending |

## Current local evidence

`npm run test:local` has already verified deployment, a wrong-secret rejection, a successful claim, replay rejection, and the DApp Connector application path against the disposable local `undeployed` network. This is development evidence only and is not a substitute for the Preview evidence above.
