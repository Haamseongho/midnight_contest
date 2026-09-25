# Awesome Midnight dApps readiness

Checked against the official `midnightntwrk/midnight-awesome-dapps` contribution guide at upstream commit [`b386bd9`](https://github.com/midnightntwrk/midnight-awesome-dapps/tree/b386bd9f4d011eb676df62272cf97b4698ac8011) on 2026-09-25.

## Repository requirements

- [x] Public canonical GitHub repository
- [x] Functional Compact source
- [x] Reproducible build and automated tests
- [x] Genuine Midnight Network use case
- [x] Apache-2.0 license
- [x] Exact README attribution sentence
- [x] GitHub topic `midnightntwrk` confirmed on the remote repository
- [x] Optional GitHub topic `compact` confirmed on the remote repository
- [x] Upstream Midnight projects and packages credited
- [x] Factual proposed one-line list entry
- [x] Current upstream list checked; Silent Pass is not already listed
- [x] `Identity & Privacy` is the correct section
- [x] Entry wording follows the Midnight documentation style guidance
- [x] Exact alphabetical placement identified: after `ShadowVoice`, before `ZIP`

## Quality evidence

- [x] Browser-only happy path, wrong-secret rejection, and replay protection
- [x] Local-development-network deployment and claim integration test
- [x] DApp Connector 4.x application path covered by the local test adapter
- [x] Public/private data boundary documented
- [x] Threat model and known limitations documented
- [x] Continuous-integration workflow included
- [x] Public CI runs all 20 automated tests, the production dependency audit, plus real local-network deployment and claim E2E with initial DUST accrual handling ([successful run](https://github.com/Haamseongho/midnight_contest/actions/runs/36126468920), commit `76d6610`)
- [x] Public GitHub Pages deployment confirmed at <https://haamseongho.github.io/midnight_contest/>
- [x] Public GitHub Pages workflow succeeded for commit `76d6610` ([run 36126468936](https://github.com/Haamseongho/midnight_contest/actions/runs/36126468936)); the live app and proof assets returned HTTP 200
- [x] Actual Lace 2.4.0 browser-wallet authorization and Preview connector handshake confirmed (2026-09-24)
- [x] Preview tNIGHT registration completed in Lace and a positive tDUST balance confirmed (2026-09-25)
- [x] Deployment and claim stop before proof generation or submission when Lace reports zero tDUST
- [x] Preview contract address, deploy transaction, claim transaction, and final `claimed = true` state published in [the Preview runbook](./PREVIEW_DEPLOYMENT.md) (2026-09-25)
- [x] Public-demo screenshot added to the README

## Submission-time requirements

- [x] Upstream pull-request title, entry, and template-aligned body prepared in [the submission draft](./AWESOME_DAPPS_SUBMISSION.md)
- [x] Upstream `main` re-checked at commit [`b386bd9`](https://github.com/midnightntwrk/midnight-awesome-dapps/tree/b386bd9f4d011eb676df62272cf97b4698ac8011) on 2026-09-25: no Silent Pass duplicate; placement remains after `ShadowVoice` and before `ZIP`
- [ ] Fork `midnightntwrk/midnight-awesome-dapps` and add the entry after Preview evidence is complete
- [ ] Open one pull request for Silent Pass and request a reviewer
- [ ] Complete the Contributor License Agreement if the upstream check requests it

## Proposed list entry

Add alphabetically under **Identity & Privacy**:

```md
- [Silent Pass](https://github.com/Haamseongho/midnight_contest) - One-time access-pass DApp that proves knowledge of a private secret while publishing only its commitment and claimed status on Midnight Network. - [Demo](https://haamseongho.github.io/midnight_contest/)
```

The public-network evidence gate is complete. Before opening the upstream pull request, re-check the upstream list, confirm the final public CI and Pages runs, self-review the one-line diff, and obtain the user's action-time approval to publish the pull request.
