# Awesome Midnight dApps submission draft

This draft follows the official [contribution guide](https://github.com/midnightntwrk/midnight-awesome-dapps/blob/main/CONTRIBUTING.md) and [pull-request template](https://github.com/midnightntwrk/midnight-awesome-dapps/blob/main/.github/PULL_REQUEST_TEMPLATE/pull_request_template.md), last checked at upstream commit [`b386bd9`](https://github.com/midnightntwrk/midnight-awesome-dapps/tree/b386bd9f4d011eb676df62272cf97b4698ac8011) on 2026-09-24. Re-check both immediately before submission because the upstream list can change.

## Target and placement

- Target section: `Identity & Privacy`
- Alphabetical position on the currently reviewed upstream `main`: after `ShadowVoice` and before `ZIP`
- Pull-request title: `Add Silent Pass to Identity & Privacy`

```md
- [Silent Pass](https://github.com/Haamseongho/midnight_contest) - One-time access-pass DApp that proves knowledge of a private secret while publishing only its commitment and claimed status on Midnight Network. - [Demo](https://haamseongho.github.io/midnight_contest/)
```

## Pull-request overview

Adds Silent Pass to the `Identity & Privacy` section. Silent Pass is an Apache-2.0-licensed one-time access-pass DApp with functional Compact code. A holder proves knowledge of a private secret while the Midnight Network contract exposes only the commitment and claimed status. The repository includes a public demo, security boundaries, automated contract tests, and a public local-network transaction E2E run.

## Submission checklist draft

- [x] Useful pull-request description prepared
- [x] Tests are provided
- [x] Key repository commits have useful messages
- [x] Project CI checks have succeeded, including the production dependency audit and local-network transaction E2E ([run 35958177446](https://github.com/Haamseongho/midnight_contest/actions/runs/35958177446))
- [ ] Self-review the final upstream one-line diff
- [ ] Request an upstream reviewer
- [ ] Confirm the upstream README entry is still unique and alphabetically placed
- [x] Project README and documentation are current
- [x] No new TODOs are introduced by the proposed entry

## Evidence to include

- Repository: <https://github.com/Haamseongho/midnight_contest>
- Public demo: <https://haamseongho.github.io/midnight_contest/>
- CI, production dependency audit, and local transaction E2E: <https://github.com/Haamseongho/midnight_contest/actions/runs/35958177446>
- License: <https://github.com/Haamseongho/midnight_contest/blob/main/LICENSE>
- Security model: <https://github.com/Haamseongho/midnight_contest/blob/main/SECURITY.md>
- Browser wallet: Lace 2.4.0 DApp authorization and Preview connector handshake verified on 2026-09-24; public transaction evidence remains pending

## Gates before opening the pull request

1. Publish the Preview contract address, deployment transaction identifier, and claim transaction identifier without publishing the pass secret or wallet address.
2. Confirm the final public state and replay rejection.
3. Re-run `npm run verify` and confirm the public CI and Pages deployment.
4. Complete the upstream Contributor License Agreement if requested by its check.
