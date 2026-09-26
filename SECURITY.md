# Security policy

Silent Pass is an experimental privacy-preserving access-pass DApp. It has not received an independent security audit and must not be used to protect money, production credentials, or safety-critical access.

## Supported version

The canonical release and public demo branch is `main`; development uses `dev_haams`. Pages only publishes main. Report the exact affected commit from the deployed `release.json`, not just the branch name.

## Reporting a vulnerability

Do not publish a secret, wallet seed, private key, or exploitable proof-of-concept in a public issue. Instead, use GitHub's private vulnerability reporting feature for this repository. Include the affected commit, reproduction steps, expected impact, and any suggested mitigation.

## Security properties

The contract is designed to provide these narrow guarantees:

- The public ledger contains a 32-byte commitment and a `claimed` flag, not the original pass secret.
- A claim succeeds only when `persistentHash(secret)` equals the stored commitment.
- A successful claim changes `claimed` to `true`; subsequent claims are rejected.
- The browser generates pass secrets with `crypto.getRandomValues(new Uint8Array(32))`.

These properties are covered by contract tests and a local-development-network integration test. They are not a claim of anonymity or production readiness.

## Trust boundaries and known limitations

- Anyone who obtains the secret can use the pass. The secret is a transferable bearer credential.
- The operating-system clipboard and the private channel used to deliver a secret are outside this project's control.
- A wallet, proof provider, browser extension, or local proof server may process the private circuit input. Review that provider's policy before using sensitive data.
- Contract addresses, transaction metadata, the commitment, and the final claimed state are public. Wallet or network metadata may identify a participant.
- The contract supports one pass per deployment. It has no expiry, revocation, recipient binding, or recovery mechanism.
- The interactive browser-only laboratory executes the compiled Compact circuit locally. It is not a blockchain transaction. Use the wallet/network section or `npm run test:local` for transaction-level validation.
- Historical Lace 2.4.0 Preview deployment and claim evidence is published in the README (2026-09-25). Preprod remains unverified. This historical evidence does not validate later UI changes.
- `claimed=true` proves consumption history, not the current presenter's identity or right of admission. The circuit has no issuer authentication, event/session binding, expiry, or revocation.
- The wallet-free reviewer trusts the app publisher's bundled context and the configured public indexer. Matching the expected commitment is not on-chain issuer authentication. Holder-controlled URLs/manifests are not accepted as policy.
- Timeouts leave transactions UNKNOWN. Exact transaction-ID reconciliation or late completion resolves the guard. Pre-submit cancellation prevents the app from submitting a late response; it does not cancel Lace's dialog. Post-submit operations cannot be cancelled by this app.
- Invalid/inaccessible recovery storage fails closed as BLOCKED without deleting or displaying raw records. Storage write failures block continuation before broadcast. Explicit storage retry preserves the same in-memory operation or restores a valid original record; removing a faulty record is not recovery. If no original metadata can be recovered, there is no automatic unlock or safe inferred failure. Public reads remain usable. This is a same-tab safeguard, not tamper-proof storage or cross-device coordination.
- Public operation metadata persists in sessionStorage for this tab only. It is not a cross-tab/device lock and can be lost when closing a tab or clearing browser data. A missing transaction or an unclaimed state is not sufficient evidence to retry.

## Secret-handling guidance

The dedicated `review.html` entry does not mount holder inputs or import the app's wallet/transaction/scenario modules. A production bundle audit checks this boundary. The public SDK still includes ledger/runtime decoding and the `wallet-sdk-address-format` encoding dependency; this is not a wallet connection. An unsigned public observation export uses an explicit allowlist, excludes wallet/secret data, records failures honestly, and is neither a certificate nor a current-state guarantee. It must not authorize admission. A new read invalidates the previous export until the current request settles.

- Generate a fresh secret for each pass.
- Share the secret and contract address over a private authenticated channel.
- Do not place secrets in screenshots, issues, logs, URLs, analytics, or repository files.
- After saving a pass through an appropriate private channel, **지우기** clears both displayed secret and claim input for that section. JavaScript strings cannot be reliably zeroized; an in-flight proof may retain its input until settlement. Clipboard and external copies are outside this control.
- Clear clipboard history after transferring a secret when the platform permits it.
- Never use the public local-devnet genesis seed on Preview, Preprod, or any network holding real assets.
