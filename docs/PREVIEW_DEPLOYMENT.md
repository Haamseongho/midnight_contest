# Preview deployment runbook

This runbook is intentionally incomplete until a real browser wallet approves the transactions. Do not mark the deployment as verified or publish an address until every evidence field below is filled from the Preview network.

## Official prerequisites

- The latest [Lace browser extension](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk), which the official Midnight examples use for DApp Connector integration
- The wallet set to the `preview` network
- Preview tNIGHT obtained from the [official Preview faucet](https://faucet.preview.midnight.network)
- A CIP-30-compatible Cardano wallet holding NIGHT and enough ADA for the registration transaction, as required by the official [Preview DUST Generator](https://dust.preview.midnight.network)
- A compatible Midnight wallet with a valid recipient DUST address for the Cardano-to-Midnight mapping
- Sufficient DUST for contract deployment and the claim transaction
- The local proof server from this repository running at `http://127.0.0.1:6300` with the pinned `midnightntwrk/proof-server:8.0.3` image
- Current network/package compatibility checked against the official [Midnight compatibility matrix](https://github.com/midnightntwrk/midnight-sdk/blob/main/COMPATIBILITY.md)

The official [`create-mn-app` guide](https://github.com/midnightntwrk/create-mn-app#deploy-to-preview-and-preprod) documents Preview as the shared public test network and describes the faucet-funded setup flow.

The Preview DUST Generator's current FAQ states that registration maps the Cardano address holding NIGHT to a recipient DUST address on Midnight, incurs a Cardano network fee in ADA, and may take at least 2.5 hours after successful registration before DUST appears. A Midnight tNIGHT balance alone does not prove that the Cardano NIGHT and ADA prerequisites are satisfied.

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
- Before DUST registration, verify the selected Cardano address, its NIGHT and ADA balances, and the recipient Midnight DUST address. Registration is a Cardano transaction and cannot be reversed by this project.

## Deployment procedure

1. Install Lace from its official website or the linked Chrome Web Store listing; verify the publisher before installing.
2. Choose **Create new wallet**, enable Midnight, and create a dedicated test wallet. Write the recovery words down offline and never share them with this project or any assistant.
3. In Lace, select the Midnight **Preview** network and copy the wallet's Preview address.
4. Start the proof server with `docker compose -f devnet/compose.yml up -d proof-server`, then confirm that Lace's local proof-server setting points to `http://localhost:6300`.
5. Open the official [Preview DUST Generator](https://dust.preview.midnight.network). Connect the Cardano side of the CIP-30 wallet and confirm that the selected address holds NIGHT plus enough ADA for a Cardano transaction.
6. Connect the compatible Midnight wallet or provide its valid DUST address, then carefully verify the Cardano source address and Midnight recipient mapping.
7. Approve the Cardano registration transaction only after checking both addresses and the network fee. Do not treat connection alone as successful registration.
8. After successful registration, allow at least 2.5 hours for DUST to appear, then confirm in Lace that the Preview Midnight account shows sufficient spendable tDUST.
9. Open the [public Silent Pass demo](https://haamseongho.github.io/midnight_contest/) in the same browser profile.
10. In **지갑·네트워크 실험**, select **Preview** and choose **지갑 연결**.
11. Generate and privately save a fresh secret, then choose **지갑으로 배포** and approve the request.
12. Record the contract address and deployment transaction identifier shown in **네트워크 공개 상태**.
13. Query the contract again, submit the correct secret, approve the claim, and record its transaction identifier.
14. Confirm that the public state is `사용 완료` and that a repeated claim is rejected.
15. Add only the public evidence below to this file and the readiness checklist.

## Recovery when Lace remains on `Sending`

1. Do not submit the same transaction again while the result is unknown.
2. Check Lace **Activity**, Preview synchronization, and the tDUST balance first.
3. Check whether the proof server received a `/prove` request. A healthy container alone does not prove that Lace reached it.
4. If no public transaction identifier, balance change, or proof request exists, reopen Lace and reconnect the DApp before preparing a new attempt.
5. If submission might have occurred, query the public contract state before retrying. A timeout is not proof that a transaction failed.

On 2026-09-24, one tDUST-generation attempt remained on `Processing transaction, generating zero-knowledge proof`. Lace 2.4.0 logged that it could not load the connected Midnight account wallet instance and that the Preview RPC WebSocket closed normally. The healthy local proof server received no proving request, and the wallet still showed zero tDUST. This attempt produced no public transaction evidence and is not counted as a successful Preview operation. Account identifiers, wallet addresses, and connector credentials are intentionally omitted.

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
