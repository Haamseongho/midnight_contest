# Awesome Midnight dApps readiness

Checked against the official `midnightntwrk/midnight-awesome-dapps` contribution guide.

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
- [x] Public CI runs the real local-network deployment and claim E2E ([successful run](https://github.com/Haamseongho/midnight_contest/actions/runs/35949433702))
- [x] Public GitHub Pages deployment confirmed at <https://haamseongho.github.io/midnight_contest/>
- [ ] Actual browser-wallet connection confirmed
- [ ] Preview or Preprod contract address and transaction identifiers published
- [x] Public-demo screenshot added to the README

## Submission-time requirements

- [x] Upstream pull-request title, entry, and template-aligned body prepared in [the submission draft](./AWESOME_DAPPS_SUBMISSION.md)
- [ ] Re-check the upstream list immediately before opening the pull request
- [ ] Fork `midnightntwrk/midnight-awesome-dapps` and add the entry after Preview evidence is complete
- [ ] Open one pull request for Silent Pass and request a reviewer
- [ ] Complete the Contributor License Agreement if the upstream check requests it

## Proposed list entry

Add alphabetically under **Identity & Privacy**:

```md
- [Silent Pass](https://github.com/Haamseongho/midnight_contest) - One-time access-pass DApp that proves knowledge of a private secret while publishing only its commitment and claimed status on Midnight Network. - [Demo](https://haamseongho.github.io/midnight_contest/)
```

Do not open the upstream pull request until the browser-wallet and public-network evidence items are checked and the public repository reflects the current verified state.
