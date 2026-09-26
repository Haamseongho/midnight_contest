# Silent Pass Preview deployment runbook

This runbook follows the current official Midnight Preview flow checked on
2026-09-25. Test-network transactions consume tDUST. The official funding path
is to receive free tNIGHT from the Preview faucet and register that tNIGHT for
tDUST generation inside Lace.

Official references:

- [Funding a wallet](https://docs.midnight.network/guides/acquire-tokens)
- [Networks and environments](https://docs.midnight.network/guides/networks-and-environments)
- [Proof server](https://docs.midnight.network/guides/run-proof-server)
- [DApp Connector API](https://docs.midnight.network/api-reference/dapp-connector)
- [Compatibility matrix](https://docs.midnight.network/relnotes/support-matrix)

## Prerequisites

- Chrome with the latest [Lace wallet](https://www.lace.io/) extension
- A dedicated Midnight test account on the `preview` network
- A funded unshielded Preview address beginning with `mn_addr_preview`
- Preview tNIGHT from the official
  [Preview faucet](https://midnight-tmnight-preview.nethermind.dev/)
- tNIGHT registered through Lace **Generate tDUST**, with a positive spendable
  tDUST balance
- Docker Desktop running a local proof server on `http://localhost:6300`
- The public [Silent Pass demo](https://haamseongho.github.io/midnight_contest/)
  or a verified local build

Never publish or share a recovery phrase, private key, wallet password, or pass
secret. A wallet address, contract address, commitment, transaction identifier,
and claimed status may be public; record only the minimum evidence needed.

## Verified environment

| Component | Verified value |
| --- | --- |
| Network | Preview |
| Lace | 2.4.0 |
| DApp Connector API | 4.0.1 |
| Midnight.js | 4.1.1 |
| Compact devtools / compiler | 0.5.1 / 0.31.1 |
| Local proof server | `midnightntwrk/proof-server:8.0.3` on port 6300 |

The component versions above match the pinned stack used by this repository.
Check the official compatibility matrix before changing any component.

## Start and verify the proof server

From the repository root:

```sh
docker compose -f devnet/compose.yml up -d proof-server
curl http://127.0.0.1:6300/health
```

The health response must report `ok`. Lace must use this local endpoint. The
proof server processes private circuit inputs, so do not replace it with an
untrusted remote server.

## Fund Lace and generate tDUST

1. In Lace, select the Midnight `Preview` account.
2. Copy the unshielded address beginning with `mn_addr_preview`.
3. Open the official Preview faucet, paste only that public address, complete
   the faucet request, and wait for the tNIGHT balance to appear.
4. In Lace's Midnight account, choose **Generate tDUST**.
5. Confirm that Lace has populated the Preview DUST address and shows the
   intended tNIGHT amount.
6. Choose **Review transaction**, verify the network and addresses, then approve
   the registration in Lace.
7. Wait until the tDUST tank shows a positive spendable balance. Holding tNIGHT
   alone is insufficient; registration is what starts tDUST generation.

The registration is a test-network transaction and must be reviewed and
approved by the wallet owner. Silent Pass never needs the wallet password or
recovery phrase.

## Deploy and claim Silent Pass

1. Open the public demo in the same Chrome profile as Lace.
2. In **지갑·네트워크 실험**, select **Preview** and choose **지갑 연결**.
3. Approve only the Silent Pass connection request in Lace. Confirm the app
   reports `preview 연결됨`.
4. Choose **비밀값 생성** and save the 64-character secret in a private,
   authenticated channel. Never paste it into a public issue, screenshot, or
   evidence document.
5. Choose **지갑으로 배포**, review the transaction, and approve it in Lace.
6. Record the public contract address and deployment transaction identifier.
7. Query the saved contract address and verify that the public state is unused.
8. Enter one deliberately incorrect secret and verify that it is rejected.
9. Enter the correct secret, choose **지갑으로 사용**, and approve the claim.
10. Record the claim transaction identifier and verify `사용 완료`.
11. Try the same claim again and verify that replay is rejected.

Each registration, deployment, and claim approval is a separate transaction.
Do not approve a transaction whose network, address, or purpose differs from the
step being demonstrated.

## Recovery when Lace remains on `Sending`

1. Do not immediately send the same transaction again while its result is
   unknown.
2. Check Lace **Activity**, Preview synchronization, and the tDUST balance.
3. Confirm the local proof server still returns a healthy response and inspect
   its logs for a proving request.
4. Reconnect Silent Pass on the same network to check the original transaction
   ID. Reconnecting alone does not authorize a new send.
5. If submission may have occurred, reconcile the original transaction ID's
   final result. A timeout, missing transaction or unused public state is not
   evidence that the original transaction failed. Do not clear recovery storage
   or switch tabs to bypass an unresolved operation.

## Historical public evidence — 2026-09-25

These are the original document's observations, not validation of a later UI
or a new deployment. The verification time below has minute precision; it is
not an independently established block-inclusion timestamp.

| Field | Verified value |
| --- | --- |
| Wallet connection | Lace 2.4.0 Preview connector handshake verified |
| Preview tNIGHT | Present in the selected test account; address omitted |
| Preview tDUST | Registration completed in Lace on 2026-09-25; positive and refilling |
| Contract address | `66e374b0cafdf387576cf29bcd5de16fb010f0e92ea10d6e6f1e2d6c4b99256c` |
| Deployment transaction ID | `0009965462a734559665acff00e767c2de22a4f18ce689c7045f94e4ce9b356c2e` |
| Claim transaction ID | `0032856554b96a452286646176f4a0e689808d22615069eb9a498973493cee35dc` |
| Final public state | `claimed = true` (`사용 완료`) |
| Verified at (UTC) | 2026-09-25 10:46 UTC |
| Public explorer links | Not published: no official Preview explorer URL was verified |

The repository's local `undeployed` E2E already verifies deployment, wrong-secret
rejection, successful claim, replay rejection, and the DApp Connector application
path. It is development evidence, not a substitute for the Preview fields above.

The successful registration screen reported `All done`, designated the selected
wallet's own Preview DUST address, and showed a zero tDUST fee. The address is
intentionally omitted. The later deployment and claim records above independently
prove the Silent Pass transaction path on Preview. The app read the final state
back from the Preview indexer and cleared both secret inputs; the secret and wallet
address were not recorded.
