# Security policy

Silent Pass is an experimental privacy-preserving access-pass DApp. It has not received an independent security audit and must not be used to protect money, production credentials, or safety-critical access.

## Supported version

Security fixes are applied to the latest commit on `main`.

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
- Lace 2.4.0 authorization and the Preview connector handshake have been verified, but Preview and Preprod transaction operation remains unverified until a deployment record is added to the README.

## Secret-handling guidance

- Generate a fresh secret for each pass.
- Share the secret and contract address over a private authenticated channel.
- Do not place secrets in screenshots, issues, logs, URLs, analytics, or repository files.
- Clear clipboard history after transferring a secret when the platform permits it.
- Never use the public local-devnet genesis seed on Preview, Preprod, or any network holding real assets.
