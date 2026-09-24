# Preview deployment runbook

This runbook is intentionally incomplete until a real browser wallet approves the transactions. Do not mark the deployment as verified or publish an address until every evidence field below is filled from the Preview network.

## Official prerequisites

- The latest [Lace browser extension](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk), which the official Midnight examples use for DApp Connector integration
- The wallet set to the `preview` network
- Preview tNIGHT obtained from the [official Preview faucet](https://faucet.preview.midnight.network)
- Sufficient DUST for contract deployment and the claim transaction
- The local proof server from this repository running at `http://127.0.0.1:6300` with the pinned `midnightntwrk/proof-server:8.0.3` image
- Current network/package compatibility checked against the official [Midnight compatibility matrix](https://github.com/midnightntwrk/midnight-sdk/blob/main/COMPATIBILITY.md)

The official [`create-mn-app` guide](https://github.com/midnightntwrk/create-mn-app#deploy-to-preview-and-preprod) documents Preview as the shared public test network and describes the faucet-funded setup flow.

## Browser-wallet connection evidence

| Field | Verified value |
| --- | --- |
| Wallet | Lace 2.4.0 |
| Network | Preview |
| DApp authorization | Approved for the public Silent Pass demo |
| Connector result | Public demo reported `preview 연결됨` |
| Verified on | 2026-09-24 (KST) |

This proves only the browser-wallet authorization and connector handshake. It does not prove a Preview deployment or claim transaction; those remain pending in the public evidence table below.

## Safety rules

- Use a dedicated test wallet; never use a production recovery phrase.
- Never paste a wallet seed, recovery phrase, private key, or the Silent Pass secret into an issue, commit, screenshot, or chat.
- Publish only the contract address, public transaction identifiers, network name, UTC timestamp, and public claimed status.
- Verify that the wallet reports `preview` before approving each transaction.

## Deployment procedure

1. Install Lace from its official website or the linked Chrome Web Store listing; verify the publisher before installing.
2. Choose **Create new wallet**, enable Midnight, and create a dedicated test wallet. Write the recovery words down offline and never share them with this project or any assistant.
3. In Lace, select the Midnight **Preview** network and copy the wallet's Preview address.
4. Start the proof server with `docker compose -f devnet/compose.yml up -d proof-server`, then confirm that Lace's local proof-server setting points to `http://localhost:6300`.
5. Fund that address through the official faucet, open the tNIGHT token in Lace, choose **Generate tDUST**, and confirm the wallet transaction. If Lace directs you to the official [Preview DUST interface](https://dust.preview.midnight.network), follow that wallet flow instead.
6. Wait until the wallet is fully synchronized and shows spendable tNIGHT and sufficient DUST.
7. Open the [public Silent Pass demo](https://haamseongho.github.io/midnight_contest/) in the same browser profile.
8. In **지갑·네트워크 실험**, select **Preview** and choose **지갑 연결**.
9. Generate and privately save a fresh secret, then choose **지갑으로 배포** and approve the request.
10. Record the contract address and deployment transaction identifier shown in **네트워크 공개 상태**.
11. Query the contract again, submit the correct secret, approve the claim, and record its transaction identifier.
12. Confirm that the public state is `사용 완료` and that a repeated claim is rejected.
13. Add only the public evidence below to this file and the readiness checklist.

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
