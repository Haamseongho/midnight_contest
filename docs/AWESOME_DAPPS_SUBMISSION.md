# Awesome Midnight dApps submission draft

This draft follows the official [contribution guide](https://github.com/midnightntwrk/midnight-awesome-dapps/blob/main/CONTRIBUTING.md) and [pull-request template](https://github.com/midnightntwrk/midnight-awesome-dapps/blob/main/.github/PULL_REQUEST_TEMPLATE/pull_request_template.md), last checked at upstream commit [`b386bd9`](https://github.com/midnightntwrk/midnight-awesome-dapps/tree/b386bd9f4d011eb676df62272cf97b4698ac8011) on 2026-09-25. Re-check both immediately before submission because the upstream list can change.

## Target and placement

- Target section: `Identity & Privacy`
- Alphabetical position on the currently reviewed upstream `main`: after `ShadowVoice` and before `ZIP`
- Pull-request title: `Add Silent Pass to Identity & Privacy`

```md
- [Silent Pass](https://github.com/Haamseongho/midnight_contest) - One-time access-pass DApp that proves knowledge of a private secret while publishing only its commitment and claimed status on Midnight Network. - [Demo](https://haamseongho.github.io/midnight_contest/)
```

## Pull-request overview

Adds Silent Pass to the `Identity & Privacy` section. Silent Pass is an Apache-2.0-licensed one-time access-pass DApp with functional Compact code. A holder proves knowledge of a private secret while the Midnight Network contract exposes only the commitment and claimed status. The repository includes a public demo, security boundaries, automated contract tests, a public local-network transaction E2E run, and an actual Lace Preview deployment and claim.

## Submission checklist draft

- [x] Useful pull-request description prepared
- [x] Tests are provided
- [x] Key repository commits have useful messages
- [x] Project CI checks have succeeded, including all 20 automated tests, the production dependency audit, and local-network transaction E2E with initial DUST accrual handling ([run 36126468920](https://github.com/Haamseongho/midnight_contest/actions/runs/36126468920), commit `76d6610`)
- [x] Public GitHub Pages deployment succeeded for the same commit and the live app/proof assets returned HTTP 200 ([run 36126468936](https://github.com/Haamseongho/midnight_contest/actions/runs/36126468936))
- [ ] Self-review the final upstream one-line diff
- [ ] Request an upstream reviewer
- [x] Upstream README re-checked at `b386bd9` on 2026-09-25: entry remains unique and belongs after `ShadowVoice` and before `ZIP`
- [x] Project README and documentation are current
- [x] No new TODOs are introduced by the proposed entry

## Evidence to include

- Repository: <https://github.com/Haamseongho/midnight_contest>
- Public demo: <https://haamseongho.github.io/midnight_contest/>
- CI, production dependency audit, and local transaction E2E: <https://github.com/Haamseongho/midnight_contest/actions/runs/36126468920>
- Public GitHub Pages deployment: <https://github.com/Haamseongho/midnight_contest/actions/runs/36126468936>
- License: <https://github.com/Haamseongho/midnight_contest/blob/main/LICENSE>
- Security model: <https://github.com/Haamseongho/midnight_contest/blob/main/SECURITY.md>
- Browser wallet: Lace 2.4.0 DApp authorization and Preview connector handshake verified on 2026-09-24
- Preview transaction evidence: contract `66e374b0cafdf387576cf29bcd5de16fb010f0e92ea10d6e6f1e2d6c4b99256c`; deploy `0009965462a734559665acff00e767c2de22a4f18ce689c7045f94e4ce9b356c2e`; claim `0032856554b96a452286646176f4a0e689808d22615069eb9a498973493cee35dc`; final state `claimed = true`

## Gates before opening the pull request

1. Self-review the one-line upstream diff and obtain the user's approval before opening the pull request.
2. Request an upstream reviewer after the pull request is open.
3. Complete the upstream Contributor License Agreement if requested by its check.
