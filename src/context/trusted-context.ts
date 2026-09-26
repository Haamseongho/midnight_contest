// Deployment-owned policy. Never load this policy from a holder URL or manifest.
export const TRUSTED_CONTEXT = Object.freeze({
  eventLabel: "Silent Pass · 공개 초대 소비 예제",
  network: "preview",
  address: "66e374b0cafdf387576cf29bcd5de16fb010f0e92ea10d6e6f1e2d6c4b99256c",
  commitment: "b1f9c1320db8846b5746b705e882813ff6efa66a357ace9d6b89425529126049",
  source: "https://github.com/Haamseongho/midnight_contest/blob/main/src/context/trusted-context.ts",
  version: "silent-pass-preview-example-v1",
  indexer: "https://indexer.preview.midnight.network/api/v4/graphql",
  indexerWs: "wss://indexer.preview.midnight.network/api/v4/graphql/ws",
});
export type TrustedContext = typeof TRUSTED_CONTEXT;
