import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../contract/managed/silent-pass/', import.meta.url));
const publicDir = fileURLToPath(new URL('../public/', import.meta.url));

for (const [folder, names] of [
  ['keys', ['claim.prover', 'claim.verifier']],
  ['zkir', ['claim.bzkir']],
]) {
  await mkdir(join(publicDir, folder), { recursive: true });
  for (const name of names) {
    await copyFile(join(source, folder, name), join(publicDir, folder, name));
  }
}

console.log('Synced claim proof assets to public/keys and public/zkir');
