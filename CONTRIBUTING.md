# Contributing

Contributions that improve the Compact contract, wallet integration, tests, accessibility, or documentation are welcome.

## Development setup

Requirements:

- Node.js 22 or newer
- npm
- Compact devtools with compiler 0.31.1
- Docker Desktop and Docker Compose for the local network integration test

Run the standard verification:

```sh
npm ci
npm run verify
```

Run the full local-network path separately:

```sh
docker compose -f devnet/compose.yml up -d
npm run test:local
docker compose -f devnet/compose.yml stop
```

## Pull requests

- Keep the public/private data boundary explicit in code and documentation.
- Add or update tests for behavioral changes.
- Do not commit generated proof assets, wallet seeds, secrets, or private keys.
- Use factual language and the Midnight terminology `DApp`, `Compact`, and `zero-knowledge proof`.
- Document security limitations instead of presenting experimental behavior as production-ready.

By contributing, you agree that your contribution is licensed under Apache-2.0.
