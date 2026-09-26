# Final hardening — local candidate, not a released security claim

Base commit: `363064270e80d65834151ce07796616bf7680f01`. This note describes a local patch, not a completed public release or formal security audit.

## Changed
1. Unknown provider exceptions are classified into bounded, fixed UI messages rather than echoed verbatim. The handler does not intentionally call custom error getters or toString. This is data minimization, not a sandbox for hostile JavaScript already executing in the origin.
2. Local error fallbacks are bounded. A storage failure while cancelling remains BLOCKED and is caught by the UI; the operation tracker and submission hooks are unchanged.
3. Separate main/reviewer bootstrap entries render preparation/failure status. No automatic wallet operation, reload, storage reset or resend is introduced. READY is explicitly not a public-read result.
4. HTML declares no-referrer. No CSP/frame-ancestors enforcement is claimed; GitHub Pages response headers were not verified. A meta declaration cannot substitute for frame-ancestors response policy.
5. Historical evidence is separated from the future final release. `verify-submission-release.mjs` is a read-only metadata gate, not a proof of browser correctness.

## Do not infer
No contract/ABI/key/SDK major/lockfile changes. No issuer authentication, anonymous admission, credential recovery, expiry or revocation added. No public latency improvement measurement. No public push, merge, transaction or submission occurred.

## Original ZIP validation (historical)
37 Node tests passed in this environment (22 new hardening, 11 release-validator, 4 existing error tests). Eight controlled offline browser tests passed on the actual patched source handlers combined with the unchanged baseline runtime/circuit artifact. Global TypeScript isolated checks passed. These are not the complete upstream build or production import-closure validation.

Full Node24 install, Compact compile, Vite production build, all browser regressions (including six newly authored full-repo cases), actual public-origin Preview reads and Docker local E2E remain required. Run `npm run verify`, `BUILT_PREVIEW=1 npm run test:preview`, and `npm run test:local` in the documented full checkout. After user-authorized publication, use the release checker and inspect the actual public demo.

## Current full-checkout integration

The preceding limitations describe the ZIP author's environment, not the later
Node 24 checkout. See [FINAL_INTEGRATION_VALIDATION.md](./FINAL_INTEGRATION_VALIDATION.md)
for actual subsequent results, logs and remaining user gates, and
[the complete 36-file Markdown crosscheck](./FINAL_DOCUMENT_CROSSCHECK.md).
The integration also adds static inert startup guards (without locking the
independent reviewer link), preserves per-control disabled states, corrects the
contract-not-found message mapping, and verifies production startup/import
isolation through `npm run test:production` as part of `npm run verify`.

The original Preview runbook at commits `76d6610` and `f87aee3` does contain a
verification time: 2026-09-25 10:46 UTC / 19:46 KST, to the minute. The earlier
NOT_RECOVERED statement was a documentation-review omission, now corrected in
the recorded card and submission copy. This is an attributed document record,
not a new block timestamp or fresh Preview transaction.

## Safe replay/cancellation guidance
An unused/not-found public observation never proves the original transaction failed. Resolve its exact original transaction ID. Do not clear recovery storage or open a new tab to bypass unresolved operations. Cancellation before broadcast and a transaction already sent are distinct.

## Disclosure
Reproduction used synthetic sentinels and boundary doubles. No actual credential exfiltration or executable XSS was observed. Do not publish real secrets or user data in traces. Full browser traces may capture input data and must remain local/excluded.
