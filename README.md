# Silent Pass

[![CI](https://github.com/Haamseongho/midnight_contest/actions/workflows/ci.yml/badge.svg)](https://github.com/Haamseongho/midnight_contest/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

This project is built on the Midnight Network.

**한 줄 설명:** 비밀값을 공개하지 않고 일회용 행사 입장 자격을 증명하는 Midnight DApp.

Silent Pass is a privacy-preserving bearer credential for one-time event admission. An organizer publishes a commitment, privately gives an attendee the secret and contract address, and lets a verifier confirm the pass exactly once without putting the secret or attendee name on the public ledger.

- Repository: <https://github.com/Haamseongho/midnight_contest>
- Public demo: <https://haamseongho.github.io/midnight_contest/>
- Category: `Identity & Privacy`
- Contract: Compact language 0.23, compiler 0.31.1
- SDK: Midnight.js 4.1.1 and DApp Connector API 4.0.1
- License: [Apache-2.0](./LICENSE)

![Silent Pass public demo](./docs/silent-pass-demo.png)

## Real-world use case

Event organizers often need to distribute invitation codes while avoiding a public attendee list. A normal on-chain code would reveal the credential and allow observers to copy it. Silent Pass instead treats the secret as a transferable bearer credential:

1. **Organizer:** generates a random 32-byte secret and deploys only its Compact commitment.
2. **Attendee:** receives the contract address and secret through a private authenticated channel.
3. **Verifier:** accepts a zero-knowledge claim and reads the public `claimed` state to prevent reuse.

The current prototype deploys one pass per contract. The same primitive can support private invitations, one-time claim codes, pickup authorizations, or recovery handoffs. It does not hide wallet identity or transaction metadata.

## Why Midnight

| Requirement | Silent Pass implementation |
| --- | --- |
| Keep the credential private | `secret: Bytes<32>` remains a private circuit argument |
| Make verification public | The ledger stores `persistentHash(secret)` and `claimed` |
| Reject forged passes | `claim` asserts that the supplied secret matches the commitment |
| Prevent replay | A successful claim sets `claimed = true`; later claims fail |
| Submit a real transaction | Midnight.js connects proof generation, wallet balancing, submission, and indexer reads |

## Quick start

Requirements:

- Node.js 24.11.1 or newer
- npm
- Compact devtools 0.5.1 with compiler 0.31.1
- A DApp Connector 4.x wallet for browser-wallet testing
- Docker Desktop and Compose for the local-network integration test

The pinned development stack follows the official
[`example-bboard`](https://github.com/midnightntwrk/example-bboard/tree/38bfac8c574abb0c5a96c9e076779716c3e88231)
reference: Midnight.js 4.1.1, Compact runtime 0.16.0, DApp Connector API
4.0.1, local node 0.22.3, indexer 4.0.1, and proof server 8.0.3. Check
the official [compatibility matrix](https://github.com/midnightntwrk/midnight-sdk/blob/main/COMPATIBILITY.md)
before changing any one component independently.

Install the Compact toolchain with the [official installation guide](https://docs.midnight.network/getting-started/installation), then verify the pinned compiler:

```sh
compact update 0.31.1
compact --version
compact compile --version
```

Build, test, and run the browser demo:

```sh
npm ci
npm run verify
npm run dev
```

Open the local URL printed by Vite. In **입장 패스 실험실**:

1. Generate a pass.
2. Copy the displayed secret.
3. Change one hexadecimal character and confirm that the claim is rejected.
4. Enter the correct secret and confirm that the public state changes to `사용 완료`.

The browser-only laboratory executes JavaScript generated from the compiled Compact contract. It demonstrates circuit behavior but does not submit a blockchain transaction.

## Network transaction demo

The **지갑·네트워크 실험** section implements the DApp Connector 4.x path for Preview, Preprod, and the local `undeployed` network. It supports wallet connection, deployment, public-state lookup, and claiming an existing contract after reconnection.

For a reproducible local transaction test:

```sh
docker compose -f devnet/compose.yml up -d
docker compose -f devnet/compose.yml ps
npm run test:local
docker compose -f devnet/compose.yml stop
```

The local configuration exposes the node at `127.0.0.1:9944`, indexer at `127.0.0.1:8088`, and proof server at `127.0.0.1:6300`. The integration test uses the official public genesis seed only on the disposable `undeployed` network. Never reuse that seed on a public network.

See [the three-minute demo script](./docs/DEMO_SCRIPT.md) for a reviewer-oriented walkthrough. The remaining public-network verification is tracked in the [Preview deployment runbook](./docs/PREVIEW_DEPLOYMENT.md).

## Architecture

```text
Organizer browser
  ├─ random 32-byte secret (private)
  └─ persistentHash(secret)
             │
             ▼
Midnight contract ledger
  ├─ commitment: Bytes<32> (public)
  └─ claimed: Boolean (public)
             ▲
             │ zero-knowledge claim
Attendee wallet + proof provider
  └─ secret: Bytes<32> (private circuit input)
```

| Component | Responsibility |
| --- | --- |
| `contract/src/silent-pass.compact` | Commitment construction, secret verification, and replay prevention |
| `src/main.ts` | Browser-only circuit demonstration and network interaction UI |
| `src/network/midnight.ts` | Wallet discovery, providers, deploy/join/read/claim operations |
| `src/network/private-state.ts` | Session-scoped contract private state provider |
| `scripts/local-e2e.mjs` | Real local deployment, proof generation, claim, replay rejection, and connector-path test |
| `devnet/compose.yml` | Local node, indexer, and proof-server configuration |

Generated contract bindings and proof artifacts are intentionally excluded from Git. `npm run build` recompiles the contract and synchronizes browser proof assets before TypeScript checking and the Vite production build.

## Privacy boundary

| Private or local | Public or observable |
| --- | --- |
| 32-byte pass secret | Contract address |
| Secret delivery channel | Commitment |
| Attendee name, unless disclosed elsewhere | Claimed status |
| Browser input after it is cleared by the app | Transaction and wallet metadata |

The proof provider or connected wallet may process the private circuit input. This project does not send the secret to an application server, but it cannot guarantee how third-party wallet or proving services handle it. The operating-system clipboard may retain copied secrets.

Read [SECURITY.md](./SECURITY.md) for the threat model, disclosure process, trust boundaries, and known limitations.

## Verification evidence

The standard verification command is:

```sh
npm run verify
```

It performs:

- Compact contract compilation with compiler 0.31.1
- Proof-key and ZKIR synchronization checks
- TypeScript static checking
- Vite production build
- Production dependency audit at high severity or above
- Contract-state and privacy-invariant tests
- Wrong-secret and replay-rejection tests
- Repository attribution and license checks

`npm run test:local` separately verifies actual local-network deployment and claim transactions through both the direct SDK and the application's DApp Connector route.

### Current verified state

- Contract compilation, production build, and automated tests pass locally.
- The public GitHub Pages demo and its proving-key/ZKIR asset paths return HTTP 200.
- A fresh clone has previously reproduced `npm ci`, `npm run build`, and `npm test`.
- Local `undeployed` transactions have verified deployment, proof generation, state reads, wrong-secret rejection, a successful claim, and replay rejection.
- The connector application path has been exercised with the official local test-wallet adapter, including reconnecting to an existing contract.
- Public [GitHub Actions run 35958508985](https://github.com/Haamseongho/midnight_contest/actions/runs/35958508985) passed both `verify` and `local-e2e` for commit `9cac9e5`; the former includes the production dependency audit, and the latter started the pinned Midnight Docker stack and exercised the direct SDK and DApp Connector application paths.
- Public [GitHub Pages run 35958508991](https://github.com/Haamseongho/midnight_contest/actions/runs/35958508991) deployed the same `9cac9e5` commit successfully.
- Lace 2.4.0 browser-extension approval and the Preview DApp Connector 4.x handshake were verified on 2026-09-24; the public demo reported `preview 연결됨` after the user approved the DApp.
- Preview/Preprod deployment and transaction submission are not yet verified. No public-network contract address or transaction identifier is claimed until that evidence exists.

## Known limitations

- One pass requires one contract deployment.
- Passes have no expiry, revocation, recipient binding, or recovery flow.
- Anyone who learns the secret can claim the pass; this transferability is intentional.
- The browser-only laboratory is a local circuit demonstration, not a network transaction.
- The project has not received an independent security audit.
- The initial bundle includes Midnight WebAssembly runtimes and is larger than a typical static website.

## Awesome Midnight dApps readiness

The repository follows the official [Awesome Midnight contribution guide](https://github.com/midnightntwrk/midnight-awesome-dapps/blob/main/CONTRIBUTING.md):

- Apache-2.0 license
- Exact ecosystem attribution sentence near the top of this README
- Functional Compact code and a reproducible build
- A factual real-world Midnight Network use case
- Security limitations and upstream credits
- CI workflow and reviewer demo script

Remote-only and deployment checks are tracked in [the readiness checklist](./docs/AWESOME_DAPPS_CHECKLIST.md). The proposed list entry is:

```md
- [Silent Pass](https://github.com/Haamseongho/midnight_contest) - One-time access-pass DApp that proves knowledge of a private secret while publishing only its commitment and claimed status on Midnight Network.
```

The exact upstream placement and pull-request draft are recorded in [the submission draft](./docs/AWESOME_DAPPS_SUBMISSION.md).

## Upstream attribution

- Built with the [Midnight Compact compiler](https://github.com/midnightntwrk/compact) and official Midnight.js packages.
- Browser-wallet and local-stack versions follow the official [Bulletin Board DApp reference](https://github.com/midnightntwrk/example-bboard/tree/38bfac8c574abb0c5a96c9e076779716c3e88231).
- The local Docker topology and test approach follow the Apache-2.0-licensed [Midnight Local Dev](https://github.com/midnightntwrk/midnight-local-dev) project.
- Continuous integration uses the official [Setup Compact Action](https://github.com/midnightntwrk/setup-compact-action).
- Version compatibility follows the official [support matrix](https://docs.midnight.network/relnotes/support-matrix).

## Contributing and license

See [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a change. Silent Pass is licensed under the [Apache License 2.0](./LICENSE).
