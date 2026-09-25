import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertSpendableDust,
  networkErrorMessage,
  requiresWalletReconnect,
} from '../src/network/errors.ts';

test('a zero tDUST balance stops before transaction submission', () => {
  assert.throws(
    () => assertSpendableDust({ balance: 0n, cap: 10n }),
    /Generate tDUST.*거래는 전송되지 않았습니다/,
  );
  assert.throws(
    () => assertSpendableDust({ balance: 0n, cap: 0n }),
    /생성 한도가 모두 0.*거래는 전송되지 않았습니다/,
  );
  assert.doesNotThrow(() => assertSpendableDust({ balance: 1n, cap: 1n }));
});

test('wallet instance failures are sanitized and require reconnection', () => {
  const error = new Error('Could not load midnight wallet for account private-account-id');
  const message = networkErrorMessage(error);

  assert.equal(requiresWalletReconnect(error), true);
  assert.match(message, /지갑 인스턴스를 불러오지 못했습니다/);
  assert.doesNotMatch(message, /private-account-id/);
});

test('connector disconnection receives a recovery message', () => {
  const error = Object.assign(new Error('socket disconnected'), {
    type: 'DAppConnectorAPIError',
    code: 'Disconnected',
    reason: 'Normal Closure',
  });

  assert.equal(requiresWalletReconnect(error), true);
  assert.match(networkErrorMessage(error), /Preview 네트워크의 연결이 끊어졌습니다/);
});

test('contract errors remain available to the user', () => {
  const error = new Error('Secret does not match commitment');

  assert.equal(requiresWalletReconnect(error), false);
  assert.equal(networkErrorMessage(error), error.message);
});
