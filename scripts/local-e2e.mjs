// Local-only integration test. The genesis seed below is public and valid only
// on the disposable `undeployed` devnet; never use it on a public network.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { filter, firstValueFrom, timeout } from 'rxjs';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import {
  DAppConnectorWalletAdapter,
  MidnightWalletProvider,
  inMemoryPrivateStateProvider,
} from '@midnight-ntwrk/testkit-js';
import { Contract, ledger, pureCircuits } from '../contract/managed/silent-pass/contract/index.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const genesisSeed = '0'.repeat(63) + '1';
const environment = {
  walletNetworkId: 'undeployed',
  networkId: 'undeployed',
  indexer: 'http://127.0.0.1:8088/api/v4/graphql',
  indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
  node: 'http://127.0.0.1:9944',
  nodeWS: 'ws://127.0.0.1:9944',
  proofServer: 'http://127.0.0.1:6300',
  faucet: undefined,
};
const logger = { info() {}, warn() {}, error() {}, debug() {}, trace() {} };

const waitForWallet = (wallet, predicate, label, ms = 300_000) =>
  firstValueFrom(
    wallet.state().pipe(
      filter(predicate),
      timeout({ first: ms }),
    ),
  ).catch((error) => {
    throw new Error(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  });

const synced = (progress) => progress?.isStrictlyComplete?.() === true;

setNetworkId('undeployed');
let walletProvider;
let assetServer;

try {
  console.log('1/8 Connecting the public genesis test wallet to the local devnet…');
  walletProvider = await MidnightWalletProvider.build(logger, environment, genesisSeed);
  await walletProvider.start(false);
  const state = await waitForWallet(
    walletProvider.wallet,
    (value) => synced(value.shielded.state.progress)
      && synced(value.unshielded.progress)
      && synced(value.dust.state.progress),
    'Wallet synchronization',
  );

  console.log('2/8 Ensuring the test wallet has spendable DUST…');
  if ((state.dust?.availableCoins.length ?? 0) === 0) {
    const unregistered = state.unshielded.availableCoins.filter(
      (coin) => coin.meta.registeredForDustGeneration === false,
    );
    if (unregistered.length > 0) {
      const recipe = await walletProvider.wallet.registerNightUtxosForDustGeneration(
        unregistered,
        walletProvider.unshieldedKeystore.getPublicKey(),
        (payload) => walletProvider.unshieldedKeystore.signData(payload),
      );
      await walletProvider.wallet.submitTransaction(
        await walletProvider.wallet.finalizeRecipe(recipe),
      );
    }
    await waitForWallet(
      walletProvider.wallet,
      (value) => (value.dust?.availableCoins.length ?? 0) >= 1,
      'Spendable DUST',
    );
  }

  const keys = new NodeZkConfigProvider(resolve(root, 'contract/managed/silent-pass'));
  const providers = {
    privateStateProvider: inMemoryPrivateStateProvider(),
    publicDataProvider: indexerPublicDataProvider(environment.indexer, environment.indexerWS),
    zkConfigProvider: keys,
    proofProvider: httpClientProofProvider(environment.proofServer, keys),
    walletProvider,
    midnightProvider: walletProvider,
  };
  const compiledContract = CompiledContract.make('SilentPass', Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(resolve(root, 'contract/managed/silent-pass')),
  );
  const secret = randomBytes(32);
  const commitment = pureCircuits.makeCommitment(secret);

  console.log('3/8 Deploying Silent Pass…');
  const deployed = await deployContract(providers, {
    compiledContract,
    args: [commitment],
  });
  const address = deployed.deployTxData.public.contractAddress;
  const initial = await providers.publicDataProvider.queryContractState(address);
  assert.ok(initial, 'deployed contract must be queryable');
  assert.equal(toHex(ledger(initial.data).commitment), toHex(commitment));
  assert.equal(ledger(initial.data).claimed, false);

  console.log('4/8 Joining the deployed contract and claiming once…');
  const joined = await findDeployedContract(providers, { compiledContract, contractAddress: address });
  const wrong = new Uint8Array(32);
  if (toHex(wrong) === toHex(secret)) wrong[0] = 1;
  await assert.rejects(() => joined.callTx.claim(wrong), /Secret does not match/i);
  const claim = await joined.callTx.claim(secret);
  const after = await providers.publicDataProvider.queryContractState(address);
  assert.ok(after, 'claimed contract must be queryable');
  assert.equal(ledger(after.data).claimed, true);

  console.log('5/8 Verifying replay is rejected…');
  await assert.rejects(() => joined.callTx.claim(secret), /already claimed/i);
  console.log(`Direct SDK PASS address=${address} claimTx=${claim.public.txHash}`);

  console.log('6/8 Starting a local proof-asset endpoint for the connector path…');
  assetServer = createServer(async (request, response) => {
    const asset = request.url?.replace(/^\//, '') ?? '';
    if (!/^(keys\/claim\.(prover|verifier)|zkir\/claim\.bzkir)$/.test(asset)) {
      response.writeHead(404).end();
      return;
    }
    try {
      const contents = await readFile(resolve(root, 'public', asset));
      response.writeHead(200, { 'Content-Type': 'application/octet-stream' });
      response.end(contents);
    } catch {
      response.writeHead(500).end();
    }
  });
  await new Promise((done) => assetServer.listen(0, '127.0.0.1', done));
  const port = assetServer.address().port;
  const adapter = new DAppConnectorWalletAdapter(walletProvider, environment);
  globalThis.window = {
    midnight: {
      localTestWallet: {
        apiVersion: '4.0.1',
        connect: async (networkId) => {
          assert.equal(networkId, 'undeployed');
          return adapter;
        },
      },
    },
    location: {
      origin: `http://127.0.0.1:${port}`,
      href: `http://127.0.0.1:${port}/`,
    },
    WebSocket,
  };

  console.log('7/8 Deploying through the app’s DApp Connector route…');
  const { MidnightSession } = await import('../src/network/midnight.ts');
  const session = await MidnightSession.connect('undeployed');
  const connectorSecret = randomBytes(32);
  const connectorDeploy = await session.deploy(connectorSecret);
  assert.equal(connectorDeploy.state.claimed, false);
  assert.equal(
    connectorDeploy.state.commitment,
    toHex(pureCircuits.makeCommitment(connectorSecret)),
  );

  console.log('8/8 Reconnecting, then rejecting an incorrect secret, claiming once, and rejecting replay…');
  const resumedSession = await MidnightSession.connect('undeployed');
  assert.equal((await resumedSession.read(connectorDeploy.address)).claimed, false);
  const connectorWrong = new Uint8Array(32);
  if (toHex(connectorWrong) === toHex(connectorSecret)) connectorWrong[0] = 1;
  await assert.rejects(
    () => resumedSession.claim(connectorDeploy.address, connectorWrong),
    /Secret does not match/i,
  );
  assert.equal((await resumedSession.read(connectorDeploy.address)).claimed, false);
  const connectorClaim = await resumedSession.claim(connectorDeploy.address, connectorSecret);
  assert.equal(connectorClaim.claimed, true);
  await assert.rejects(
    () => resumedSession.claim(connectorDeploy.address, connectorSecret),
    /already claimed/i,
  );
  assert.equal((await resumedSession.read(connectorDeploy.address)).claimed, true);
  console.log(`Connector SDK PASS address=${connectorDeploy.address}`);
} finally {
  await walletProvider?.stop();
  if (assetServer) {
    await new Promise((done) => assetServer.close(done));
  }
  delete globalThis.window;
}
